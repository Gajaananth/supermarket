typedef JsonMap = Map<String, Object?>;

class LatLngPoint {
  const LatLngPoint({required this.latitude, required this.longitude});

  final double latitude;
  final double longitude;
}

JsonMap jsonMap(Object? value, {String field = 'response'}) {
  if (value is Map<String, dynamic>) return Map<String, Object?>.from(value);
  if (value is Map) return value.map((key, value) => MapEntry('$key', value));
  throw FormatException('Expected $field to be an object');
}

List<Object?> jsonList(Object? value, {String field = 'response'}) {
  if (value is List) return value.cast<Object?>();
  throw FormatException('Expected $field to be a list');
}

String requiredString(JsonMap json, String key) {
  final value = json[key];
  if (value is String && value.isNotEmpty) return value;
  throw FormatException('Expected "$key" in API response');
}

String? optionalString(JsonMap json, String key) {
  final value = json[key];
  return value is String ? value : null;
}

double requiredNumber(JsonMap json, String key) {
  final value = json[key];
  if (value is num) return value.toDouble();
  if (value is String) {
    final parsed = double.tryParse(value);
    if (parsed != null) return parsed;
  }
  throw FormatException('Expected numeric "$key" in API response');
}

int requiredInt(JsonMap json, String key) {
  final value = json[key];
  if (value is int) return value;
  if (value is num) return value.toInt();
  throw FormatException('Expected integer "$key" in API response');
}

class Store {
  const Store({
    required this.id,
    required this.name,
    required this.code,
    required this.locality,
    required this.latitude,
    required this.longitude,
    this.distanceKm,
  });

  final String id;
  final String name;
  final String code;
  final String locality;
  final double latitude;
  final double longitude;
  final double? distanceKm;

  factory Store.fromJson(JsonMap json, {double? distanceKm}) {
    return Store(
      id: requiredString(json, 'id'),
      name: requiredString(json, 'name'),
      code: requiredString(json, 'code'),
      locality: requiredString(json, 'locality'),
      latitude: requiredNumber(json, 'latitude'),
      longitude: requiredNumber(json, 'longitude'),
      distanceKm: distanceKm,
    );
  }
}

class ProductCategory {
  const ProductCategory({
    required this.id,
    required this.name,
    this.nameTa,
    this.icon,
  });

  final String id;
  final String name;
  final String? nameTa;
  final String? icon;

  factory ProductCategory.fromJson(JsonMap json) => ProductCategory(
    id: requiredString(json, 'id'),
    name: requiredString(json, 'name'),
    nameTa: optionalString(json, 'nameTa'),
    icon: optionalString(json, 'icon'),
  );
}

class CatalogProduct {
  const CatalogProduct({
    required this.storeProductId,
    required this.productId,
    required this.name,
    required this.unit,
    required this.price,
    required this.available,
    this.nameTa,
    this.imageUrl,
    this.categoryId,
    this.categoryName,
  });

  final String storeProductId;
  final String productId;
  final String name;
  final String? nameTa;
  final String unit;
  final double price;
  final bool available;
  final String? imageUrl;
  final String? categoryId;
  final String? categoryName;

  factory CatalogProduct.fromJson(JsonMap json) {
    final product = jsonMap(json['masterProduct'], field: 'product');
    final category = product['category'] == null
        ? null
        : jsonMap(product['category'], field: 'product category');
    final customPrice = json['customPrice'];
    return CatalogProduct(
      storeProductId: requiredString(json, 'id'),
      productId: requiredString(product, 'id'),
      name: requiredString(product, 'name'),
      nameTa: optionalString(product, 'nameTa'),
      unit: requiredString(product, 'unit'),
      price: customPrice == null
          ? requiredNumber(product, 'baseSellingPrice')
          : _number(customPrice, 'customPrice'),
      available: json['isAvailable'] == true,
      imageUrl: optionalString(product, 'imageUrl'),
      categoryId: category == null ? null : optionalString(category, 'id'),
      categoryName: category == null ? null : optionalString(category, 'name'),
    );
  }
}

