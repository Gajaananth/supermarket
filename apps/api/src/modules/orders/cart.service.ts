import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CartItemInputDto, CartItemQuantityDto } from './dto/cart.dto';

const cartInclude = {
  items: {
    include: {
      storeProduct: {
        include: { masterProduct: { include: { category: true, barcodes: true } } },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async get(storeId: string, user: UserPayload) {
    const customer = await this.customer(user);
    await this.assertActiveStore(storeId);
    const cart = await this.prisma.cart.findUnique({
      where: { customerId_storeId: { customerId: customer.id, storeId } },
      include: cartInclude,
    });
    return cart ? toCustomerCart(cart) : { storeId, items: [] };
  }

  async add(storeId: string, dto: CartItemInputDto, user: UserPayload) {
    const customer = await this.customer(user);
    await this.assertActiveStore(storeId);
    return this.prisma.$transaction(async (tx) => {
      const storeProduct = await this.availableStoreProduct(tx, storeId, dto.storeProductId);
      const cart = await tx.cart.upsert({
        where: { customerId_storeId: { customerId: customer.id, storeId } },
        create: { customerId: customer.id, storeId },
        update: {},
      });
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Cart" WHERE "id" = ${cart.id}::uuid FOR UPDATE
      `;
      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_storeProductId: { cartId: cart.id, storeProductId: storeProduct.id },
        },
      });
      const quantity = (existing?.quantity ?? 0) + dto.quantity;
      if (quantity > 1000) throw new BadRequestException('Cart item quantity cannot exceed 1000');
      this.assertQuantityAvailable(storeProduct, quantity);
      if (existing) {
        await tx.cartItem.update({ where: { id: existing.id }, data: { quantity } });
      } else {
        await tx.cartItem.create({
          data: { cartId: cart.id, storeProductId: storeProduct.id, quantity },
        });
      }
      return toCustomerCart(await tx.cart.findUniqueOrThrow({
        where: { id: cart.id },
        include: cartInclude,
      }));
    });
  }

  async setQuantity(
    storeId: string,
    storeProductId: string,
    dto: CartItemQuantityDto,
    user: UserPayload,
  ) {
    const customer = await this.customer(user);
    await this.assertActiveStore(storeId);
    return this.prisma.$transaction(async (tx) => {
      const storeProduct = await this.availableStoreProduct(tx, storeId, storeProductId);
      this.assertQuantityAvailable(storeProduct, dto.quantity);
      const cart = await tx.cart.findUnique({
        where: { customerId_storeId: { customerId: customer.id, storeId } },
      });
      if (!cart) throw new NotFoundException('Cart item not found');
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Cart" WHERE "id" = ${cart.id}::uuid FOR UPDATE
      `;
      const item = await tx.cartItem.findUnique({
        where: { cartId_storeProductId: { cartId: cart.id, storeProductId } },
      });
      if (!item) throw new NotFoundException('Cart item not found');
      await tx.cartItem.update({ where: { id: item.id }, data: { quantity: dto.quantity } });
      return toCustomerCart(await tx.cart.findUniqueOrThrow({
        where: { id: cart.id },
        include: cartInclude,
      }));
    });
  }

  async remove(storeId: string, storeProductId: string, user: UserPayload) {
    const customer = await this.customer(user);
    await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { customerId_storeId: { customerId: customer.id, storeId } },
      });
      if (!cart) throw new NotFoundException('Cart item not found');
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Cart" WHERE "id" = ${cart.id}::uuid FOR UPDATE
      `;
      const result = await tx.cartItem.deleteMany({
        where: { cartId: cart.id, storeProductId },
      });
      if (result.count !== 1) throw new NotFoundException('Cart item not found');
    });
    return this.get(storeId, user);
  }

  private async customer(user: UserPayload) {
    if (user.role !== Role.CUSTOMER) {
      throw new NotFoundException('Customer profile not found');
    }
    const customer = await this.prisma.customerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');
    return customer;
  }

  private async assertActiveStore(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { isActive: true },
    });
    if (!store?.isActive) throw new NotFoundException('Active store not found');
  }

  private async availableStoreProduct(
    tx: Prisma.TransactionClient,
    storeId: string,
    storeProductId: string,
  ) {
    const row = await tx.storeProduct.findUnique({
      where: { id: storeProductId },
      include: { masterProduct: { select: { isActive: true } } },
    });
    if (!row || row.storeId !== storeId) {
      throw new NotFoundException('Store catalogue item not found');
    }
    if (!row.isAvailable || !row.masterProduct.isActive) {
      throw new ConflictException('This store catalogue item is unavailable');
    }
    return row;
  }

  private assertQuantityAvailable(
    row: { quantityOnHand: number; quantityReserved: number },
    quantity: number,
  ) {
    if (row.quantityOnHand - row.quantityReserved < quantity) {
      throw new ConflictException('Requested quantity is not currently available');
    }
  }

}

function toCustomerCart(cart: Prisma.CartGetPayload<{ include: typeof cartInclude }>) {
  return {
    id: cart.id,
    storeId: cart.storeId,
    items: cart.items.map((item) => ({
      id: item.id,
      storeProductId: item.storeProductId,
      quantity: item.quantity,
      unitPrice: item.storeProduct.customPrice ??
        item.storeProduct.masterProduct.baseSellingPrice,
      isAvailable: item.storeProduct.isAvailable &&
        item.storeProduct.masterProduct.isActive,
      product: {
        id: item.storeProduct.masterProduct.id,
        name: item.storeProduct.masterProduct.name,
        nameTa: item.storeProduct.masterProduct.nameTa,
        description: item.storeProduct.masterProduct.description,
        unit: item.storeProduct.masterProduct.unit,
        imageUrl: item.storeProduct.masterProduct.imageUrl,
        category: item.storeProduct.masterProduct.category,
      },
    })),
  };
}
