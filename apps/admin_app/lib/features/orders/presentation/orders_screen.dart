import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/admin_models.dart';
import '../../../core/api/app_error.dart';
import '../../../core/providers.dart';
import '../../../core/widgets/admin_states.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  bool _loading = true;
  String? _error;
  List<AdminOrder> _orders = const [];

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
      final raw = await ref
          .read(adminRepositoryProvider)
          .orders(storeId: ref.read(adminAuthProvider).selectedStoreId);
      if (!mounted) return;
      setState(() {
        _orders = raw.map(AdminOrder.fromJson).toList(growable: false);
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

  Future<void> _perform(AdminOrder order, String action) async {
    final repository = ref.read(adminRepositoryProvider);
    String? reason;
    String? riderId;
    if (action == 'reject') {
      reason = await _textPrompt(
        title: 'Reject order',
        label: 'Reason',
        requiredField: true,
      );
      if (reason == null) return;
    } else if (action == 'assign-rider') {
      try {
        final riders = await repository.eligibleRiders();
        if (!mounted) return;
        riderId = await _riderPrompt(riders);
        if (riderId == null) return;
      } on AdminApiException catch (error) {
        _notify(error.message);
        return;
      }
    }
    try {
      await repository.updateOrder(
        order.id,
        action,
        reason: reason,
        riderId: riderId,
      );
      await _load();
      _notify('Order updated.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    } on FormatException catch (error) {
      _notify(error.message);
    }
  }

  Future<String?> _textPrompt({
    required String title,
    required String label,
    required bool requiredField,
  }) async {
    final controller = TextEditingController();
    final value = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: TextField(
          controller: controller,
          autofocus: true,
          maxLength: 300,
          decoration: InputDecoration(labelText: label),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              final text = controller.text.trim();
              if (!requiredField || text.isNotEmpty) {
                Navigator.pop(context, text);
              }
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
    controller.dispose();
    return value;
  }

  Future<String?> _riderPrompt(List<JsonMap> riders) async {
    if (riders.isEmpty) {
      _notify('No approved, available riders are assigned to this store.');
      return null;
    }
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Assign an available rider'),
        content: SizedBox(
          width: 420,
          child: ListView(
            shrinkWrap: true,
            children: riders.map((rider) {
              final user = rider['user'] is Map
                  ? jsonMap(rider['user'], field: 'rider')
                  : rider;
              final name = user['fullName'] is String
                  ? user['fullName'] as String
                  : 'Rider';
              final id = rider['id'] is String ? rider['id'] as String : null;
              if (id == null) return const SizedBox.shrink();
              return ListTile(
                leading: const Icon(LucideIcons.userRound),
                title: Text(name),
                subtitle: Text(
                  user['phone'] is String ? user['phone'] as String : '',
                ),
                onTap: () => Navigator.pop(context, id),
              );
            }).toList(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
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
    if (_loading) return const AdminLoading(label: 'Loading orders…');
    if (_error != null) return AdminError(message: _error!, onRetry: _load);
    if (_orders.isEmpty) {
      return const AdminEmpty(
        title: 'No orders',
        message: 'Orders for this account will appear here.',
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Store order queue',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 4),
          const Text(
            'Actions are enforced by the API for your assigned store.',
            style: TextStyle(color: AppColors.secondaryText),
          ),
          const SizedBox(height: 14),
          ..._orders.map(_orderCard),
        ],
      ),
    );
  }

  Widget _orderCard(AdminOrder order) {
    final canAssignRider =
        ref.read(adminAuthProvider).session?.role == 'STORE_ADMIN';
    final actions = switch (order.status) {
      'PLACED' => [
        ('accept', 'Accept', LucideIcons.circleCheck),
        ('reject', 'Reject', LucideIcons.circleX),
      ],
      'ACCEPTED' => [('preparing', 'Start preparing', LucideIcons.packageOpen)],
      'PREPARING' => [('ready', 'Mark ready', LucideIcons.packageCheck)],
      'READY' =>
        canAssignRider
            ? [('assign-rider', 'Assign rider', LucideIcons.motorbike)]
            : <(String, String, IconData)>[],
      _ => <(String, String, IconData)>[],
    };
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AdminSectionCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  LucideIcons.receiptText,
                  color: AppColors.primaryRed,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    order.orderNumber,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
                _StatusPill(status: order.status),
              ],
            ),
            const Divider(height: 22),
            Text(order.customerName ?? 'Customer details unavailable'),
            if (order.customerPhone != null)
              Text(
                order.customerPhone!,
                style: const TextStyle(color: AppColors.secondaryText),
              ),
            if (order.riderName != null)
              Text(
                'Rider: ${order.riderName}',
                style: const TextStyle(color: AppColors.secondaryText),
              ),
            const SizedBox(height: 8),
            Text(
              formatLkr(order.totalAmount),
              style: const TextStyle(fontWeight: FontWeight.w900),
            ),
            if (actions.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: actions.map((action) {
                  final isReject = action.$1 == 'reject';
                  return isReject
                      ? OutlinedButton.icon(
                          onPressed: () => _perform(order, action.$1),
                          icon: Icon(action.$3, size: 17),
                          label: Text(action.$2),
                        )
                      : FilledButton.tonalIcon(
                          onPressed: () => _perform(order, action.$1),
                          icon: Icon(action.$3, size: 17),
                          label: Text(action.$2),
                        );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
    decoration: BoxDecoration(
      color: AppColors.softRed,
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(
      status.replaceAll('_', ' '),
      style: const TextStyle(
        color: AppColors.deepRed,
        fontSize: 11,
        fontWeight: FontWeight.w800,
      ),
    ),
  );
}
