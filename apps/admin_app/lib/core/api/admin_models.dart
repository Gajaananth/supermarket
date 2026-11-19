import 'app_error.dart';

class AdminStore {
  const AdminStore({
    required this.id,
    required this.name,
    required this.code,
    required this.isActive,
    this.latitude,
    this.longitude,
  });

  final String id;
  final String name;
  final String code;
  final bool isActive;
  final double? latitude;
  final double? longitude;

  factory AdminStore.fromJson(JsonMap json) {
    final active = json['isActive'];
    if (active is! bool) throw const FormatException('Invalid store status');
    final latitude = json['latitude'];
    final longitude = json['longitude'];
    return AdminStore(
      id: requiredString(json, 'id'),
      name: requiredString(json, 'name'),
      code: requiredString(json, 'code'),
      isActive: active,
      latitude: latitude == null
          ? null
          : numberValue(latitude, field: 'store latitude'),
      longitude: longitude == null
          ? null
          : numberValue(longitude, field: 'store longitude'),
    );
  }
}

class AdminSession {
  const AdminSession({
    required this.id,
    required this.fullName,
    required this.role,
    required this.email,
    this.store,
  });

  final String id;
  final String fullName;
  final String role;
  final String? email;
  final AdminStore? store;

  bool get isSuperAdmin => role == 'SUPER_ADMIN';

  factory AdminSession.fromJson(JsonMap json) {
    final role = requiredString(json, 'role');
    if (role != 'SUPER_ADMIN' && role != 'STORE_ADMIN') {
      throw const FormatException('This account is not an administrator');
    }
    final storeJson = json['store'];
    return AdminSession(
      id: requiredString(json, 'id'),
      fullName: requiredString(json, 'fullName'),
      role: role,
      email: json['email'] is String ? json['email'] as String : null,
      store: storeJson == null
          ? null
          : AdminStore.fromJson(jsonMap(storeJson, field: 'assigned store')),
    );
  }
}

class AdminOrder {
  const AdminOrder({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.totalAmount,
    required this.createdAt,
    this.customerName,
    this.customerPhone,
    this.riderName,
  });

  final String id;
  final String orderNumber;
  final String status;
  final double totalAmount;
  final DateTime? createdAt;
  final String? customerName;
  final String? customerPhone;
  final String? riderName;

  factory AdminOrder.fromJson(JsonMap json) {
    final customer = json['customer'] is Map
        ? jsonMap(json['customer'], field: 'order customer')
        : null;
    final customerUser = customer?['user'] is Map
        ? jsonMap(customer?['user'], field: 'order customer')
        : null;
    final rider = json['rider'] is Map
        ? jsonMap(json['rider'], field: 'order rider')
        : null;
    final riderUser = rider?['user'] is Map
        ? jsonMap(rider?['user'], field: 'order rider')
        : null;
    final createdAtValue = json['createdAt'];
    return AdminOrder(
      id: requiredString(json, 'id'),
      orderNumber: requiredString(json, 'orderNumber'),
      status: requiredString(json, 'status'),
      totalAmount: numberValue(json['totalAmount'], field: 'order total'),
      createdAt: createdAtValue is String
          ? DateTime.tryParse(createdAtValue)
          : null,
      customerName: optionalString(customerUser, 'fullName'),
      customerPhone: optionalString(customerUser, 'phone'),
      riderName: optionalString(riderUser, 'fullName'),
    );
  }
}

class AdminCashDeposit {
  const AdminCashDeposit({
    required this.id,
    required this.depositNumber,
    required this.amount,
    required this.status,
    required this.bankRefNumber,
    this.riderName,
    this.varianceReason,
  });

  final String id;
  final String depositNumber;
  final double amount;
  final String status;
  final String bankRefNumber;
  final String? riderName;
  final String? varianceReason;

  factory AdminCashDeposit.fromJson(JsonMap json) {
    final rider = json['rider'] is Map
        ? jsonMap(json['rider'], field: 'deposit rider')
        : null;
    final user = rider?['user'] is Map
        ? jsonMap(rider?['user'], field: 'deposit rider')
        : null;
    return AdminCashDeposit(
      id: requiredString(json, 'id'),
      depositNumber: requiredString(json, 'depositNumber'),
      amount: numberValue(json['amount'], field: 'deposit amount'),
      status: requiredString(json, 'status'),
      bankRefNumber: requiredString(json, 'bankRefNumber'),
      riderName: optionalString(user, 'fullName'),
      varianceReason: json['varianceReason'] is String
          ? json['varianceReason'] as String
          : null,
    );
  }
}

String? optionalString(JsonMap? value, String key) {
  if (value == null) return null;
  final result = value[key];
  return result is String ? result : null;
}
