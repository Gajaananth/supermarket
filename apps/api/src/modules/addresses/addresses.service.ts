import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { UserPayload } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: UserPayload) {
    const customer = await this.customer(user);
    return this.prisma.address.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(dto: CreateAddressDto, user: UserPayload) {
    const customer = await this.customer(user);
    return this.prisma.$transaction(async (tx) => {
      await this.lockCustomer(tx, customer.id);
      const hasDefault = await tx.address.findFirst({
        where: { customerId: customer.id, isDefault: true },
        select: { id: true },
      });
      const isDefault = dto.isDefault ?? !hasDefault;
      if (isDefault) {
        await tx.address.updateMany({
          where: { customerId: customer.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      const { isDefault: _requestedDefault, ...fields } = dto;
      return tx.address.create({
        data: {
          ...fields,
          customerId: customer.id,
          isDefault,
        },
      });
    });
  }

  async update(id: string, dto: UpdateAddressDto, user: UserPayload) {
    const customer = await this.customer(user);
    return this.prisma.$transaction(async (tx) => {
      await this.lockCustomer(tx, customer.id);
      await this.findOwned(tx, id, customer.id);
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { customerId: customer.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.address.update({
        where: { id },
        data: dto,
      });
    });
  }

  async remove(id: string, user: UserPayload) {
    const customer = await this.customer(user);
    await this.prisma.$transaction(async (tx) => {
      await this.lockCustomer(tx, customer.id);
      await this.findOwned(tx, id, customer.id);
      const existingOrder = await tx.order.findFirst({
        where: { deliveryAddressId: id },
        select: { id: true },
      });
      if (existingOrder) {
        throw new ConflictException('An address used by an order cannot be deleted');
      }
      await tx.address.delete({ where: { id } });
    });
    return { deleted: true };
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

  private async lockCustomer(
    tx: Prisma.TransactionClient,
    customerId: string,
  ) {
    await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "CustomerProfile" WHERE "id" = ${customerId}::uuid FOR UPDATE
    `;
  }

  private async findOwned(
    tx: Prisma.TransactionClient,
    id: string,
    customerId: string,
  ) {
    const address = await tx.address.findFirst({
      where: { id, customerId },
      select: { id: true },
    });
    if (!address) throw new NotFoundException('Delivery address not found');
    return address;
  }
}
