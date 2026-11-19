import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, SearchProductsDto, UpdateProductDto } from './dto/product.dto';

const productInclude = {
  category: true,
  barcodes: { orderBy: { barcode: 'asc' as const } },
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: SearchProductsDto) {
    const search = query.query?.trim();
    return this.prisma.masterProduct.findMany({
      where: {
        isActive: true,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { nameTa: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { equals: search, mode: 'insensitive' } },
                { barcodes: { some: { barcode: { equals: search, mode: 'insensitive' } } } },
              ],
            }
          : {}),
      },
      include: productInclude,
      orderBy: { name: 'asc' },
      take: query.limit ?? 50,
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.masterProduct.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product || !product.isActive) throw new NotFoundException('Product not found');
    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.prisma.masterProduct.findFirst({
      where: {
        isActive: true,
        OR: [
          { barcode: { equals: barcode, mode: 'insensitive' } },
          { barcodes: { some: { barcode: { equals: barcode, mode: 'insensitive' } } } },
        ],
      },
      include: productInclude,
    });
    if (!product) throw new NotFoundException('No active product matches this barcode');
    return product;
  }

  async create(dto: CreateProductDto, user: UserPayload) {
    const barcodes = this.normalizeBarcodes(dto.barcodes);
    return this.prisma.$transaction(async (tx) => {
      await this.lockBarcodes(tx, barcodes);
      await this.assertBarcodesAvailable(tx, barcodes);
      if (await tx.masterProduct.findFirst({ where: { sku: dto.sku } })) {
        throw new ConflictException('Product SKU already exists');
      }
      const category = await tx.category.findUnique({ where: { id: dto.categoryId } });
      if (!category || !category.isActive) {
        throw new NotFoundException('Active category not found');
      }

      const { barcodes: _barcodes, ...fields } = dto;
      const product = await tx.masterProduct.create({
        data: {
          ...fields,
          barcode: barcodes[0],
          barcodes: {
            create: barcodes.slice(1).map((barcode) => ({ barcode })),
          },
        },
        include: productInclude,
      });
      await this.audit(tx, user, 'PRODUCT_CREATE', product.id, {
        sku: product.sku,
        barcodeCount: barcodes.length,
      });
      return product;
    });
  }

  async update(id: string, dto: UpdateProductDto, user: UserPayload) {
    const existing = await this.findOne(id);
    const barcodes = dto.barcodes
      ? this.normalizeBarcodes(dto.barcodes)
      : undefined;

    return this.prisma.$transaction(async (tx) => {
      if (barcodes) {
        await this.lockBarcodes(tx, barcodes);
        await this.assertBarcodesAvailable(tx, barcodes, id);
      }
      if (dto.sku && dto.sku !== existing.sku) {
        const duplicate = await tx.masterProduct.findUnique({ where: { sku: dto.sku } });
        if (duplicate) throw new ConflictException('Product SKU already exists');
      }
      if (dto.categoryId) {
        const category = await tx.category.findUnique({ where: { id: dto.categoryId } });
        if (!category || !category.isActive) {
          throw new NotFoundException('Active category not found');
        }
      }

      const { barcodes: _barcodes, ...fields } = dto;
      const product = await tx.masterProduct.update({
        where: { id },
        data: {
          ...fields,
          ...(barcodes
            ? {
                barcode: barcodes[0],
                barcodes: {
                  deleteMany: {},
                  create: barcodes.slice(1).map((barcode) => ({ barcode })),
                },
              }
            : {}),
        },
        include: productInclude,
      });
      await this.audit(tx, user, 'PRODUCT_UPDATE', id, {
        changedFields: Object.keys(dto),
      });
      return product;
    });
  }

  async deactivate(id: string, user: UserPayload) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.masterProduct.update({
        where: { id },
        data: { isActive: false },
      });
      await this.audit(tx, user, 'PRODUCT_DEACTIVATE', id, {
        sku: product.sku,
      });
      return product;
    });
  }

  async setImageUrl(id: string, imageUrl: string, user: UserPayload) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.masterProduct.update({
        where: { id },
        data: { imageUrl },
        include: productInclude,
      });
      await this.audit(tx, user, 'PRODUCT_IMAGE_UPLOAD', id, { imageUrl });
      return product;
    });
  }

  private normalizeBarcodes(barcodes: string[]): string[] {
    const normalized = barcodes.map((barcode) => barcode.trim());
    if (normalized.some((barcode) => !barcode || barcode.length > 100)) {
      throw new ConflictException('Barcodes must be non-empty and at most 100 characters');
    }
    const unique = new Set(normalized.map((barcode) => barcode.toLowerCase()));
    if (unique.size !== normalized.length) {
      throw new ConflictException('Product barcodes must be unique');
    }
    return normalized;
  }

  private async lockBarcodes(
    tx: Prisma.TransactionClient,
    barcodes: string[],
  ): Promise<void> {
    for (const barcode of [...barcodes].sort((a, b) => a.localeCompare(b))) {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${barcode.toLowerCase()}, 0)) IS NULL`;
    }
  }

  private async assertBarcodesAvailable(
    tx: Prisma.TransactionClient,
    barcodes: string[],
    excludeProductId?: string,
  ): Promise<void> {
    const duplicate = await tx.masterProduct.findFirst({
      where: {
        ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
        OR: [
          { barcode: { in: barcodes, mode: 'insensitive' } },
          { barcodes: { some: { barcode: { in: barcodes, mode: 'insensitive' } } } },
        ],
      },
    });
    if (duplicate) throw new ConflictException('A barcode is already assigned to another product');
  }

  private audit(
    tx: Prisma.TransactionClient,
    user: UserPayload,
    action: string,
    id: string,
    values: Prisma.InputJsonObject,
  ) {
    return tx.auditLog.create({
      data: {
        userId: user.id,
        userRole: Role.SUPER_ADMIN,
        action,
        entityType: 'MasterProduct',
        entityId: id,
        newValues: values,
      },
    });
  }
}
