import 'dart:async';

import 'package:socket_io_client/socket_io_client.dart' as socket_io;

import '../api/app_error.dart';
import '../api/customer_repository.dart';
import '../config/app_config.dart';

enum OrderLiveEventType { status, riderLocation }

class OrderLiveEvent {
  const OrderLiveEvent({required this.type, required this.payload});

  final OrderLiveEventType type;
  final Map<String, Object?> payload;
}

class OrderLiveUpdates {
  OrderLiveUpdates(this._repository);

  final CustomerRepository _repository;

  Stream<OrderLiveEvent> watchOrder(String orderId) {
    late final StreamController<OrderLiveEvent> controller;
    socket_io.Socket? socket;
    var disposed = false;
    controller = StreamController<OrderLiveEvent>(
      onListen: () async {
        try {
          final token = await _repository.refreshAccessTokenForSocket();
          if (disposed) return;
          final baseUri = Uri.parse(AppConfig.apiBaseUrl);
          socket = socket_io.io(
            '${baseUri.origin}/events',
            socket_io.OptionBuilder()
                .setTransports(['websocket'])
                .setAuth({'token': token})
                .disableAutoConnect()
                .build(),
          );
          socket!
            ..onConnect((_) => socket!.emit('join.order', {'orderId': orderId}))
            ..on(
              'order.status',
              (data) => _emit(controller, data, OrderLiveEventType.status),
            )
            ..on(
              'rider.location',
              (data) =>
                  _emit(controller, data, OrderLiveEventType.riderLocation),
            )
            ..onConnectError((error) {
              if (!controller.isClosed) {
                controller.addError(
                  AppError('Live order connection failed: $error'),
                );
              }
            })
            ..onError((error) {
              if (!controller.isClosed) {
                controller.addError(
                  AppError('Live order update failed: $error'),
                );
              }
            })
            ..connect();
        } catch (error, stackTrace) {
          if (!controller.isClosed) controller.addError(error, stackTrace);
        }
      },
      onCancel: () {
        disposed = true;
        socket?.disconnect();
        socket?.dispose();
      },
    );
    return controller.stream;
  }

  void _emit(
    StreamController<OrderLiveEvent> controller,
    Object? data,
    OrderLiveEventType type,
  ) {
    if (controller.isClosed) return;
    if (data is! Map) {
      controller.addError(
        const FormatException('Received an invalid live order update'),
      );
      return;
    }
    controller.add(
      OrderLiveEvent(
        type: type,
        payload: data.map((key, value) => MapEntry('$key', value)),
      ),
    );
  }
}
