import 'package:flutter_test/flutter_test.dart';
import 'package:rider_app/core/api/rider_models.dart';

void main() {
  group('RiderOrder', () {
    test('parses the immutable delivery address and COD total', () {
      final order = RiderOrder({
        'id': 'order-1',
        'orderNumber': 'ORD-2026-ABCD',
        'status': 'ON_THE_WAY',
        'totalAmount': '1250.50',
        'deliveryAddressSnapshot': {
          'streetAddress': '12 Main Street',
          'locality': 'Batticaloa',
          'landmark': 'Near the clock tower',
          'latitude': 7.71,
          'longitude': 81.69,
        },
        'items': [
          {'productName': 'Rice', 'quantity': 2},
        ],
      });

      expect(order.number, 'ORD-2026-ABCD');
      expect(order.status, 'ON_THE_WAY');
      expect(order.total, 1250.5);
      expect(order.latitude, 7.71);
      expect(order.longitude, 81.69);
      expect(order.deliveryLabel, '12 Main Street, Batticaloa, Near the clock tower');
      expect(order.items.single['productName'], 'Rice');
    });

    test('tolerates missing address coordinates', () {
      final order = RiderOrder({
        'id': 'order-2',
        'deliveryAddressSnapshot': {'streetAddress': '8 Lake Road'},
      });

      expect(order.latitude, isNull);
      expect(order.longitude, isNull);
      expect(order.deliveryLabel, '8 Lake Road');
    });
  });

  test('parses cash locks and balance from API numeric values', () {
    final cash = RiderCash.fromJson({
      'cashInHand': '8500.25',
      'isCashLocked': true,
      'depositPending': false,
      'cashLockReason': 'Deposit required',
      'cashHoldThreshold': '10000.00',
      'cashHoldMaxHours': 4,
    });

    expect(cash.cashInHand, 8500.25);
    expect(cash.isCashLocked, isTrue);
    expect(cash.depositPending, isFalse);
    expect(cash.cashLockReason, 'Deposit required');
    expect(cash.threshold, 10000);
    expect(cash.maxHours, 4);
  });

  test('rejects malformed list responses rather than silently defaulting', () {
    expect(
      () => jsonMaps({'items': []}, field: 'assigned orders'),
      throwsFormatException,
    );
  });
}
