typedef JsonMap = Map<String, Object?>;

class LatLngPoint {
  const LatLngPoint({required this.latitude, required this.longitude});
  final double latitude;
  final double longitude;
}

JsonMap jsonMap(Object? value, {required String field}) {
  if (value is Map) {
    return value.map((key, value) => MapEntry('$key', value));
  }
  throw FormatException('The $field response is invalid');
}

List<JsonMap> jsonMaps(Object? value, {required String field}) {
  if (value is! List) throw FormatException('The $field response is invalid');
  return value.map((item) => jsonMap(item, field: field)).toList(growable: false);
}

String stringValue(Object? value, {String fallback = ''}) =>
    value is String ? value : fallback;

double numberValue(Object? value, {double fallback = 0}) {
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? fallback;
  return fallback;
}

class RiderOrder {
  const RiderOrder(this.data);

  final JsonMap data;
  String get id => stringValue(data['id']);
  String get number => stringValue(data['orderNumber'], fallback: id);
  String get status => stringValue(data['status']);
  double get total => numberValue(data['totalAmount']);
  JsonMap get address {
    final snapshot = data['deliveryAddressSnapshot'];
    return snapshot is Map
        ? snapshot.map((key, value) => MapEntry('$key', value))
        : const {};
  }

  JsonMap get store {
    final value = data['store'];
    return value is Map
        ? value.map((key, value) => MapEntry('$key', value))
        : const {};
  }

  List<JsonMap> get items => data['items'] is List
      ? jsonMaps(data['items'], field: 'order items')
      : const [];

  double? get latitude {
    final value = address['latitude'];
    return value is num ? value.toDouble() : null;
  }

  double? get longitude {
    final value = address['longitude'];
    return value is num ? value.toDouble() : null;
  }

  String get deliveryLabel => [
    address['streetAddress'],
    address['locality'],
    address['landmark'],
  ].whereType<String>().where((part) => part.trim().isNotEmpty).join(', ');
}

class RiderCash {
  const RiderCash({
    required this.cashInHand,
    required this.isCashLocked,
    required this.depositPending,
    required this.cashLockReason,
    required this.threshold,
    required this.maxHours,
  });

  factory RiderCash.fromJson(JsonMap json) => RiderCash(
    cashInHand: numberValue(json['cashInHand']),
    isCashLocked: json['isCashLocked'] == true,
    depositPending: json['depositPending'] == true,
    cashLockReason: stringValue(json['cashLockReason']),
    threshold: numberValue(json['cashHoldThreshold']),
    maxHours: json['cashHoldMaxHours'] is num
        ? (json['cashHoldMaxHours'] as num).toInt()
        : 0,
  );

  final double cashInHand;
  final bool isCashLocked;
  final bool depositPending;
  final String cashLockReason;
  final double threshold;
  final int maxHours;
}