class CartItem {
  const CartItem({
    required this.storeProductId,
    required this.quantity,
    required this.unitPrice,
    required this.productName,
    required this.unit,
    required this.available,
  });

  final String storeProductId;
  final int quantity;
  final double unitPrice;
  final String productName;
  final String unit;
  final bool available;

  double get total => unitPrice * quantity;

  factory CartItem.fromJson(JsonMap json) {
    final product = jsonMap(json['product'], field: 'cart item product');
    return CartItem(
      storeProductId: requiredString(json, 'storeProductId'),
      quantity: requiredInt(json, 'quantity'),
      unitPrice: requiredNumber(json, 'unitPrice'),
      productName: requiredString(product, 'name'),
      unit: requiredString(product, 'unit'),
      available: json['isAvailable'] == true,
    );
  }
}

class DeliveryAddress {
  const DeliveryAddress({
    required this.id,
    required this.label,
    required this.recipientName,
    required this.recipientPhone,
    required this.streetAddress,
    required this.locality,
    required this.latitude,
    required this.longitude,
    required this.isDefault,
    this.landmark,
  });

  final String id;
  final String label;
  final String recipientName;
  final String recipientPhone;
  final String streetAddress;
  final String locality;
  final double latitude;
  final double longitude;
  final bool isDefault;
  final String? landmark;

  factory DeliveryAddress.fromJson(JsonMap json) => DeliveryAddress(
    id: requiredString(json, 'id'),
    label: requiredString(json, 'label'),
    recipientName: requiredString(json, 'recipientName'),
    recipientPhone: requiredString(json, 'recipientPhone'),
    streetAddress: requiredString(json, 'streetAddress'),
    locality: requiredString(json, 'locality'),
    latitude: requiredNumber(json, 'latitude'),
    longitude: requiredNumber(json, 'longitude'),
    isDefault: json['isDefault'] == true,
    landmark: optionalString(json, 'landmark'),
  );
}

class CustomerOrder {
  const CustomerOrder({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.totalAmount,
    required this.createdAt,
    required this.storeId,
    required this.storeName,
    required this.latitude,
    required this.longitude,
    this.riderName,
  });

  final String id;
  final String orderNumber;
  final String status;
  final double totalAmount;
  final DateTime createdAt;
  final String storeId;
  final String storeName;
  final double latitude;
  final double longitude;
  final String? riderName;

  factory CustomerOrder.fromJson(JsonMap json) {
    final store = jsonMap(json['store'], field: 'order store');
    final address = jsonMap(
      json['deliveryAddressSnapshot'],
      field: 'delivery address snapshot',
    );
    final riderValue = json['rider'];
    final rider = riderValue == null
        ? null
        : jsonMap(riderValue, field: 'rider');
    final riderUser = rider == null || rider['user'] == null
        ? null
        : jsonMap(rider['user'], field: 'rider user');
    final date = DateTime.tryParse(requiredString(json, 'createdAt'));
    if (date == null) throw FormatException('Invalid order createdAt date');
    return CustomerOrder(
      id: requiredString(json, 'id'),
      orderNumber: requiredString(json, 'orderNumber'),
      status: requiredString(json, 'status'),
      totalAmount: requiredNumber(json, 'totalAmount'),
      createdAt: date,
      storeId: requiredString(json, 'storeId'),
      storeName: requiredString(store, 'name'),
      latitude: requiredNumber(address, 'latitude'),
      longitude: requiredNumber(address, 'longitude'),
      riderName: riderUser == null
          ? null
          : optionalString(riderUser, 'fullName'),
    );
  }
}

double _number(Object value, String field) {
  if (value is num) return value.toDouble();
  if (value is String) {
    final parsed = double.tryParse(value);
    if (parsed != null) return parsed;
  }
  throw FormatException('Expected numeric "$field" in API response');
}
