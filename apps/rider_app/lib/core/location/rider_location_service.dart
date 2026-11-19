import 'dart:async';
import 'dart:ui';

import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:geolocator/geolocator.dart';
import 'package:socket_io_client/socket_io_client.dart' as socket_io;

import '../config/app_config.dart';

class RiderLocationService {
  RiderLocationService(this._service);

  final FlutterBackgroundService _service;

  static Future<RiderLocationService> configure() async {
    final service = FlutterBackgroundService();
    await service.configure(
      androidConfiguration: AndroidConfiguration(
        onStart: riderLocationServiceStart,
        autoStart: false,
        isForegroundMode: true,
        notificationChannelId: 'buyme_rider_location',
        initialNotificationTitle: 'BuyMe delivery navigation',
        initialNotificationContent: 'Location sharing is active for this delivery',
        foregroundServiceNotificationId: 7801,
        foregroundServiceTypes: [AndroidForegroundType.location],
      ),
      iosConfiguration: IosConfiguration(),
    );
    return RiderLocationService(service);
  }

  Future<void> start() async {
    await _service.startService();
  }

  Future<void> stop() async {
    _service.invoke('stopLocation');
  }
}

@pragma('vm:entry-point')
void riderLocationServiceStart(ServiceInstance service) async {
  DartPluginRegistrant.ensureInitialized();
  final token = await const FlutterSecureStorage().read(
    key: 'buyme.rider.access-token',
  );
  if (token == null || token.isEmpty) {
    service.stopSelf();
    return;
  }

  if (service is AndroidServiceInstance) {
    await service.setAsForegroundService();
    await service.setForegroundNotificationInfo(
      title: 'BuyMe delivery navigation',
      content: 'Sharing location every 100 m or about 60 seconds',
    );
  }

  final base = Uri.parse(AppConfig.apiBaseUrl);
  final socket = socket_io.io(
    '${base.origin}/events',
    socket_io.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .disableAutoConnect()
        .build(),
  );
  socket.connect();

  final locationStream = Geolocator.getPositionStream(
    locationSettings: AndroidSettings(
      accuracy: LocationAccuracy.medium,
      distanceFilter: 100,
      intervalDuration: Duration(seconds: 60),
    ),
  ).listen((position) {
    if (socket.connected) {
      socket.emit('rider.location', {
        'latitude': position.latitude,
        'longitude': position.longitude,
        'heading': position.heading,
        'speedKmh': position.speed * 3.6,
      });
    }
  });

  service.on('stopLocation').listen((_) async {
    await locationStream.cancel();
    socket.disconnect();
    socket.dispose();
    service.stopSelf();
  });
}
