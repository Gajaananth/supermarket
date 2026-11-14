/// BuyMe Batticaloa - Core Domain Models

class BuyMeStore {
  final String id;
  final String name;
  final String code;
  final String locality;
  final String district;
  final String address;
  final String phone;
  final String openingHours;
  final double deliveryRadiusKm;
  final double deliveryFeeLkr;
  final bool isActive;

  const BuyMeStore({
    required this.id,
    required this.name,
    required this.code,
    required this.locality,
    this.district = "Batticaloa",
    required this.address,
    required this.phone,
    required this.openingHours,
    required this.deliveryRadiusKm,
    this.deliveryFeeLkr = 250.0,
    this.isActive = true,
  });
}

class BuyMeCategory {
  final String id;
  final String name;
  final String nameTa;
  final String icon;
  final int itemCount;

  const BuyMeCategory({
    required this.id,
    required this.name,
    required this.nameTa,
    required this.icon,
    required this.itemCount,
  });
}

class BuyMeProduct {
  final String id;
  final String name;
  final String nameTa;
  final String brand;
  final String categoryId;
  final String unit;
  final double price;
  final double? originalPrice;
  final int? discountPercent;
  final bool isFeatured;
  final bool isOffer;
  final double rating;
  final int reviewCount;
  final int stock;
  final String description;
  final String descriptionTa;
  final String img;
  final String icon;

  const BuyMeProduct({
    required this.id,
    required this.name,
    required this.nameTa,
    required this.brand,
    required this.categoryId,
    required this.unit,
    required this.price,
    this.originalPrice,
    this.discountPercent,
    this.isFeatured = false,
    this.isOffer = false,
    this.rating = 4.8,
    this.reviewCount = 100,
    required this.stock,
    required this.description,
    required this.descriptionTa,
    required this.img,
    required this.icon,
  });
}

class BuyMeCartItem {
  final BuyMeProduct product;
  int quantity;

  BuyMeCartItem({
    required this.product,
    this.quantity = 1,
  });

  double get subtotal => product.price * quantity;
}

enum BuyMeOrderStatus {
  pending,
  confirmed,
  preparing,
  readyForPickup,
  outForDelivery,
  delivered,
  cancelled,
}

class BuyMeOrder {
  final String id;
  final String customerName;
  final String customerPhone;
  final String deliveryAddress;
  final String storeId;
  final String storeName;
  final List<BuyMeCartItem> items;
  final double itemsTotal;
  final double deliveryFee;
  final double totalAmount;
  BuyMeOrderStatus status;
  final String paymentMethod;
  String paymentStatus;
  String? riderName;
  String? riderPhone;
  final DateTime createdAt;
  final String estimatedDelivery;

  BuyMeOrder({
    required this.id,
    required this.customerName,
    required this.customerPhone,
    required this.deliveryAddress,
    required this.storeId,
    required this.storeName,
    required this.items,
    required this.itemsTotal,
    this.deliveryFee = 250.0,
    required this.totalAmount,
    required this.status,
    this.paymentMethod = "COD",
    this.paymentStatus = "pending",
    this.riderName,
    this.riderPhone,
    required this.createdAt,
    required this.estimatedDelivery,
  });
}

class BuyMeAddress {
  final String id;
  final String label;
  final String street;
  final String locality;
  final bool isDefault;

  const BuyMeAddress({
    required this.id,
    required this.label,
    required this.street,
    required this.locality,
    this.isDefault = false,
  });
}

