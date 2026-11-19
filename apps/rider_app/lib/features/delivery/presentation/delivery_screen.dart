import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/app_error.dart';
import '../../../core/api/rider_models.dart';
import '../../../core/location/rider_location_service.dart';
import '../../../core/providers.dart';

class DeliveryScreen extends ConsumerStatefulWidget {
  const DeliveryScreen({required this.orderId, super.key});

  final String orderId;

  @override
  ConsumerState<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends ConsumerState<DeliveryScreen> {
  RiderOrder? _order;
  Position? _position;
  List<LatLngPoint> _route = const [];
  bool _loading = true;
  bool _tracking = false;
  bool _busy = false;
  String? _error;
  RiderLocationService? _locationService;

  @override
  void initState() {
    super.initState();
    _loadOrder();
    ref.read(riderLocationServiceProvider.future).then((service) {
      _locationService = service;
    }).catchError((Object error) {
      if (mounted) setState(() => _error = 'Location service unavailable: $error');
    });
  }

  @override
  void dispose() {
    super.dispose();
  }

  Future<void> _loadOrder() async {
    try {
      final data = await ref.read(riderRepositoryProvider).order(widget.orderId);
      if (!mounted) return;
      setState(() {
        _order = RiderOrder(data);
        _loading = false;
        _error = null;
      });
      if (_position != null) await _loadRoute();
    } on AppError catch (error) {
      if (mounted) {
        setState(() {
          _error = error.message;
          _loading = false;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _error = 'Unable to load delivery: $error';
          _loading = false;
        });
      }
    }
  }

  Future<bool> _requestLocationPermissions() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      setState(() => _error = 'Turn on device location to share delivery progress.');
      return false;
    }
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      setState(() => _error = 'Allow location access in Android settings to share progress.');
      return false;
    }
    if (permission == LocationPermission.whileInUse) {
      permission = await Geolocator.requestPermission();
    }
    if (permission != LocationPermission.always) {
      setState(() => _error = 'Enable background location from Android app permissions to share while navigating.');
      await Geolocator.openAppSettings();
      return false;
    }
    return true;
  }

  Future<void> _enableTracking() async {
    if (!await _requestLocationPermissions()) return;
    try {
      _locationService ??= await ref.read(riderLocationServiceProvider.future);
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 20),
        ),
      );
      await _locationService?.start();
      if (!mounted) return;
      setState(() {
        _position = position;
        _tracking = true;
        _error = null;
      });
      await _loadRoute();
    } catch (error) {
      if (mounted) setState(() => _error = 'Could not start delivery location: $error');
    }
  }

  Future<void> _loadRoute() async {
    final order = _order;
    final position = _position;
    if (order == null ||
        position == null ||
        order.latitude == null ||
        order.longitude == null) {
      return;
    }
    try {
      final route = await ref.read(riderRepositoryProvider).route(
        fromLatitude: position.latitude,
        fromLongitude: position.longitude,
        toLatitude: order.latitude!,
        toLongitude: order.longitude!,
      );
      if (mounted) setState(() => _route = route);
    } catch (error) {
      if (mounted) setState(() => _error = 'Route unavailable: $error');
    }
  }

  Future<void> _transition(Future<void> Function() action, String success) async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await action();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(success)));
        await _loadOrder();
      }
    } on AppError catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (error) {
      if (mounted) setState(() => _error = 'Could not update delivery: $error');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _askReason({required bool failed}) async {
    final reason = await showDialog<String>(
      context: context,
      builder: (context) {
        final controller = TextEditingController();
        return AlertDialog(
          title: Text(failed ? 'Report failed delivery' : 'Decline assignment'),
          content: TextField(
            controller: controller,
            minLines: 2,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Reason (at least 3 characters)'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                if (controller.text.trim().length >= 3) {
                  Navigator.pop(context, controller.text.trim());
                }
              },
              child: const Text('Submit reason'),
            ),
          ],
        );
      },
    );
    if (reason == null || !mounted) return;
    final repository = ref.read(riderRepositoryProvider);
    await _transition(
      () => failed
          ? repository.fail(widget.orderId, reason)
          : repository.reject(widget.orderId, reason),
      failed ? 'Delivery marked failed.' : 'Assignment declined.',
    );
    if (failed && _order?.status == 'FAILED') {
      await _locationService?.stop();
    }
    if (!failed && mounted) context.pop();
  }

  Future<void> _confirmDelivery() async {
    final order = _order;
    if (order == null) return;
    final amount = await showDialog<double>(
      context: context,
      builder: (context) {
        final controller = TextEditingController(text: order.total.toStringAsFixed(2));
        return AlertDialog(
          title: const Text('Collect COD'),
          content: TextField(
            controller: controller,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              labelText: 'Collected amount (LKR)',
              helperText: 'Must equal LKR ${order.total.toStringAsFixed(2)}',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                final value = double.tryParse(controller.text.trim());
                if (value != null && value > 0) Navigator.pop(context, value);
              },
              child: const Text('Confirm cash received'),
            ),
          ],
        );
      },
    );
    if (amount == null || !mounted) return;
    await _transition(
      () => ref.read(riderRepositoryProvider).deliver(widget.orderId, amount),
      'Delivery completed and COD recorded.',
    );
    if (_order?.status == 'DELIVERED') {
      await _locationService?.stop();
      if (mounted) context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Delivery')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    final order = _order;
    if (order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Delivery')),
        body: ErrorState(
          message: _error ?? 'Order not found',
          onRetry: () => _loadOrder(),
        ),
      );
    }
    final destination = order.latitude != null && order.longitude != null
        ? LatLng(order.latitude!, order.longitude!)
        : null;
    final current = _position == null
        ? null
        : LatLng(_position!.latitude, _position!.longitude);
    final center = current ?? destination ?? const LatLng(7.71, 81.69);
    return Scaffold(
      appBar: AppBar(title: Text(order.number)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (destination != null)
            SizedBox(
              height: 300,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: FlutterMap(
                  options: MapOptions(
                    initialCenter: center,
                    initialZoom: 14,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'lk.buyme.rider_app',
                    ),
                    if (_route.isNotEmpty)
                      PolylineLayer(
                        polylines: [
                          Polyline(
                            points: _route.map((point) => LatLng(point.latitude, point.longitude)).toList(),
                            color: AppColors.primaryRed,
                            strokeWidth: 5,
                          ),
                        ],
                      ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: destination,
                          width: 44,
                          height: 44,
                          child: const Icon(LucideIcons.mapPin, color: AppColors.primaryRed, size: 36),
                        ),
                        if (current != null)
                          Marker(
                            point: current,
                            width: 44,
                            height: 44,
                            child: const Icon(LucideIcons.bike, color: AppColors.deepRed, size: 32),
                          ),
                      ],
                    ),
                    RichAttributionWidget(
                      attributions: [
                        TextSourceAttribution(
                          'OpenStreetMap contributors',
                          onTap: () {},
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            )
          else
            const GlassCard(
              child: Text('Delivery address does not contain map coordinates. Use the address details below.'),
            ),
          const SizedBox(height: 14),
          GlassCard(
            opaqueTextSurface: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _StatePill(order.status),
                const SizedBox(height: 10),
                Text(order.deliveryLabel.isEmpty ? 'Address not available' : order.deliveryLabel),
                const SizedBox(height: 10),
                Text('COD to collect: LKR ${order.total.toStringAsFixed(2)}'),
                const Divider(height: 24),
                for (final item in order.items)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Text(
                      '${stringValue(item['productName'], fallback: 'Order item')} × ${numberValue(item['quantity']).toStringAsFixed(0)}',
                    ),
                  ),
              ],
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          const SizedBox(height: 14),
          if (order.status == 'RIDER_ASSIGNED') ...[
            FilledButton.icon(
              onPressed: _busy
                  ? null
                  : () => _transition(
                        () => ref.read(riderRepositoryProvider).pickUp(order.id),
                        'Order picked up.',
                      ),
              icon: const Icon(LucideIcons.packageCheck),
              label: const Text('Confirm pickup'),
            ),
            TextButton(
              onPressed: _busy ? null : () => _askReason(failed: false),
              child: const Text('Decline this assignment'),
            ),
          ],
          if (order.status == 'PICKED_UP')
            FilledButton.icon(
              onPressed: _busy
                  ? null
                  : () => _transition(
                        () => ref.read(riderRepositoryProvider).startDelivery(order.id),
                        'Delivery started.',
                      ),
              icon: const Icon(LucideIcons.navigation),
              label: const Text('Start delivery'),
            ),
          if (order.status == 'ON_THE_WAY') ...[
            OutlinedButton.icon(
              onPressed: _tracking ? null : _enableTracking,
              icon: Icon(_tracking ? LucideIcons.mapPinCheck : LucideIcons.mapPin),
              label: Text(_tracking ? 'Location sharing active' : 'Enable live location sharing'),
            ),
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: _busy ? null : _confirmDelivery,
              icon: const Icon(LucideIcons.circleCheck),
              label: const Text('Confirm delivery & COD'),
            ),
            TextButton(
              onPressed: _busy ? null : () => _askReason(failed: true),
              child: const Text('Report delivery failed'),
            ),
          ],
        ],
      ),
    );
  }
}

class _StatePill extends StatelessWidget {
  const _StatePill(this.status);
  final String status;

  @override
  Widget build(BuildContext context) => Chip(
    label: Text(status.replaceAll('_', ' ')),
    backgroundColor: AppColors.softYellow,
    side: BorderSide.none,
  );
}
