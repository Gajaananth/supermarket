import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category || !category.isActive) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async create(dto: CreateCategoryDto, user: UserPayload) {
    if (await this.prisma.category.findFirst({
      where: { OR: [{ name: dto.name }, { slug: dto.slug }] },
    })) {
      throw new ConflictException('Category name or slug already exists');
    }
    return this.prisma.$transaction(async (tx) => {
      const category = await tx.category.create({ data: dto });
      await this.audit(tx, user, 'CATEGORY_CREATE', category.id, {
        name: category.name,
        slug: category.slug,
      });
      return category;
    });
  }

  async update(id: string, dto: UpdateCategoryDto, user: UserPayload) {
    await this.findOne(id);
    if (dto.name || dto.slug) {
      const duplicate = await this.prisma.category.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(dto.name ? [{ name: dto.name }] : []),
            ...(dto.slug ? [{ slug: dto.slug }] : []),
          ],
        },
      });
      if (duplicate) {
        throw new ConflictException('Category name or slug already exists');
      }
    }
    return this.prisma.$transaction(async (tx) => {
      const category = await tx.category.update({ where: { id }, data: dto });
      await this.audit(tx, user, 'CATEGORY_UPDATE', id, {
        changedFields: Object.keys(dto),
      });
      return category;
    });
  }

  async deactivate(id: string, user: UserPayload) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const category = await tx.category.update({
        where: { id },
        data: { isActive: false },
      });
      await this.audit(tx, user, 'CATEGORY_DEACTIVATE', id, {
        name: category.name,
      });
      return category;
    });
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
        entityType: 'Category',
        entityId: id,
        newValues: values,
      },
    });
  }
}
