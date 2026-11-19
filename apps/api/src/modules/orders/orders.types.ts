import { Prisma } from '@prisma/client';

export const orderInclude = {
  items: {
    include: {
      storeProduct: {
        include: {
          masterProduct: true,
        },
      },
    },
  },
  store: {
    select: {
      id: true,
      code: true,
      name: true,
      locality: true,
    },
  },
  customer: {
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
    },
  },
  deliveryZone: true,
  rider: {
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
    },
  },
  timeline: {
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  campaigns: {
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
} as const;

export type OrderRecord = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;
