import 'package:firebase_core/firebase_core.dart';

import '../config/app_config.dart';

Future<String?> initializeFirebase() async {
  if (!AppConfig.hasFirebaseOptions) {
    return 'Firebase is not configured. Supply Firebase build options to enable push notifications.';
  }
  try {
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
    return null;
  } on FirebaseException catch (error) {
    return 'Firebase initialization failed (${error.code}): ${error.message}';
  }
}
