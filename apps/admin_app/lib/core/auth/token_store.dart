import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

class TokenStore {
  TokenStore({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  static const _accessKey = 'buyme.admin.access-token';
  static const _refreshKey = 'buyme.admin.refresh-token';
  static const _deviceKey = 'buyme.admin.device-id';
  static const _storeKey = 'buyme.admin.selected-store-id';

  final FlutterSecureStorage _storage;

  Future<String?> readAccessToken() => _storage.read(key: _accessKey);
  Future<String?> readRefreshToken() => _storage.read(key: _refreshKey);
  Future<String?> readSelectedStoreId() => _storage.read(key: _storeKey);

  Future<String> deviceId() async {
    final existing = await _storage.read(key: _deviceKey);
    if (existing != null && existing.isNotEmpty) return existing;
    const uuid = Uuid();
    final created = uuid.v4();
    await _storage.write(key: _deviceKey, value: created);
    return created;
  }

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: _accessKey, value: accessToken);
    await _storage.write(key: _refreshKey, value: refreshToken);
  }

  Future<void> saveSelectedStoreId(String storeId) =>
      _storage.write(key: _storeKey, value: storeId);

  Future<void> clearTokens() async {
    await _storage.delete(key: _accessKey);
    await _storage.delete(key: _refreshKey);
    await _storage.delete(key: _storeKey);
  }
}
