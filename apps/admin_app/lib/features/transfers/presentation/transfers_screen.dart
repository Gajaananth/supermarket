import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../api/generated/buyme.enums.swagger.dart' as enums;
import '../../../api/generated/buyme.swagger.dart';
import '../../../core/api/app_error.dart';
import '../../../core/providers.dart';
import '../../../core/widgets/admin_states.dart';

class TransfersScreen extends ConsumerStatefulWidget {
  const TransfersScreen({super.key});

  @override
  ConsumerState<TransfersScreen> createState() => _TransfersScreenState();
}

class _TransfersScreenState extends ConsumerState<TransfersScreen> {
  bool _loading = true;
  String? _error;
  List<JsonMap> _transfers = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (mounted) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final values = await ref
          .read(adminRepositoryProvider)
          .transfers(storeId: ref.read(adminAuthProvider).selectedStoreId);
      if (!mounted) return;
      setState(() {
        _transfers = values;
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

  Future<void> _createTransfer() async {
    final auth = ref.read(adminAuthProvider);
    final storeId = auth.selectedStoreId;
    if (storeId == null) {
      _notify('Select a destination store first.');
      return;
    }
    try {
      final stock = await ref.read(adminRepositoryProvider).storeStock(storeId);
      if (!mounted) return;
      final items = await showDialog<List<TransferLineDto>>(
        context: context,
        builder: (context) => _CreateTransferDialog(stock: stock),
      );
      if (items == null || items.isEmpty) return;
      await ref
          .read(adminRepositoryProvider)
          .createTransfer(storeId: storeId, items: items);
      await _load();
      _notify('Transfer draft created.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    } on FormatException catch (error) {
      _notify(error.message);
    }
  }

  Future<void> _dispatch(String id) async {
    try {
      await ref.read(adminRepositoryProvider).dispatchTransfer(id);
      await _load();
      _notify('Transfer dispatched.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    }
  }

  Future<void> _receive(JsonMap transfer) async {
    final id = transfer['id'] is String ? transfer['id'] as String : null;
    final lines = transfer['items'] is List ? transfer['items'] as List : null;
    if (id == null || lines == null) {
      _notify('The transfer response is missing its id or item list.');
      return;
    }
    final items = lines
        .whereType<Map>()
        .map((item) => Map<String, Object?>.from(item))
        .toList();
    final result = await showDialog<List<ReceiveTransferLineDto>>(
      context: context,
      builder: (context) => _ReceiveTransferDialog(items: items),
    );
    if (result == null) return;
    try {
      await ref
          .read(adminRepositoryProvider)
          .receiveTransfer(id: id, items: result);
      await _load();
      _notify('Transfer receipt submitted.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    }
  }

  Future<void> _resolve(JsonMap transfer) async {
    final id = transfer['id'] is String ? transfer['id'] as String : null;
    final lines = transfer['items'] is List ? transfer['items'] as List : null;
    if (id == null || lines == null) return;
    final result = await showDialog<(String, List<ResolveTransferLineDto>)>(
      context: context,
      builder: (context) => _ResolveTransferDialog(
        items: lines
            .whereType<Map>()
            .map((item) => Map<String, Object?>.from(item))
            .toList(),
      ),
    );
    if (result == null) return;
    try {
      await ref
          .read(adminRepositoryProvider)
          .resolveTransfer(id: id, resolutionNote: result.$1, items: result.$2);
      await _load();
      _notify('Transfer discrepancies resolved.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    }
  }

  Future<void> _changeState(
    String id,
    Future<void> Function(String) action,
    String success,
  ) async {
    try {
      await action(id);
      await _load();
      _notify(success);
    } on AdminApiException catch (error) {
      _notify(error.message);
    }
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
    final isSuperAdmin =
        ref.watch(adminAuthProvider).session?.isSuperAdmin == true;
    if (_loading) return const AdminLoading(label: 'Loading stock transfers…');
    if (_error != null) return AdminError(message: _error!, onRetry: _load);
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Stock transfers',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                ),
              ),
              if (isSuperAdmin)
                FilledButton.icon(
                  onPressed: _createTransfer,
                  icon: const Icon(LucideIcons.plus, size: 18),
                  label: const Text('New'),
                ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Warehouse dispatch is restricted to Super Admin. Store Admins can record receipts for their assigned store.',
            style: TextStyle(color: AppColors.secondaryText),
          ),
          const SizedBox(height: 14),
          if (_transfers.isEmpty)
            const AdminEmpty(
              title: 'No transfers',
              message: 'Transfer records will appear here when created.',
            )
          else
            ..._transfers.map(
              (transfer) => _transferCard(transfer, isSuperAdmin),
            ),
        ],
      ),
    );
  }

  Widget _transferCard(JsonMap transfer, bool isSuperAdmin) {
    final id = transfer['id'] is String ? transfer['id'] as String : null;
    final status = transfer['status'] is String
        ? transfer['status'] as String
        : 'UNKNOWN';
    final number = transfer['transferNumber'] is String
        ? transfer['transferNumber'] as String
        : 'Transfer';
    final store = transfer['toStore'] is Map
        ? jsonMap(transfer['toStore'], field: 'transfer destination')
        : const <String, Object?>{};
    final lines = transfer['items'] is List
        ? transfer['items'] as List
        : const [];
    final hasDiscrepancy = lines.whereType<Map>().any((item) {
      final quantity = item['discrepancyQuantity'];
      return quantity is num && quantity > 0;
    });
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AdminSectionCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(LucideIcons.truck, color: AppColors.primaryRed),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    number,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
                _StateBadge(status: status),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              store['name'] is String
                  ? store['name'] as String
                  : 'Destination store',
              style: const TextStyle(color: AppColors.secondaryText),
            ),
            const Divider(height: 20),
            ...lines.whereType<Map>().map((raw) {
              final item = Map<String, Object?>.from(raw);
              final product = item['masterProduct'] is Map
                  ? jsonMap(item['masterProduct'], field: 'transfer product')
                  : const <String, Object?>{};
              final requested = item['requestedQuantity'] ?? 0;
              final dispatched = item['dispatchedQuantity'] ?? 0;
              final received = item['receivedQuantity'] ?? 0;
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text(
                  '${product['name'] ?? 'Product'} · requested $requested · sent $dispatched · received $received',
                  style: const TextStyle(fontSize: 13),
                ),
              );
            }),
            if (id != null) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  if (isSuperAdmin && status == 'DRAFT')
                    FilledButton.tonalIcon(
                      onPressed: () => _dispatch(id),
                      icon: const Icon(LucideIcons.send, size: 17),
                      label: const Text('Dispatch'),
                    ),
                  if (!isSuperAdmin && status == 'DISPATCHED')
                    FilledButton.tonalIcon(
                      onPressed: () => _receive(transfer),
                      icon: const Icon(LucideIcons.packageCheck, size: 17),
                      label: const Text('Record receipt'),
                    ),
                  if (isSuperAdmin &&
                      hasDiscrepancy &&
                      (status == 'RECEIVED_PARTIAL' ||
                          status == 'RECEIVED_FULL'))
                    OutlinedButton.icon(
                      onPressed: () => _resolve(transfer),
                      icon: const Icon(LucideIcons.scale, size: 17),
                      label: const Text('Resolve discrepancy'),
                    ),
                  if (isSuperAdmin &&
                      (status == 'RECEIVED_PARTIAL' ||
                          status == 'RECEIVED_FULL'))
                    OutlinedButton.icon(
                      onPressed: () => _changeState(
                        id,
                        ref.read(adminRepositoryProvider).revertTransfer,
                        'Transfer reverted.',
                      ),
                      icon: const Icon(LucideIcons.undo2, size: 17),
                      label: const Text('Revert'),
                    ),
                  if (isSuperAdmin && status == 'DRAFT')
                    TextButton(
                      onPressed: () => _changeState(
                        id,
                        ref.read(adminRepositoryProvider).cancelTransfer,
                        'Transfer cancelled.',
                      ),
                      child: const Text('Cancel draft'),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _CreateTransferDialog extends StatefulWidget {
  const _CreateTransferDialog({required this.stock});
  final List<JsonMap> stock;

  @override
  State<_CreateTransferDialog> createState() => _CreateTransferDialogState();
}

class _CreateTransferDialogState extends State<_CreateTransferDialog> {
  final Map<String, TextEditingController> _quantities = {};
  final Set<String> _selected = {};

  @override
  void dispose() {
    for (final controller in _quantities.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final products = widget.stock
        .map((row) {
          final product = row['masterProduct'] is Map
              ? jsonMap(row['masterProduct'], field: 'stock product')
              : const <String, Object?>{};
          return (
            product,
            product['id'] is String ? product['id'] as String : '',
          );
        })
        .where((value) => value.$2.isNotEmpty)
        .toList();
    return AlertDialog(
      title: const Text('Create transfer draft'),
      content: SizedBox(
        width: 480,
        child: products.isEmpty
            ? const Text('No stock products are available for this store.')
            : ListView(
                shrinkWrap: true,
                children: products.map((entry) {
                  final id = entry.$2;
                  _quantities.putIfAbsent(
                    id,
                    () => TextEditingController(text: '1'),
                  );
                  return Row(
                    children: [
                      Expanded(child: Text('${entry.$1['name'] ?? 'Product'}')),
                      Checkbox(
                        value: _selected.contains(id),
                        onChanged: (selected) => setState(() {
                          if (selected == true) {
                            _selected.add(id);
                          } else {
                            _selected.remove(id);
                          }
                        }),
                      ),
                      SizedBox(
                        width: 72,
                        child: TextField(
                          controller: _quantities[id],
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Qty'),
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () {
            final result = <TransferLineDto>[];
            for (final id in _selected) {
              final quantity = double.tryParse(_quantities[id]!.text.trim());
              if (quantity == null || quantity <= 0) return;
              result.add(
                TransferLineDto(productId: id, requestedQuantity: quantity),
              );
            }
            if (result.isNotEmpty) Navigator.pop(context, result);
          },
          child: const Text('Create draft'),
        ),
      ],
    );
  }
}

class _ReceiveTransferDialog extends StatefulWidget {
  const _ReceiveTransferDialog({required this.items});
  final List<JsonMap> items;

  @override
  State<_ReceiveTransferDialog> createState() => _ReceiveTransferDialogState();
}

class _ReceiveTransferDialogState extends State<_ReceiveTransferDialog> {
  final Map<String, TextEditingController> _received = {};
  final Map<String, TextEditingController> _notes = {};

  @override
  void dispose() {
    for (final controller in [..._received.values, ..._notes.values]) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: const Text('Record transfer receipt'),
    content: SizedBox(
      width: 480,
      child: ListView(
        shrinkWrap: true,
        children: widget.items.map((item) {
          final product = item['masterProduct'] is Map
              ? jsonMap(item['masterProduct'], field: 'transfer product')
              : const <String, Object?>{};
          final id = item['masterProductId'] is String
              ? item['masterProductId'] as String
              : item['productId'] as String? ?? '';
          final quantity = item['dispatchedQuantity'] ?? 0;
          _received.putIfAbsent(
            id,
            () => TextEditingController(text: '$quantity'),
          );
          _notes.putIfAbsent(id, TextEditingController.new);
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${product['name'] ?? 'Product'} · sent $quantity',
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _received[id],
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: const InputDecoration(labelText: 'Received'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _notes[id],
                      decoration: const InputDecoration(labelText: 'Note'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
          );
        }).toList(),
      ),
    ),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Cancel'),
      ),
      FilledButton(
        onPressed: () {
          final results = <ReceiveTransferLineDto>[];
          for (final item in widget.items) {
            final id = item['masterProductId'] is String
                ? item['masterProductId'] as String
                : item['productId'] as String? ?? '';
            final quantity = double.tryParse(_received[id]?.text.trim() ?? '');
            final dispatched = item['dispatchedQuantity'];
            if (id.isEmpty ||
                quantity == null ||
                quantity < 0 ||
                dispatched is! num ||
                quantity > dispatched) {
              return;
            }
            results.add(
              ReceiveTransferLineDto(
                productId: id,
                receivedQuantity: quantity,
                notes: _notes[id]?.text.trim(),
              ),
            );
          }
          Navigator.pop(context, results);
        },
        child: const Text('Submit receipt'),
      ),
    ],
  );
}

class _ResolveTransferDialog extends StatefulWidget {
  const _ResolveTransferDialog({required this.items});
  final List<JsonMap> items;

  @override
  State<_ResolveTransferDialog> createState() => _ResolveTransferDialogState();
}

class _ResolveTransferDialogState extends State<_ResolveTransferDialog> {
  final _note = TextEditingController();
  final Map<String, enums.ResolveTransferLineDtoResolution> _choices = {};

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: const Text('Resolve transfer discrepancy'),
    content: SizedBox(
      width: 480,
      child: ListView(
        shrinkWrap: true,
        children: [
          ...widget.items.map((item) {
            final discrepancy = item['discrepancyQuantity'];
            if (discrepancy is! num || discrepancy <= 0) {
              return const SizedBox.shrink();
            }
            final product = item['masterProduct'] is Map
                ? jsonMap(item['masterProduct'], field: 'transfer product')
                : const <String, Object?>{};
            final id = item['masterProductId'] is String
                ? item['masterProductId'] as String
                : '';
            _choices.putIfAbsent(
              id,
              () => enums.ResolveTransferLineDtoResolution.writeOff,
            );
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${product['name'] ?? 'Product'} · missing $discrepancy'),
                DropdownButton<enums.ResolveTransferLineDtoResolution>(
                  value: _choices[id],
                  isExpanded: true,
                  items: const [
                    DropdownMenuItem(
                      value: enums.ResolveTransferLineDtoResolution.writeOff,
                      child: Text('Write off missing stock'),
                    ),
                    DropdownMenuItem(
                      value: enums
                          .ResolveTransferLineDtoResolution
                          .returnToWarehouse,
                      child: Text('Return to warehouse'),
                    ),
                  ],
                  onChanged: (value) {
                    if (value != null) setState(() => _choices[id] = value);
                  },
                ),
              ],
            );
          }),
          TextField(
            controller: _note,
            maxLength: 300,
            decoration: const InputDecoration(labelText: 'Resolution note'),
          ),
        ],
      ),
    ),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Cancel'),
      ),
      FilledButton(
        onPressed: () {
          if (_note.text.trim().isEmpty) return;
          final items = _choices.entries
              .map(
                (entry) => ResolveTransferLineDto(
                  productId: entry.key,
                  resolution: entry.value,
                ),
              )
              .toList();
          if (items.isNotEmpty) {
            Navigator.pop(context, (_note.text.trim(), items));
          }
        },
        child: const Text('Resolve'),
      ),
    ],
  );
}

class _StateBadge extends StatelessWidget {
  const _StateBadge({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
    decoration: BoxDecoration(
      color: status == 'DISPATCHED'
          ? AppColors.infoLight
          : AppColors.softYellow,
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(
      status.replaceAll('_', ' '),
      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800),
    ),
  );
}
