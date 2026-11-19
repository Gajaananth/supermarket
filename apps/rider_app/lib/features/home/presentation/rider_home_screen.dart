import 'dart:async';

import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/app_error.dart';
import '../../../core/api/rider_models.dart';
import '../../../core/providers.dart';

class RiderHomeScreen extends ConsumerStatefulWidget {
  const RiderHomeScreen({super.key});

  @override
  ConsumerState<RiderHomeScreen> createState() => _RiderHomeScreenState();
}

class _RiderHomeScreenState extends ConsumerState<RiderHomeScreen> {
  List<RiderOrder> _orders = const [];
  JsonMap? _kyc;
  bool _loading = true;
  bool _shiftBusy = false;
  String? _error;
  int _tab = 0;
  Timer? _poll;
  StreamSubscription<void>? _storeEvents;

  @override
  void initState() {
    super.initState();
    _refresh();
    _poll = Timer.periodic(const Duration(seconds: 25), (_) => _refresh());
  }

  @override
  void dispose() {
    _poll?.cancel();
    _storeEvents?.cancel();
    super.dispose();
  }

  Future<void> _refresh() async {
    try {
      final repository = ref.read(riderRepositoryProvider);
      final status = await repository.kycStatus();
      if (stringValue(status['kycStatus']) == 'APPROVED' &&
          stringValue(status['assignedStoreId']).isNotEmpty &&
          _storeEvents == null) {
        _storeEvents = ref
            .read(riderRealtimeProvider)
            .watchStore(stringValue(status['assignedStoreId']))
            .listen((_) => _refresh());
      }
      final orders = stringValue(status['kycStatus']) == 'APPROVED'
          ? await repository.orders()
          : const <RiderOrder>[];
      if (!mounted) return;
      setState(() {
        _kyc = status;
        _orders = orders;
        _error = null;
        _loading = false;
      });
    } on AppError catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = 'Unable to load dispatch: $error';
        _loading = false;
      });
    }
  }

  List<RiderOrder> get _activeOrders => _orders
      .where((order) => const {
        'RIDER_ASSIGNED',
        'PICKED_UP',
        'ON_THE_WAY',
      }.contains(order.status))
      .toList(growable: false);

  List<RiderOrder> get _tripHistory => _orders
      .where((order) => const {'DELIVERED', 'FAILED'}.contains(order.status))
      .toList(growable: false);

  bool get _approved =>
      stringValue(_kyc?['kycStatus']) == 'APPROVED' &&
      stringValue(_kyc?['assignedStoreId']).isNotEmpty;
  bool get _shiftActive => _kyc?['isShiftActive'] == true;

  Future<void> _toggleShift() async {
    setState(() {
      _shiftBusy = true;
      _error = null;
    });
    try {
      final repository = ref.read(riderRepositoryProvider);
      if (_shiftActive) {
        await repository.stopShift();
      } else {
        await repository.startShift();
      }
      await _refresh();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_shiftActive ? 'Shift started.' : 'Shift ended.')),
        );
      }
    } on AppError catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (error) {
      if (mounted) setState(() => _error = 'Could not change shift status: $error');
    } finally {
      if (mounted) setState(() => _shiftBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = switch (_tab) {
      1 => 'Trip history',
      2 => 'Rider account',
      _ => 'Dispatch',
    };
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
            if (_approved)
              Text(
                stringValue(_kyc?['assignedStoreName']),
                style: Theme.of(context).textTheme.labelSmall,
              ),
          ],
        ),
        actions: [
          if (_approved)
            TextButton.icon(
              onPressed: _shiftBusy ? null : _toggleShift,
              icon: Icon(_shiftActive ? LucideIcons.powerOff : LucideIcons.power),
              label: Text(_shiftActive ? 'End shift' : 'Start shift'),
            ),
          IconButton(
            tooltip: 'Refresh',
            onPressed: _loading ? null : _refresh,
            icon: const Icon(LucideIcons.refreshCw),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : !_approved
              ? _KycGate(status: _kyc, error: _error)
              : IndexedStack(
                  index: _tab,
                  children: [
                    _DispatchTab(
                      orders: _activeOrders,
                      error: _error,
                      onRefresh: _refresh,
                    ),
                    _TripsTab(
                      orders: _tripHistory,
                      error: _error,
                      onRefresh: _refresh,
                    ),
                    const _AccountTab(),
                  ],
                ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (index) => setState(() => _tab = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.bike),
            label: 'Dispatch',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.history),
            label: 'Trips',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.userRound),
            label: 'Account',
          ),
        ],
      ),
    );
  }
}

class _KycGate extends StatelessWidget {
  const _KycGate({required this.status, required this.error});
  final JsonMap? status;
  final String? error;

