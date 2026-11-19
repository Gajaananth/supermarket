import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/api_models.dart';
import '../../../core/providers.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    final money = NumberFormat.currency(
      locale: 'en_LK',
      symbol: 'LKR ',
      decimalDigits: 2,
    );
    return GlassScaffold(
      appBar: AppBar(
        title: Text('Your orders', style: AppTypography.h3),
        actions: [
          IconButton(
            tooltip: 'Refresh orders',
            onPressed: () => ref.invalidate(ordersProvider),
            icon: const Icon(LucideIcons.refreshCw, size: 19),
          ),
        ],
      ),
      body: orders.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => ErrorState(
          message: '$error',
          onRetry: () => ref.invalidate(ordersProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return EmptyState(
              title: 'No orders yet',
              description: 'Your order history will appear here.',
              icon: LucideIcons.packageSearch,
              actionLabel: 'Start shopping',
              onAction: () => context.go('/shop'),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(18),
            itemCount: items.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final order = items[index];
              return _OrderCard(
                order: order,
                amount: money.format(order.totalAmount),
              );
            },
          );
        },
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order, required this.amount});

  final CustomerOrder order;
  final String amount;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      opaqueTextSurface: true,
      onTap: () => context.push('/tracking/${order.id}'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(order.orderNumber, style: AppTypography.h4)),
              StatusBadge(
                status: _badgeStatus(order.status),
                customLabel: _statusLabel(order.status),
                isCompact: true,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(order.storeName, style: AppTypography.bodyMedium),
          const SizedBox(height: 4),
          Text(
            DateFormat('dd MMM yyyy, h:mm a').format(order.createdAt),
            style: AppTypography.bodySmall,
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Text(amount, style: AppTypography.priceSmall),
              const Spacer(),
              const Icon(
                LucideIcons.arrowRight,
                size: 18,
                color: AppColors.primaryRed,
              ),
            ],
          ),
        ],
      ),
    );
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
