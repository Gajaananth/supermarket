import 'package:flutter_test/flutter_test.dart';

import 'package:admin_app/core/api/admin_models.dart';

void main() {
  test('Admin order reads customer and rider details from API relations', () {
    final order = AdminOrder.fromJson({
      'id': 'order-1',
      'orderNumber': 'BM-1001',
      'status': 'PLACED',
      'totalAmount': 1250,
      'createdAt': '2026-11-18T00:00:00.000Z',
      'customer': {
        'user': {'fullName': 'Customer One', 'phone': '+94123456789'},
      },
      'rider': {
        'user': {'fullName': 'Rider One'},
      },
    });

    expect(order.customerName, 'Customer One');
    expect(order.customerPhone, '+94123456789');
    expect(order.riderName, 'Rider One');
    expect(order.totalAmount, 1250);
  });

  test('Admin account parser rejects non-admin roles', () {
    expect(
      () => AdminSession.fromJson({
        'id': 'user-1',
        'fullName': 'Customer One',
        'role': 'CUSTOMER',
      }),
      throwsFormatException,
    );
  });

  test('deposit parser rejects malformed amount', () {
    expect(
      () => AdminCashDeposit.fromJson({
        'id': 'deposit-1',
        'depositNumber': 'DEP-1001',
        'amount': 'unknown',
        'status': 'PENDING',
        'bankRefNumber': 'REF-1',
      }),
      throwsFormatException,
    );
  });
}
