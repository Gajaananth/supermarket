import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import '../api/rider_repository.dart';
import '../config/app_config.dart';

Future<void> initializeRiderPush(RiderRepository repository) async {
  if (!AppConfig.hasFirebaseOptions) return;
  await Firebase.initializeApp(
    options: FirebaseOptions(
      apiKey: AppConfig.firebaseApiKey,
      appId: AppConfig.firebaseAppId,
      messagingSenderId: AppConfig.firebaseMessagingSenderId,
      projectId: AppConfig.firebaseProjectId,
      storageBucket: AppConfig.firebaseStorageBucket.isEmpty
          ? null
          : AppConfig.firebaseStorageBucket,
    ),
  );
  final messaging = FirebaseMessaging.instance;
  await messaging.requestPermission();
  final token = await messaging.getToken();
  if (token != null && token.isNotEmpty) {
    await repository.registerPushToken(token);
  }
  messaging.onTokenRefresh.listen(repository.registerPushToken);
}
