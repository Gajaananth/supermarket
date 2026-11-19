import 'package:customer_app/core/api/api_models.dart';
import 'package:customer_app/core/auth/phone_number.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Sri Lankan phone validation', () {
    test('normalizes local and international mobile numbers', () {
      expect(validateSriLankanPhone('077 123 4567'), isNull);
      expect(normalizeSriLankanPhone('077 123 4567'), '+94771234567');
      expect(normalizeSriLankanPhone('+94 (77) 123-4567'), '+94771234567');
    });

    test('rejects malformed or non-mobile phone numbers', () {
      expect(validateSriLankanPhone('011 123 4567'), isNotNull);
      expect(validateSriLankanPhone('+1 202 555 0100'), isNotNull);
      expect(() => normalizeSriLankanPhone('077123'), throwsFormatException);
    });
  });

  group('catalog API decoding', () {
    test('parses decimal price and nested category data', () {
      final product = CatalogProduct.fromJson({
        'id': 'store-product-id',
        'customPrice': '249.50',
        'isAvailable': true,
        'masterProduct': {
          'id': 'product-id',
          'name': 'Rice',
          'nameTa': 'அரிசி',
          'unit': '1 kg',
          'baseSellingPrice': '275.00',
          'imageUrl': null,
          'category': {'id': 'category-id', 'name': 'Staples'},
        },
      });

      expect(product.storeProductId, 'store-product-id');
      expect(product.price, 249.5);
      expect(product.categoryId, 'category-id');
      expect(product.available, isTrue);
    });

    test('rejects a catalogue response missing its product payload', () {
      expect(
        () => CatalogProduct.fromJson({'id': 'store-product-id'}),
        throwsFormatException,
      );
    });
  });
}
