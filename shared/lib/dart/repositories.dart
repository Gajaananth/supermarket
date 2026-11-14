/// Domain Models & Repository Contracts for Multi-Store Supermarket Delivery Prototype
/// Built for Customer, Rider, and Admin Flutter apps with mock local state.

import 'dart:convert';

class Store {
  final String id;
  final String name;
  final String slug;
  final String address;
  final String city;
  final String province;
  final String phone;
  final String email;
  final double latitude;
  final double longitude;
  final String operatingHours;
  final String status;
  final double deliveryRadiusKm;
  final int activeOrdersCount;
  final double rating;
  final String image;

  Store({
    required this.id,
    required this.name,
    required this.slug,
    required this.address,
    required this.city,
    required this.province,
    required this.phone,
    required this.email,
    required this.latitude,
    required this.longitude,
    required this.operatingHours,
    required this.status,
    required this.deliveryRadiusKm,
    required this.activeOrdersCount,
    required this.rating,
    required this.image,
  });

  factory Store.fromJson(Map<String, dynamic> json) {
    return Store(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      address: json['address'],
      city: json['city'],
      province: json['province'],
      phone: json['phone'],
      email: json['email'],
      latitude: (json['coordinates']?['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['coordinates']?['longitude'] as num?)?.toDouble() ?? 0.0,
      operatingHours: json['operatingHours'] ?? '',
      status: json['status'] ?? 'active',
      deliveryRadiusKm: (json['deliveryRadiusKm'] as num?)?.toDouble() ?? 5.0,
      activeOrdersCount: json['activeOrdersCount'] ?? 0,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      image: json['image'] ?? '',
    );
  }
}

class Category {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String icon;
  final String color;
  final int productCount;
  final String image;

  Category({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.icon,
    required this.color,
    required this.productCount,
    required this.image,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      description: json['description'] ?? '',
      icon: json['icon'] ?? '',
      color: json['color'] ?? '#168BFF',
      productCount: json['productCount'] ?? 0,
      image: json['image'] ?? '',
    );
  }
}

class Product {
  final String id;
  final String name;
  final String categoryId;
  final String categoryName;
  final String unit;
  final double price;
  final double originalPrice;
  final int discountPercent;
  final bool isFeatured;
  final bool isPopular;
  final double rating;
  final int reviewCount;
  final String description;
  final String image;
  final bool inStock;
  final Map<String, int> stockByStore;

  Product({
    required this.id,
    required this.name,
    required this.categoryId,
    required this.categoryName,
    required this.unit,
    required this.price,
    required this.originalPrice,
    required this.discountPercent,
    required this.isFeatured,
    required this.isPopular,
    required this.rating,
    required this.reviewCount,
    required this.description,
    required this.image,
    required this.inStock,
    required this.stockByStore,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      categoryId: json['categoryId'],
      categoryName: json['categoryName'],
      unit: json['unit'],
      price: (json['price'] as num).toDouble(),
      originalPrice: (json['originalPrice'] as num).toDouble(),
      discountPercent: json['discountPercent'] ?? 0,
      isFeatured: json['isFeatured'] ?? false,
      isPopular: json['isPopular'] ?? false,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      reviewCount: json['reviewCount'] ?? 0,
      description: json['description'] ?? '',
      image: json['image'] ?? '',
      inStock: json['inStock'] ?? true,
      stockByStore: (json['stockByStore'] as Map<String, dynamic>?)?.map(
            (k, v) => MapEntry(k, v as int),
          ) ??
          {},
    );
  }
}

class CartItem {
  final Product product;
  int quantity;
  final String storeId;

  CartItem({
    required this.product,
    this.quantity = 1,
    required this.storeId,
  });

  double get totalPrice => product.price * quantity;
}

class OrderItem {
  final String productId;
  final String productName;
  final int quantity;
  final double unitPrice;
  final double totalPrice;
  final String unit;

  OrderItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    required this.unit,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['productId'],
      productName: json['productName'],
      quantity: json['quantity'],
      unitPrice: (json['unitPrice'] as num).toDouble(),
      totalPrice: (json['totalPrice'] as num).toDouble(),
      unit: json['unit'] ?? '',
    );
  }
}

class Order {
  final String id;
  final String orderNumber;
  final String customerId;
  final String customerName;
  final String customerPhone;
  final String storeId;
  final String storeName;
  final String deliveryAddress;
  final List<OrderItem> items;
  final double subtotal;
  final double deliveryFee;
  final double discount;
  final double total;
  final String paymentMethod;
  final String paymentStatus;
  String orderStatus;
  String? riderId;
  String? riderName;
  String? riderPhone;
  final String createdAt;
  final String estimatedDelivery;

  Order({
    required this.id,
    required this.orderNumber,
    required this.customerId,
    required this.customerName,
    required this.customerPhone,
    required this.storeId,
    required this.storeName,
    required this.deliveryAddress,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.discount,
    required this.total,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.orderStatus,
    this.riderId,
    this.riderName,
    this.riderPhone,
    required this.createdAt,
    required this.estimatedDelivery,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      orderNumber: json['orderNumber'],
      customerId: json['customerId'],
      customerName: json['customerName'],
      customerPhone: json['customerPhone'] ?? '',
      storeId: json['storeId'],
      storeName: json['storeName'],
      deliveryAddress: "${json['deliveryAddress']?['street']}, ${json['deliveryAddress']?['city']}",
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => OrderItem.fromJson(item))
              .toList() ??
          [],
      subtotal: (json['subtotal'] as num).toDouble(),
      deliveryFee: (json['deliveryFee'] as num).toDouble(),
      discount: (json['discount'] as num).toDouble(),
      total: (json['total'] as num).toDouble(),
      paymentMethod: json['paymentMethod'],
      paymentStatus: json['paymentStatus'],
      orderStatus: json['orderStatus'],
      riderId: json['riderId'],
      riderName: json['riderName'],
      riderPhone: json['riderPhone'],
      createdAt: json['createdAt'],
      estimatedDelivery: json['estimatedDelivery'],
    );
  }
}

