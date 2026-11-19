import 'package:firebase_messaging/firebase_messaging.dart';

import '../api/customer_repository.dart';
import '../config/app_config.dart';

class PushNotificationService {
  Future<String?> registerIfConfigured(CustomerRepository repository) async {
    if (!AppConfig.hasFirebaseOptions) return null;
    final settings = await FirebaseMessaging.instance.requestPermission();
    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      throw StateError('Notification permission was denied');
    }
    final token = await FirebaseMessaging.instance.getToken();
    if (token == null || token.isEmpty) {
      throw StateError('Firebase did not return a device push token');
    }
    await repository.registerPushToken(token);
    return token;
  }
}
