import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/app_error.dart';
import '../../../core/providers.dart';
import '../../../core/widgets/admin_states.dart';

class InventoryScreen extends ConsumerStatefulWidget {
  const InventoryScreen({super.key});

  @override
  ConsumerState<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends ConsumerState<InventoryScreen> {
  bool _loading = true;
  String? _error;
  List<JsonMap> _stocks = const [];
  List<JsonMap> _alerts = const [];
  final _query = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final storeId = ref.read(adminAuthProvider).selectedStoreId;
    if (storeId == null) {
      setState(() {
        _error = 'Choose a store before loading inventory.';
        _loading = false;
      });
      return;
    }
    if (mounted) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final repository = ref.read(adminRepositoryProvider);
      final result = await Future.wait([
        repository.storeStock(storeId),
        repository.storeAlerts(storeId),
      ]);
      if (!mounted) return;
      setState(() {
        _stocks = result[0];
        _alerts = result[1];
        _loading = false;
      });
    } on AdminApiException catch (error) {
      if (mounted) {
        setState(() {
          _error = error.message;
          _loading = false;
        });
      }
    } on FormatException catch (error) {
      if (mounted) {
        setState(() {
          _error = error.message;
          _loading = false;
        });
      }
    }
  }

  Future<void> _adjust(JsonMap product) async {
    final id = product['id'] is String ? product['id'] as String : null;
    final storeId = ref.read(adminAuthProvider).selectedStoreId;
    if (id == null || storeId == null) {
      _notify('The API response is missing the product or store identifier.');
      return;
    }
    final quantity = TextEditingController();
    final reason = TextEditingController();
    final result = await showDialog<(double, String)>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Adjust ${_productName(product)}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: quantity,
              keyboardType: const TextInputType.numberWithOptions(
                signed: true,
                decimal: true,
              ),
              decoration: const InputDecoration(
                labelText: 'Quantity change (+/-)',
                helperText: 'Use a negative number to remove stock.',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reason,
              maxLength: 250,
              decoration: const InputDecoration(labelText: 'Reason'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              final delta = double.tryParse(quantity.text.trim());
              final note = reason.text.trim();
              if (delta == null ||
                  !delta.isFinite ||
                  delta == 0 ||
                  note.isEmpty) {
                return;
              }
              Navigator.pop(context, (delta, note));
            },
            child: const Text('Apply adjustment'),
          ),
        ],
      ),
    );
    quantity.dispose();
    reason.dispose();
    if (result == null) return;
    try {
      await ref
          .read(adminRepositoryProvider)
          .adjustStoreStock(
            storeId: storeId,
            productId: id,
            quantityDelta: result.$1,
            reason: result.$2,
          );
      await _load();
      _notify('Stock adjustment saved.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    } on FormatException catch (error) {
      _notify(error.message);
    }
  }

  Future<void> _acknowledge(String alertId) async {
    final storeId = ref.read(adminAuthProvider).selectedStoreId;
    if (storeId == null) return;
    try {
      await ref
          .read(adminRepositoryProvider)
          .acknowledgeStoreAlert(storeId: storeId, alertId: alertId);
      await _load();
    } on AdminApiException catch (error) {
      _notify(error.message);
    }
  }

  String _productName(JsonMap product) {
    final value = product['name'];
    return value is String ? value : 'Product';
  }

  void _notify(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<String?>(
      adminAuthProvider.select((state) => state.selectedStoreId),
      (oldValue, newValue) {
        if (oldValue != newValue) _load();
      },
    );
    if (_loading) return const AdminLoading(label: 'Loading store inventory…');
    if (_error != null) return AdminError(message: _error!, onRetry: _load);
    final query = _query.text.trim().toLowerCase();
    final filtered = _stocks.where((stock) {
      final product = stock['product'] is Map
          ? jsonMap(stock['product'], field: 'stock product')
          : stock;
      final content = [
        product['name'],
        product['sku'],
        product['barcode'],
        if (product['barcodes'] is List)
          ...(product['barcodes'] as List).map((barcode) {
            if (barcode is Map) return barcode['barcode'];
            return barcode;
          }),
      ].join(' ').toLowerCase();
      return query.isEmpty || content.contains(query);
    }).toList();
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Store stock',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          const Text(
            'Search by product, SKU, or barcode. Adjustments are recorded by the API.',
            style: TextStyle(color: AppColors.secondaryText),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _query,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              prefixIcon: const Icon(LucideIcons.search),
              hintText: 'Search name or barcode',
              suffixIcon: _query.text.isEmpty
                  ? null
                  : IconButton(
                      onPressed: () => setState(_query.clear),
                      icon: const Icon(LucideIcons.x),
                    ),
            ),
          ),
          if (_alerts.isNotEmpty) ...[
            const SizedBox(height: 20),
            Text(
              'Low-stock alerts (${_alerts.length})',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            ..._alerts.map(_alertCard),
          ],
          const SizedBox(height: 14),
          Text(
            'Products (${filtered.length})',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          if (filtered.isEmpty)
            const AdminEmpty(
              title: 'No matching products',
              message: 'Try another product name, SKU, or barcode.',
            )
          else
            ...filtered.map(_stockCard),
        ],
      ),
    );
  }

  Widget _stockCard(JsonMap stock) {
    final product = stock['product'] is Map
        ? jsonMap(stock['product'], field: 'stock product')
        : stock;
    final quantity = stock['quantityOnHand'] ?? stock['stock'];
    final reorder = stock['reorderLevel'];
    final isLow = quantity is num && reorder is num && quantity <= reorder;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: AdminSectionCard(
        child: Row(
          children: [
            const Icon(LucideIcons.package, color: AppColors.primaryRed),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _productName(product),
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  Text(
                    [
                      if (product['sku'] is String) 'SKU ${product['sku']}',
                      if (quantity != null) 'On hand $quantity',
                      if (reorder != null) 'Reorder at $reorder',
                    ].join(' · '),
                    style: const TextStyle(color: AppColors.secondaryText),
                  ),
                ],
              ),
            ),
            IconButton(
              tooltip: 'Adjust stock',
              onPressed: () => _adjust(product),
              icon: const Icon(LucideIcons.slidersHorizontal),
            ),
            if (isLow)
              const Icon(LucideIcons.triangleAlert, color: AppColors.warning),
          ],
        ),
      ),
    );
  }

  Widget _alertCard(JsonMap alert) {
    final id = alert['id'] is String ? alert['id'] as String : null;
    final product = alert['product'] is Map
        ? jsonMap(alert['product'], field: 'alert product')
        : alert;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AdminSectionCard(
        child: Row(
          children: [
            const Icon(LucideIcons.triangleAlert, color: AppColors.warning),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                '${_productName(product)} · ${alert['quantityOnHand'] ?? 'Low stock'} remaining',
              ),
            ),
            if (id != null)
              TextButton(
                onPressed: () => _acknowledge(id),
                child: const Text('Acknowledge'),
              ),
          ],
        ),
      ),
    );
  }
}
