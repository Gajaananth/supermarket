import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/providers.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  String? _selectedAddressId;
  String? _error;
  bool _isSubmitting = false;

  @override
  Widget build(BuildContext context) {
    final location = ref.watch(selectedLocationProvider);
    if (location == null) {
      return const GlassScaffold(
        body: EmptyState(
          title: 'Choose a store first',
          description: 'Select a delivery location to check out.',
        ),
      );
    }
    final cart = ref.watch(cartProvider(location.store.id));
    final addresses = ref.watch(addressesProvider);
    final money = NumberFormat.currency(
      locale: 'en_LK',
      symbol: 'LKR ',
      decimalDigits: 2,
    );

    return GlassScaffold(
      appBar: AppBar(title: Text('Checkout', style: AppTypography.h3)),
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
              description: 'Add products before checking out.',
              actionLabel: 'Browse products',
              onAction: () => context.go('/shop'),
            );
          }
          final subtotal = items.fold<double>(
            0,
            (sum, item) => sum + item.total,
          );
          return addresses.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stackTrace) => ErrorState(
              message: '$error',
              onRetry: () => ref.invalidate(addressesProvider),
            ),
            data: (savedAddresses) {
              final selectedId =
                  _selectedAddressId ??
                  savedAddresses
                      .where((address) => address.isDefault)
                      .map((address) => address.id)
                      .firstOrNull;
              return ListView(
                padding: const EdgeInsets.all(18),
                children: [
                  Text('Delivery address', style: AppTypography.h3),
                  const SizedBox(height: 10),
                  if (savedAddresses.isEmpty)
                    GlassCard(
                      opaqueTextSurface: true,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Add a saved address to continue.'),
                          const SizedBox(height: 12),
                          OutlinedButton.icon(
                            onPressed: () => _chooseAddress(context),
                            icon: const Icon(LucideIcons.plus, size: 17),
                            label: const Text('Add delivery address'),
                          ),
                        ],
                      ),
                    )
                  else ...[
                    for (final address in savedAddresses)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: GlassCard(
                          opaqueTextSurface: true,
                          onTap: () =>
                              setState(() => _selectedAddressId = address.id),
                          child: Row(
                            children: [
                              Icon(
                                selectedId == address.id
                                    ? LucideIcons.checkCircle2
                                    : LucideIcons.circle,
                                color: selectedId == address.id
                                    ? AppColors.primaryRed
                                    : AppColors.mutedText,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      address.label,
                                      style: AppTypography.h4,
                                    ),
                                    Text(
                                      '${address.streetAddress}, ${address.locality}',
                                      style: AppTypography.bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton.icon(
                        onPressed: () => _chooseAddress(context),
                        icon: const Icon(LucideIcons.mapPin, size: 17),
                        label: const Text('Manage addresses'),
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  Text('Order summary', style: AppTypography.h3),
                  const SizedBox(height: 10),
                  GlassCard(
                    opaqueTextSurface: true,
                    child: Column(
                      children: [
                        for (final item in items)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 5),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    '${item.productName} × ${item.quantity}',
                                    style: AppTypography.bodyMedium,
                                  ),
                                ),
                                Text(money.format(item.total)),
                              ],
                            ),
                          ),
                        const Divider(height: 22),
                        _SummaryRow(
                          label: 'Items subtotal',
                          value: money.format(subtotal),
                        ),
                        const SizedBox(height: 7),
                        const Text(
                          'Delivery fees and campaign savings are finalized by the store.',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  GlassCard(
                    opaqueTextSurface: true,
                    child: const Row(
                      children: [
                        Icon(LucideIcons.banknote, color: AppColors.primaryRed),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Cash on delivery',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                        Icon(
                          LucideIcons.checkCircle2,
                          color: AppColors.success,
                        ),
                      ],
                    ),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      _error!,
                      style: const TextStyle(color: AppColors.error),
                    ),
                  ],
                  const SizedBox(height: 18),
                  PrimaryButton(
                    text: 'Place COD order',
                    icon: const Icon(LucideIcons.packageCheck, size: 18),
                    isLoading: _isSubmitting,
                    onPressed: selectedId == null || _isSubmitting
                        ? null
                        : () => _placeOrder(location.store.id, selectedId),
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }

  Future<void> _chooseAddress(BuildContext context) async {
    final selected = await context.push<String>('/addresses');
    if (selected != null && mounted) {
      setState(() {
        _selectedAddressId = selected;
        _error = null;
      });
      ref.invalidate(addressesProvider);
    }
  }

  Future<void> _placeOrder(String storeId, String addressId) async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      final order = await ref
          .read(customerRepositoryProvider)
          .checkout(storeId: storeId, addressId: addressId);
      ref.invalidate(cartProvider(storeId));
      ref.invalidate(ordersProvider);
      if (mounted) context.go('/tracking/${order.id}');
    } catch (error) {
      if (mounted) setState(() => _error = '$error');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value});

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

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
