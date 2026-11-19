import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/api_models.dart';
import '../../../core/providers.dart';

class ShopScreen extends ConsumerStatefulWidget {
  const ShopScreen({super.key});

  @override
  ConsumerState<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends ConsumerState<ShopScreen> {
  final _searchController = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final location = ref.watch(selectedLocationProvider);
    if (location == null) {
      return const GlassScaffold(
        body: EmptyState(
          title: 'Choose a delivery location',
          description: 'Select your delivery address to browse nearby stores.',
          actionLabel: 'Set location',
          onAction: null,
        ),
      );
    }

    final store = location.store;
    final query = _query.trim().isEmpty ? null : _query.trim();
    final catalog = ref.watch(catalogProvider((store.id, query)));
    final authenticated = ref.watch(authControllerProvider).isAuthenticated;
    final cartItems = authenticated
        ? ref
              .watch(cartProvider(store.id))
              .maybeWhen(
                data: (items) => items,
                orElse: () => const <CartItem>[],
              )
        : const <CartItem>[];
    final categoryId = GoRouterState.of(
      context,
    ).uri.queryParameters['categoryId'];

    return GlassScaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(catalogProvider((store.id, query)));
          if (authenticated) ref.invalidate(cartProvider(store.id));
        },
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(18, 12, 18, 12),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const BuyMeLogo.wordmark(size: 25),
                        const Spacer(),
                        IconButton(
                          tooltip: 'Change delivery location',
                          onPressed: () => context.go('/location'),
                          icon: const Icon(LucideIcons.mapPin, size: 20),
                        ),
                        IconButton(
                          tooltip: 'Shopping cart',
                          onPressed: () => _requireLogin(context),
                          icon: const Icon(LucideIcons.shoppingCart, size: 20),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('Delivering to', style: AppTypography.label),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(
                          LucideIcons.mapPin,
                          size: 16,
                          color: AppColors.primaryRed,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            location.addressLabel,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    GlassCard(
                      opaqueTextSurface: true,
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          const Icon(
                            LucideIcons.store,
                            color: AppColors.primaryRed,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(store.name, style: AppTypography.h4),
                                Text(
                                  store.distanceKm == null
                                      ? store.locality
                                      : '${store.locality} • ${store.distanceKm!.toStringAsFixed(1)} km away',
                                  style: AppTypography.bodySmall,
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            LucideIcons.checkCircle2,
                            size: 19,
                            color: AppColors.success,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _searchController,
                      textInputAction: TextInputAction.search,
                      onSubmitted: (value) => setState(() => _query = value),
                      decoration: InputDecoration(
                        hintText: 'Search products or barcode',
                        prefixIcon: const Icon(LucideIcons.search, size: 19),
                        suffixIcon: IconButton(
                          tooltip: 'Search',
                          onPressed: () =>
                              setState(() => _query = _searchController.text),
                          icon: const Icon(LucideIcons.arrowRight, size: 19),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            categoryId == null
                                ? 'Popular products'
                                : 'Category',
                            style: AppTypography.h3,
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () => context.go('/categories'),
                          icon: const Icon(LucideIcons.layoutGrid, size: 16),
                          label: const Text('Categories'),
                        ),
                      ],
                    ),
                    if (categoryId != null)
                      Align(
                        alignment: Alignment.centerLeft,
                        child: ActionChip(
                          label: const Text('Clear category'),
                          avatar: const Icon(LucideIcons.x, size: 15),
                          onPressed: () => context.go('/shop'),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            catalog.when(
              loading: () => const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (error, stackTrace) => SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorState(
                  message: '$error',
                  onRetry: () =>
                      ref.invalidate(catalogProvider((store.id, query))),
                ),
              ),
              data: (products) {
                final shownProducts = categoryId == null
                    ? products
                    : products
                          .where((product) => product.categoryId == categoryId)
                          .toList(growable: false);
                if (shownProducts.isEmpty) {
                  return const SliverFillRemaining(
                    hasScrollBody: false,
                    child: EmptyState(
                      title: 'No products found',
                      description:
                          'Try another search or choose a different category.',
                      icon: LucideIcons.packageSearch,
                    ),
                  );
                }
                return SliverPadding(
                  padding: const EdgeInsets.fromLTRB(18, 0, 18, 28),
                  sliver: SliverGrid(
                    gridDelegate:
                        const SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 230,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 14,
                          mainAxisExtent: 254,
                        ),
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final product = shownProducts[index];
                      final quantity = _quantity(cartItems, product);
                      return ProductCard(
                        id: product.storeProductId,
                        name: product.name,
                        nameTa: product.nameTa,
                        unit: product.unit,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        inStock: product.available,
                        quantityInCart: quantity,
                        onAdd: () => _changeQuantity(product, 1),
                        onIncrement: () => _changeQuantity(product, 1),
                        onDecrement: () => _changeQuantity(product, -1),
                      );
                    }, childCount: shownProducts.length),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  int _quantity(List<CartItem> cart, CatalogProduct product) {
    for (final item in cart) {
      if (item.storeProductId == product.storeProductId) return item.quantity;
    }
    return 0;
  }

  Future<void> _changeQuantity(CatalogProduct product, int change) async {
    final location = ref.read(selectedLocationProvider);
    if (location == null) return;
    if (!ref.read(authControllerProvider).isAuthenticated) {
      _requireLogin(context);
      return;
    }
    try {
      final items = await ref.read(cartProvider(location.store.id).future);
      final quantity = _quantity(items, product) + change;
      if (quantity <= 0) {
        await ref
            .read(customerRepositoryProvider)
            .removeFromCart(
              storeId: location.store.id,
              storeProductId: product.storeProductId,
            );
      } else if (_quantity(items, product) == 0) {
        await ref
            .read(customerRepositoryProvider)
            .addToCart(
              storeId: location.store.id,
              storeProductId: product.storeProductId,
              quantity: quantity,
            );
      } else {
        await ref
            .read(customerRepositoryProvider)
            .setCartQuantity(
              storeId: location.store.id,
              storeProductId: product.storeProductId,
              quantity: quantity,
            );
      }
      ref.invalidate(cartProvider(location.store.id));
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('$error')));
      }
    }
  }

  void _requireLogin(BuildContext context) {
    if (!ref.read(authControllerProvider).isAuthenticated) {
      context.go('/login?redirect=%2Fcart');
    } else {
      context.go('/cart');
    }
  }
}
