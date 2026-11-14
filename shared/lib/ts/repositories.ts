/**
 * Domain Models & Repository Contracts for Multi-Store Supermarket Delivery Prototype
 * Architected for clean replacement with REST/GraphQL APIs in future phases.
 */

export interface Store {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  operatingHours: string;
  status: 'active' | 'inactive';
  deliveryRadiusKm: number;
  activeOrdersCount: number;
  rating: number;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  productCount: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  isFeatured: boolean;
  isPopular: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  inStock: boolean;
  stockByStore: Record<string, number>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  storeId: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  storeId: string;
  storeName: string;
  deliveryAddress: {
    street: string;
    city: string;
    instructions?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  orderStatus: OrderStatus;
  riderId: string | null;
  riderName: string | null;
  riderPhone: string | null;
  createdAt: string;
  estimatedDelivery: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehiclePlate: string;
  avatar: string;
  status: 'online' | 'offline' | 'on_delivery';
  currentStoreId: string;
  currentCoordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  completedDeliveries: number;
  todayDeliveries: number;
  todayEarningsLKR: number;
  joinedDate: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  defaultAddress: {
    id: string;
    label: string;
    street: string;
    city: string;
    postalCode: string;
    instructions?: string;
  };
  loyaltyPoints: number;
  totalOrders: number;
  joinedDate: string;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  storeStocks: {
    storeId: string;
    storeName: string;
    quantity: number;
    minThreshold: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
  }[];
  lastRestocked: string;
}

// -------------------------------------------------------------
// REPOSITORY INTERFACES
// -------------------------------------------------------------

export interface IStoreRepository {
  getAllStores(): Promise<Store[]>;
  getStoreById(id: string): Promise<Store | null>;
  updateStoreStatus(id: string, status: 'active' | 'inactive'): Promise<boolean>;
}

export interface IProductRepository {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  addProduct(product: Omit<Product, 'id'>): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | null>;
}

export interface ICategoryRepository {
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
}

export interface IOrderRepository {
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByStore(storeId: string): Promise<Order[]>;
  createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean>;
  assignRider(orderId: string, riderId: string): Promise<boolean>;
}

export interface IRiderRepository {
  getAllRiders(): Promise<Rider[]>;
  getRiderById(id: string): Promise<Rider | null>;
  updateRiderStatus(riderId: string, status: 'online' | 'offline' | 'on_delivery'): Promise<boolean>;
}

export interface ICustomerRepository {
  getAllCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | null>;
}

export interface IInventoryRepository {
  getInventory(): Promise<InventoryItem[]>;
  adjustStock(productId: string, storeId: string, deltaQuantity: number): Promise<boolean>;
}

