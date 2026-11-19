import 'dart:async';

import 'package:socket_io_client/socket_io_client.dart' as socket_io;

import '../api/rider_repository.dart';
import '../config/app_config.dart';

class RiderRealtime {
  RiderRealtime(this._repository);

  final RiderRepository _repository;
  socket_io.Socket? _socket;
  StreamController<void>? _changes;

  Stream<void> watchStore(String storeId) {
    _changes?.close();
    _socket?.dispose();
    final controller = StreamController<void>();
    _changes = controller;
    () async {
      try {
        final token = await _repository.accessTokenForSocket();
        final base = Uri.parse(AppConfig.apiBaseUrl);
        final socket = socket_io.io(
          '${base.origin}/events',
          socket_io.OptionBuilder()
              .setTransports(['websocket'])
              .setAuth({'token': token})
              .disableAutoConnect()
              .build(),
        );
        _socket = socket;
        socket
          ..onConnect((_) => socket.emit('join.store', {'storeId': storeId}))
          ..on('order.status', (_) {
            if (!controller.isClosed) controller.add(null);
          })
          ..onConnectError((_) {
            if (!controller.isClosed) controller.add(null);
          })
          ..connect();
      } catch (_) {
        if (!controller.isClosed) controller.add(null);
      }
    }();
    return controller.stream;
  }

  void dispose() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _changes?.close();
    _changes = null;
  }
}
