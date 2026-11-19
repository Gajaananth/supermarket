import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/api_models.dart';
import '../../../core/providers.dart';
import '../../../core/realtime/order_live_updates.dart';

class OrderTrackingScreen extends ConsumerStatefulWidget {
  const OrderTrackingScreen({required this.orderId, super.key});

  final String orderId;

  @override
  ConsumerState<OrderTrackingScreen> createState() =>
      _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends ConsumerState<OrderTrackingScreen> {
  LatLng? _riderLocation;
  String? _liveError;

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(orderProvider(widget.orderId));
    final live = ref.watch(orderLiveEventsProvider(widget.orderId));
    ref.listen(orderLiveEventsProvider(widget.orderId), (previous, next) {
      next.whenData((event) {
        if (event.type == OrderLiveEventType.status) {
          final receivedOrderId = event.payload['orderId'];
          if (receivedOrderId == widget.orderId) {
            ref.invalidate(orderProvider(widget.orderId));
            ref.invalidate(ordersProvider);
          }
        } else {
          if (event.payload['orderId'] != widget.orderId) {
            setState(
              () => _liveError = 'Received an update for a different order.',
            );
            return;
          }
          final latitude = _coordinate(event.payload['latitude']);
          final longitude = _coordinate(event.payload['longitude']);
          if (latitude == null || longitude == null) {
            setState(() => _liveError = 'Received an invalid rider location.');
            return;
          }
          setState(() {
            _riderLocation = LatLng(latitude, longitude);
            _liveError = null;
          });
        }
      });
      next.whenOrNull(
        error: (error, stackTrace) => setState(() => _liveError = '$error'),
      );
    });

    return GlassScaffold(
      appBar: AppBar(
        title: Text('Order tracking', style: AppTypography.h3),
        actions: [
          IconButton(
            tooltip: 'Refresh order',
            onPressed: () => ref.invalidate(orderProvider(widget.orderId)),
            icon: const Icon(LucideIcons.refreshCw, size: 19),
          ),
        ],
      ),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => ErrorState(
          message: '$error',
          onRetry: () => ref.invalidate(orderProvider(widget.orderId)),
        ),
        data: (order) => _buildOrder(context, order, live.isLoading),
      ),
    );
  }

  Widget _buildOrder(
    BuildContext context,
    CustomerOrder order,
    bool liveLoading,
  ) {
    final store = ref.watch(storeProvider(order.storeId));
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 8, 18, 28),
      children: [
        GlassCard(
          opaqueTextSurface: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(order.orderNumber, style: AppTypography.h3),
                  ),
                  StatusBadge(
                    status: _badgeStatus(order.status),
                    customLabel: _statusLabel(order.status),
                    isCompact: true,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Placed ${DateFormat('dd MMM, h:mm a').format(order.createdAt)}',
                style: AppTypography.bodySmall,
              ),
              const SizedBox(height: 14),
              Text(order.storeName, style: AppTypography.h4),
              const SizedBox(height: 4),
              Text('Cash on delivery', style: AppTypography.bodyMedium),
              if (order.riderName != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Rider: ${order.riderName}',
                  style: AppTypography.bodyMedium,
                ),
              ],
              const SizedBox(height: 8),
              Text(
                'Total ${NumberFormat.currency(locale: 'en_LK', symbol: 'LKR ').format(order.totalAmount)}',
                style: AppTypography.priceMedium,
              ),
              if (order.status == 'PLACED') ...[
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => _cancelOrder(context, order),
                  icon: const Icon(LucideIcons.xCircle, size: 18),
                  label: const Text('Cancel order'),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 14),
        Text('Live delivery map', style: AppTypography.h3),
        const SizedBox(height: 10),
        store.when(
          loading: () => const SizedBox(
            height: 260,
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (error, stackTrace) => ErrorState(
            message: 'Could not load store location: $error',
            onRetry: () => ref.invalidate(storeProvider(order.storeId)),
          ),
          data: (storeDetails) {
            final route = ref.watch(
              deliveryRouteProvider((
                storeDetails.latitude,
                storeDetails.longitude,
                order.latitude,
                order.longitude,
              )),
            );
            final center =
                _riderLocation ??
                LatLng(
                  (storeDetails.latitude + order.latitude) / 2,
                  (storeDetails.longitude + order.longitude) / 2,
                );
            return Column(
              children: [
                SizedBox(
                  height: 290,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(22),
                    child: FlutterMap(
                      options: MapOptions(
                        initialCenter: center,
                        initialZoom: 12,
                      ),
                      children: [
                        TileLayer(
                          urlTemplate:
                              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'lk.buyme.customer',
                        ),
                        route.when(
                          data: (points) => PolylineLayer(
                            polylines: [
                              if (points.length > 1)
                                Polyline(
                                  points: points
                                      .map(
                                        (point) => LatLng(
                                          point.latitude,
                                          point.longitude,
                                        ),
                                      )
                                      .toList(growable: false),
                                  color: AppColors.primaryRed,
                                  strokeWidth: 4,
                                ),
                            ],
                          ),
                          loading: () => const SizedBox.shrink(),
                          error: (error, stackTrace) => const SizedBox.shrink(),
                        ),
                        MarkerLayer(
                          markers: [
                            Marker(
                              point: LatLng(
                                storeDetails.latitude,
                                storeDetails.longitude,
                              ),
                              width: 40,
                              height: 40,
                              child: const Icon(
                                LucideIcons.store,
                                color: AppColors.primaryRed,
                                size: 30,
                              ),
                            ),
                            Marker(
                              point: LatLng(order.latitude, order.longitude),
                              width: 40,
                              height: 40,
                              child: const Icon(
                                LucideIcons.mapPin,
                                color: AppColors.deepRed,
                                size: 34,
                              ),
                            ),
                            if (_riderLocation != null)
                              Marker(
                                point: _riderLocation!,
                                width: 44,
                                height: 44,
                                child: const Icon(
                                  LucideIcons.bike,
                                  color: AppColors.info,
                                  size: 34,
                                ),
                              ),
                          ],
                        ),
                        RichAttributionWidget(
                          attributions: [
                            TextSourceAttribution(
                              'OpenStreetMap contributors',
                              onTap: () =>
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Map data © OpenStreetMap contributors',
                                      ),
                                    ),
                                  ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                route.when(
                  error: (error, stackTrace) => Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      'Route preview unavailable: $error',
                      style: const TextStyle(color: AppColors.error),
                    ),
                  ),
                  loading: () => const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: LinearProgressIndicator(),
                  ),
                  data: (points) => const SizedBox.shrink(),
                ),
              ],
            );
          },
        ),
        const SizedBox(height: 12),
        if (_liveError != null)
          Text(
            'Live updates unavailable: $_liveError. Refresh to check the latest order status.',
            style: const TextStyle(color: AppColors.warning),
          )
        else
          Text(
            liveLoading
                ? 'Connecting to live order updates…'
                : _riderLocation == null
                ? 'Store and delivery pins shown. Rider location appears when the delivery starts.'
                : 'Rider location is updating live.',
            style: AppTypography.bodySmall,
          ),
      ],
    );
  }

  Future<void> _cancelOrder(BuildContext context, CustomerOrder order) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel this order?'),
        content: const Text(
          'You can cancel before the store accepts the order.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Keep order'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Cancel order'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ref
          .read(customerRepositoryProvider)
          .cancelOrder(order.id, 'Cancelled by customer');
      ref.invalidate(orderProvider(order.id));
      ref.invalidate(ordersProvider);
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not cancel this order: $error')),
        );
      }
    }
  }

  double? _coordinate(Object? value) {
    if (value is num) return value.toDouble();
    return value is String ? double.tryParse(value) : null;
  }
}

BuyMeOrderStatus _badgeStatus(String value) => switch (value) {
  'ACCEPTED' => BuyMeOrderStatus.confirmed,
  'PREPARING' => BuyMeOrderStatus.preparing,
  'READY' => BuyMeOrderStatus.ready,
  'OUT_FOR_DELIVERY' ||
  'PICKED_UP' ||
  'RIDER_ASSIGNED' => BuyMeOrderStatus.outForDelivery,
  'DELIVERED' => BuyMeOrderStatus.delivered,
  'CANCELLED' || 'REJECTED' || 'FAILED' => BuyMeOrderStatus.cancelled,
  _ => BuyMeOrderStatus.pending,
};

String _statusLabel(String value) => value
    .split('_')
    .map(
      (part) =>
          part.isEmpty ? part : '${part[0]}${part.substring(1).toLowerCase()}',
    )
    .join(' ');
