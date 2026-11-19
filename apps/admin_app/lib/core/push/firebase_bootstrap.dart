import 'package:firebase_core/firebase_core.dart';

import '../config/app_config.dart';

Future<void> initializeFirebaseIfConfigured() async {
  if (!AppConfig.hasFirebaseOptions || Firebase.apps.isNotEmpty) return;
  await Firebase.initializeApp(
    options: const FirebaseOptions(
      apiKey: AppConfig.firebaseApiKey,
      appId: AppConfig.firebaseAppId,
      messagingSenderId: AppConfig.firebaseMessagingSenderId,
      projectId: AppConfig.firebaseProjectId,
      storageBucket: AppConfig.firebaseStorageBucket,
    ),
  );
}
