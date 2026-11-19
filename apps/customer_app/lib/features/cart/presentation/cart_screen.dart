import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/providers.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = ref.watch(selectedLocationProvider);
    if (location == null) {
      return const GlassScaffold(
        body: EmptyState(
          title: 'Choose a store first',
          description: 'Select a delivery location to start shopping.',
        ),
      );
    }
    final cart = ref.watch(cartProvider(location.store.id));
    final currency = NumberFormat.currency(
      locale: 'en_LK',
      symbol: 'LKR ',
      decimalDigits: 2,
    );
    return GlassScaffold(
      appBar: AppBar(title: Text('Your cart', style: AppTypography.h3)),
      body: cart.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => ErrorState(
          message: '$error',
          onRetry: () => ref.invalidate(cartProvider(location.store.id)),
        ),
        data: (items) {
          if (items.isEmpty) {
            return EmptyState(
              title: 'Your cart is empty',
              description: 'Explore the store and add items you need.',
              icon: LucideIcons.shoppingBag,
              actionLabel: 'Browse products',
              onAction: () => context.go('/shop'),
            );
          }
          final total = items.fold<double>(0, (sum, item) => sum + item.total);
          return Column(
            children: [
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(18),
                  itemCount: items.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return GlassCard(
                      opaqueTextSurface: true,
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          const CircleAvatar(
                            backgroundColor: AppColors.softRed,
                            child: Icon(
                              LucideIcons.package,
                              color: AppColors.primaryRed,
                              size: 19,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.productName, style: AppTypography.h4),
                                Text(
                                  '${currency.format(item.unitPrice)} / ${item.unit}',
                                  style: AppTypography.bodySmall,
                                ),
                                if (!item.available)
                                  const Text(
                                    'Currently unavailable',
                                    style: TextStyle(color: AppColors.error),
                                  ),
                              ],
                            ),
                          ),
                          IconButton(
                            tooltip: 'Remove one',
                            onPressed: () => _changeQuantity(
                              context,
                              ref,
                              location.store.id,
                              item.storeProductId,
                              item.quantity - 1,
                            ),
                            icon: const Icon(LucideIcons.minus, size: 18),
                          ),
                          Text('${item.quantity}', style: AppTypography.h4),
                          IconButton(
                            tooltip: 'Add one',
                            onPressed: () => _changeQuantity(
                              context,
                              ref,
                              location.store.id,
                              item.storeProductId,
                              item.quantity + 1,
                            ),
                            icon: const Icon(LucideIcons.plus, size: 18),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              GlassCard(
                opaqueTextSurface: true,
                margin: const EdgeInsets.fromLTRB(18, 0, 18, 18),
                child: Column(
                  children: [
                    _TotalLine(
                      label: 'Subtotal',
                      value: currency.format(total),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Delivery fee and offers are calculated at checkout.',
                      style: AppTypography.bodySmall,
                    ),
                    const SizedBox(height: 14),
                    PrimaryButton(
                      text: 'Continue to checkout',
                      icon: const Icon(LucideIcons.arrowRight, size: 18),
                      onPressed: () => context.push('/checkout'),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _changeQuantity(
    BuildContext context,
    WidgetRef ref,
    String storeId,
    String productId,
    int quantity,
  ) async {
    try {
      final repository = ref.read(customerRepositoryProvider);
      if (quantity <= 0) {
        await repository.removeFromCart(
          storeId: storeId,
          storeProductId: productId,
        );
      } else {
        await repository.setCartQuantity(
          storeId: storeId,
          storeProductId: productId,
          quantity: quantity,
        );
      }
      ref.invalidate(cartProvider(storeId));
    } catch (error) {
      ref.invalidate(cartProvider(storeId));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not update your cart: $error')),
        );
      }
    }
  }
}

class _TotalLine extends StatelessWidget {
  const _TotalLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(label, style: AppTypography.h4),
      Text(value, style: AppTypography.h4),
    ],
  );
}
