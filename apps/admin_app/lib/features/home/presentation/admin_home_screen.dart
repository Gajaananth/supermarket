import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/admin_models.dart';
import '../../../core/api/app_error.dart';
import '../../../core/providers.dart';
import '../../../core/widgets/admin_states.dart';

class AdminHomeScreen extends ConsumerStatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  ConsumerState<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends ConsumerState<AdminHomeScreen> {
  bool _loading = true;
  String? _error;
  List<AdminOrder> _orders = const [];
  int? _reportedOrders;
  double? _reportedRevenue;

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
    final auth = ref.read(adminAuthProvider);
    final storeId = auth.selectedStoreId;
    try {
      final orders =
          (await ref.read(adminRepositoryProvider).orders(storeId: storeId))
              .map(AdminOrder.fromJson)
              .toList(growable: false);
      var reportedOrders = orders.length;
      double? reportedRevenue;
      if (auth.session?.isSuperAdmin == true) {
        final now = DateTime.now();
        final today = DateTime(now.year, now.month, now.day);
        final from = today
            .subtract(const Duration(days: 6))
            .toIso8601String()
            .substring(0, 10);
        final to = today
            .add(const Duration(days: 1))
            .toIso8601String()
            .substring(0, 10);
        final report = await ref
            .read(adminRepositoryProvider)
            .reportOverview(from: from, to: to, storeId: storeId);
        final summary = jsonMap(report['summary'], field: 'report summary');
        final reportOrderCount = summary['orders'];
        if (reportOrderCount is num) reportedOrders = reportOrderCount.toInt();
        reportedRevenue = numberValue(
          summary['revenue'],
          field: 'report revenue',
        );
      }
      if (!mounted) return;
      setState(() {
        _orders = orders;
        _reportedOrders = reportedOrders;
        _reportedRevenue = reportedRevenue;
        _loading = false;
      });
    } on AdminApiException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
        _loading = false;
      });
    } on FormatException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<String?>(
      adminAuthProvider.select((state) => state.selectedStoreId),
      (previous, next) {
        if (previous != next) _load();
      },
    );
    final auth = ref.watch(adminAuthProvider);
    if (_loading) return const AdminLoading(label: 'Loading live operations…');
    if (_error != null) {
      return AdminError(message: _error!, onRetry: _load);
    }
    final placed = _orders.where((order) => order.status == 'PLACED').length;
    final preparing = _orders
        .where((order) => order.status == 'PREPARING')
        .length;
    final ready = _orders.where((order) => order.status == 'READY').length;
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          if (auth.pushWarning != null) ...[
            _Notice(message: auth.pushWarning!),
            const SizedBox(height: 12),
          ],
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.primaryRed, AppColors.deepRed],
              ),
              boxShadow: const [
                BoxShadow(
                  color: AppColors.borderRed,
                  blurRadius: 22,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  auth.session?.isSuperAdmin == true
                      ? 'DISTRICT OPERATIONS'
                      : 'STORE OPERATIONS',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Welcome, ${auth.session?.fullName ?? 'Admin'}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 23,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 5),
                const Text(
                  'Live figures from your BuyMe operations',
                  style: TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _MetricCard(
                label: 'Orders · 7 days',
                value: '${_reportedOrders ?? _orders.length}',
                icon: LucideIcons.receiptText,
                color: AppColors.primaryRed,
              ),
              _MetricCard(
                label: 'Awaiting action',
                value: '$placed',
                icon: LucideIcons.bellRing,
                color: AppColors.warning,
              ),
              _MetricCard(
                label: 'Preparing',
                value: '$preparing',
                icon: LucideIcons.packageOpen,
                color: AppColors.info,
              ),
              _MetricCard(
                label: 'Ready for pickup',
                value: '$ready',
                icon: LucideIcons.packageCheck,
                color: AppColors.success,
              ),
            ],
          ),
          if (_reportedRevenue != null) ...[
            const SizedBox(height: 16),
            AdminSectionCard(
              child: Row(
                children: [
                  const Icon(
                    LucideIcons.chartNoAxesCombined,
                    color: AppColors.primaryRed,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Revenue · last 7 days',
                          style: TextStyle(color: AppColors.secondaryText),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          formatLkr(_reportedRevenue),
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Recent orders',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                ),
              ),
              TextButton.icon(
                onPressed: () => context.go('/admin/orders'),
                icon: const Icon(LucideIcons.arrowRight, size: 16),
                label: const Text('View all'),
              ),
            ],
          ),
          if (_orders.isEmpty)
            const AdminEmpty(
              title: 'No recent orders',
              message: 'Orders will appear here when the API receives them.',
            )
          else
            ..._orders.take(5).map((order) => _OrderPreview(order: order)),
          const SizedBox(height: 12),
          AdminSectionCard(
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(LucideIcons.map, color: AppColors.primaryRed),
              title: const Text(
                'Store locations',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
              subtitle: Text('${auth.stores.length} assigned store locations'),
              trailing: const Icon(LucideIcons.chevronRight),
              onTap: () => context.go('/admin/more/stores'),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final width = (MediaQuery.sizeOf(context).width - 44) / 2;
    return SizedBox(
      width: width,
      child: AdminSectionCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 10),
            Text(
              value,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
            ),
            Text(
              label,
              style: const TextStyle(
                color: AppColors.secondaryText,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OrderPreview extends StatelessWidget {
  const _OrderPreview({required this.order});

  final AdminOrder order;

  @override
  Widget build(BuildContext context) => AdminSectionCard(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    child: Row(
      children: [
        const Icon(LucideIcons.shoppingBag, color: AppColors.primaryRed),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                order.orderNumber,
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              Text(
                order.customerName ?? 'Customer details unavailable',
                style: const TextStyle(color: AppColors.secondaryText),
              ),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              formatLkr(order.totalAmount),
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
            Text(order.status.replaceAll('_', ' ')),
          ],
        ),
      ],
    ),
  );
}

class _Notice extends StatelessWidget {
  const _Notice({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) => AdminSectionCard(
    child: Row(
      children: [
        const Icon(LucideIcons.bellOff, color: AppColors.warning),
        const SizedBox(width: 10),
        Expanded(child: Text(message)),
      ],
    ),
  );
}
