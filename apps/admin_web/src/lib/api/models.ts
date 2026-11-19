export interface AdminUser {
  id: string;
  role: 'SUPER_ADMIN' | 'STORE_ADMIN';
  fullName: string;
  email: string | null;
  phone: string | null;
}

export interface Category {
  id: string;
  name: string;
  nameTa?: string | null;
  slug: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameTa?: string | null;
  barcode: string;
  barcodes: Array<{ id: string; barcode: string }>;
  categoryId: string;
  category: Category;
  unit: string;
  costPrice: number | string;
  baseSellingPrice: number | string;
  isActive: boolean;
  imageUrl?: string | null;
}

export interface WarehouseStock {
  id: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderLevel: number;
  masterProduct: Product;
}

export interface Store {
  id: string;
  code: string;
  name: string;
  slug?: string;
  address?: string;
  locality?: string;
  contactPhone?: string;
  isActive: boolean;
  openingTime: string;
  closingTime: string;
  serviceRadiusKm: number | string;
  minOrderAmount: number | string;
  freeDeliveryThreshold: number | string;
  cashHoldThreshold: number | string;
  cashHoldMaxHours: number;
  deliveryZones: Array<{
    id: string;
    zoneNumber: number;
    name: string;
    baseFee: number | string;
    minOrderForFreeDelivery: number | string;
    estimatedDeliveryMins: number;
    isActive: boolean;
  }>;
}

export interface StoreList {
  count: number;
  stores: Store[];
}

export interface TransferItem {
  id: string;
  masterProductId: string;
  requestedQuantity: number;
  dispatchedQuantity: number;
  receivedQuantity: number | null;
  discrepancyQuantity: number | null;
  itemStatus: string;
  masterProduct: Product;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  status: 'DRAFT' | 'DISPATCHED' | 'RECEIVED_FULL' | 'RECEIVED_PARTIAL' | 'RESOLVED' | 'CANCELLED';
  toStoreId: string;
  toStore: Pick<Store, 'id' | 'code' | 'name'>;
  createdAt: string;
  items: TransferItem[];
  resolutionNote?: string | null;
}

export interface RiderReviewItem {
  id: string;
  bikeNumber: string | null;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
  };
}

export interface RiderReviewQueue {
  items: RiderReviewItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface RiderReviewDetails extends RiderReviewItem {
  riderType: string | null;
  assignedStoreId: string | null;
  rejectionReason: string | null;
  documents: {
    drivingLicenceAvailable: boolean;
    vehicleLicenceAvailable: boolean;
  };
}

export interface ReportOverview {
  from: string;
  to: string;
  storeId: string | null;
  summary: {
    orders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    revenue: number;
  };
  daily: Array<{
    day: string;
    orders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    revenue: number;
  }>;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number | string;
  deliveryFee: number | string;
  discount: number | string;
  totalAmount: number | string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number | string;
    totalPrice: number | string;
    storeProduct: {
      masterProduct: {
        name: string;
        unit: string;
      };
    };
  }>;
  customer: {
    user: {
      fullName: string;
      phone: string | null;
    };
  };
  rider: {
    user: {
      fullName: string;
      phone: string | null;
    };
  } | null;
}

export interface EligibleRider {
  id: string;
  riderType: string;
  bikeNumber: string | null;
  user: {
    fullName: string;
    phone: string | null;
  };
}

export interface StoreStockItem {
  id: string;
  masterProductId: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderLevel: number;
  isAvailable: boolean;
  customPrice: number | string | null;
  masterProduct: Product;
}

export interface StoreAlert {
  id: string;
  alertType: string;
  details: unknown;
  createdAt: string;
  masterProduct: Pick<Product, "id" | "name" | "sku"> | null;
}

export interface DepositVerificationItem {
  id: string;
  depositNumber: string;
  riderId: string;
  storeId: string;
  amount: number | string;
  bankRefNumber: string;
  status: "PENDING" | "VARIANCE" | "APPROVED" | "APPROVED_WITH_VARIANCE" | "REJECTED";
  submittedAt: string;
  rejectionReason: string | null;
  receivedAmount: number | string | null;
  varianceAmount: number | string | null;
  varianceReason: string | null;
  rider: {
    id: string;
    user: {
      fullName: string;
      phone: string | null;
      email: string | null;
    };
  };
}

export interface ApiEnvelope<T> {
  success: true;
  statusCode: number;
  timestamp: string;
  data: T;
}