  @override
  Widget build(BuildContext context) {
    final state = stringValue(status?['kycStatus'], fallback: 'NOT VERIFIED');
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const BuyMeLogo(),
        const SizedBox(height: 24),
        GlassCard(
          opaqueTextSurface: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _StatusChip(state),
              const SizedBox(height: 14),
              Text(
                state == 'PENDING'
                    ? 'Your documents are under review.'
                    : state == 'REJECTED'
                        ? 'Update your documents to request another review.'
                        : 'Finish rider verification before taking deliveries.',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              if (stringValue(status?['rejectionReason']).isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text('Review note: ${status!['rejectionReason']}'),
                ),
              if (error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ),
              if (state != 'PENDING') ...[
                const SizedBox(height: 18),
                FilledButton(
                  onPressed: () => context.push('/kyc'),
                  child: const Text('Open verification'),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _DispatchTab extends StatelessWidget {
  const _DispatchTab({
    required this.orders,
    required this.error,
    required this.onRefresh,
  });
  final List<RiderOrder> orders;
  final String? error;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) => RefreshIndicator(
    onRefresh: onRefresh,
    child: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        GlassCard(
          opaqueTextSurface: true,
          child: Row(
            children: [
              const Icon(LucideIcons.shieldCheck, color: AppColors.success),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Only orders assigned to your approved rider account appear here.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        if (error != null) _ErrorCard(error: error!, onRetry: onRefresh),
        if (orders.isEmpty && error == null)
          const EmptyState(
            title: 'No active deliveries',
            description: 'New assignments will appear here. This screen refreshes automatically.',
            icon: LucideIcons.packageOpen,
          ),
        for (final order in orders) ...[
          _OrderCard(order: order),
          const SizedBox(height: 12),
        ],
      ],
    ),
  );
}

class _TripsTab extends StatelessWidget {
  const _TripsTab({
    required this.orders,
    required this.error,
    required this.onRefresh,
  });
  final List<RiderOrder> orders;
  final String? error;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) => RefreshIndicator(
    onRefresh: onRefresh,
    child: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (error != null) _ErrorCard(error: error!, onRetry: onRefresh),
        if (orders.isEmpty && error == null)
          const EmptyState(
            title: 'No completed trips yet',
            description: 'Completed and failed deliveries will be listed here.',
            icon: LucideIcons.history,
          ),
        for (final order in orders) ...[
          _OrderCard(order: order, compact: true),
          const SizedBox(height: 10),
        ],
      ],
    ),
  );
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order, this.compact = false});
  final RiderOrder order;
  final bool compact;

  @override
  Widget build(BuildContext context) => GlassCard(
    opaqueTextSurface: true,
    onTap: () => context.push('/delivery/${order.id}'),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                order.number,
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
            _StatusChip(order.status),
          ],
        ),
        const SizedBox(height: 10),
        Text(order.deliveryLabel.isEmpty ? 'Delivery location unavailable' : order.deliveryLabel),
        if (!compact) ...[
          const SizedBox(height: 8),
          Text('${order.items.length} items • COD LKR ${order.total.toStringAsFixed(2)}'),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: () => context.push('/delivery/${order.id}'),
              icon: const Icon(LucideIcons.navigation, size: 18),
              label: const Text('Open delivery'),
            ),
          ),
        ],
      ],
    ),
  );
}

class _AccountTab extends ConsumerWidget {
  const _AccountTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) => ListView(
    padding: const EdgeInsets.all(16),
    children: [
      GlassCard(
        opaqueTextSurface: true,
        child: Column(
          children: [
            const CircleAvatar(
              radius: 34,
              backgroundColor: AppColors.primaryRed,
              child: Icon(LucideIcons.userRound, color: Colors.white, size: 30),
            ),
            const SizedBox(height: 10),
            FutureBuilder<JsonMap>(
              future: ref.read(riderRepositoryProvider).profile(),
              builder: (context, snapshot) {
                final user = snapshot.data?['user'];
                final name = user is Map ? stringValue(user['fullName']) : '';
                return Text(name.isEmpty ? 'Rider account' : name);
              },
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(LucideIcons.wallet),
              title: const Text('Cash & deposits'),
              trailing: const Icon(LucideIcons.chevronRight),
              onTap: () => context.push('/cash'),
            ),
            ListTile(
              leading: const Icon(LucideIcons.fileCheck2),
              title: const Text('KYC verification'),
              trailing: const Icon(LucideIcons.chevronRight),
              onTap: () => context.push('/kyc'),
            ),
            ListTile(
              leading: const Icon(LucideIcons.logOut),
              title: const Text('Sign out'),
              onTap: () => ref.read(riderAuthProvider.notifier).signOut(),
            ),
          ],
        ),
      ),
    ],
  );
}

class _StatusChip extends StatelessWidget {
  const _StatusChip(this.value);
  final String value;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(
      color: const Color(0xFFFFF6D6),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(
      value.replaceAll('_', ' '),
      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
    ),
  );
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.error, required this.onRetry});
  final String error;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) => ErrorState(
    message: error,
    onRetry: () => onRetry(),
  );
}
