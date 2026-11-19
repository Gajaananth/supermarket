# BuyMe Admin Android App

Flutter Android app for Super Admin and Store Admin operations. It uses the
generated API client and requires the NestJS API to be running.

## Run

From this directory:

```powershell
flutter run --dart-define=BUYME_API_BASE_URL=http://10.0.2.2:4000
```

`10.0.2.2` is the Android emulator alias for the host machine. Use an HTTPS
API URL for a physical device or production build. Configure Firebase options
with `--dart-define` values when push notifications are enabled; do not commit
credentials.

## Validate and build

```powershell
flutter analyze
flutter test
flutter build apk --release
```

The Android release build currently disables Kotlin incremental compilation
because the project is on D: while the Flutter Pub cache is on E:, which
otherwise triggers Kotlin's cross-volume incremental-cache failure.
