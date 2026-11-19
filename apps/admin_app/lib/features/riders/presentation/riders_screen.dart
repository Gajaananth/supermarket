import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../api/generated/buyme.enums.swagger.dart' as enums;
import '../../../core/api/admin_models.dart';
import '../../../core/api/app_error.dart';
import '../../../core/providers.dart';
import '../../../core/widgets/admin_states.dart';

class RidersScreen extends ConsumerStatefulWidget {
  const RidersScreen({super.key});

  @override
  ConsumerState<RidersScreen> createState() => _RidersScreenState();
}

class _RidersScreenState extends ConsumerState<RidersScreen> {
  bool _loading = true;
  String? _error;
  List<JsonMap> _riders = const [];
  String? _selectedRiderId;
  JsonMap? _details;
  bool _detailsLoading = false;

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
      final response = await ref
          .read(adminRepositoryProvider)
          .riderReviewQueue();
      final items = jsonMaps(response['items'], field: 'rider review queue');
      if (!mounted) return;
      setState(() {
        _riders = items;
        _loading = false;
        if (!_riders.any((rider) => rider['id'] == _selectedRiderId)) {
          _selectedRiderId = null;
          _details = null;
        }
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

  Future<void> _select(JsonMap rider) async {
    final id = rider['id'] is String ? rider['id'] as String : null;
    if (id == null) return;
    setState(() {
      _selectedRiderId = id;
      _details = null;
      _detailsLoading = true;
    });
    try {
      final details = await ref
          .read(adminRepositoryProvider)
          .riderReviewDetails(id);
      if (mounted && _selectedRiderId == id) {
        setState(() {
          _details = details;
          _detailsLoading = false;
        });
      }
    } on AdminApiException catch (error) {
      if (mounted) {
        setState(() => _detailsLoading = false);
        _notify(error.message);
      }
    } on FormatException catch (error) {
      if (mounted) {
        setState(() => _detailsLoading = false);
        _notify(error.message);
      }
    }
  }

  Future<void> _reviewDocument(String type) async {
    final riderId = _selectedRiderId;
    if (riderId == null) return;
    try {
      final url = await ref
          .read(adminRepositoryProvider)
          .riderDocumentUrl(riderId: riderId, documentType: type);
      final opened = await launchUrl(
        Uri.parse(url),
        mode: LaunchMode.externalApplication,
      );
      if (!opened) _notify('Could not open the private document link.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    } on FormatException catch (error) {
      _notify(error.message);
    }
  }

  Future<void> _approve() async {
    final riderId = _selectedRiderId;
    final stores = ref
        .read(adminAuthProvider)
        .stores
        .where((store) => store.isActive)
        .toList(growable: false);
    if (riderId == null || stores.isEmpty) {
      _notify('Choose a rider and an available store before approving.');
      return;
    }
    final assignment =
        await showDialog<(String, enums.ApproveRiderKycDtoRiderType)>(
          context: context,
          builder: (context) => _RiderApprovalDialog(stores: stores),
        );
    if (assignment == null) return;
    try {
      await ref
          .read(adminRepositoryProvider)
          .approveRider(
            riderId: riderId,
            storeId: assignment.$1,
            riderType: assignment.$2,
          );
      setState(() {
        _selectedRiderId = null;
        _details = null;
      });
      await _load();
      _notify('Rider approved and assigned.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    }
  }

  Future<void> _reject() async {
    final riderId = _selectedRiderId;
    if (riderId == null) return;
    final reason = await _reasonPrompt();
    if (reason == null) return;
    try {
      await ref
          .read(adminRepositoryProvider)
          .rejectRider(riderId: riderId, reason: reason);
      setState(() {
        _selectedRiderId = null;
        _details = null;
      });
      await _load();
      _notify('Rider application rejected with a resubmission reason.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    }
  }

  Future<String?> _reasonPrompt() async {
    final controller = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reject rider application'),
        content: TextField(
          controller: controller,
          autofocus: true,
          maxLength: 300,
          decoration: const InputDecoration(labelText: 'Reason for rejection'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              final value = controller.text.trim();
              if (value.isNotEmpty) Navigator.pop(context, value);
            },
            child: const Text('Reject'),
          ),
        ],
      ),
    );
    controller.dispose();
    return reason;
  }

  void _notify(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const AdminLoading(label: 'Loading rider review queue…');
    }
    if (_error != null) return AdminError(message: _error!, onRetry: _load);
    final selected = _riders.where((rider) => rider['id'] == _selectedRiderId);
    final selectedRider = selected.isEmpty ? null : selected.first;
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Rider KYC review',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 5),
          const Text(
            'Review private licence documents, then approve with a store assignment or reject with a reason.',
            style: TextStyle(color: AppColors.secondaryText),
          ),
          const SizedBox(height: 14),
          if (_riders.isEmpty)
            const AdminEmpty(
              title: 'No riders awaiting review',
              message: 'New KYC submissions appear here.',
            )
          else
            ..._riders.map((rider) => _riderCard(rider)),
          if (selectedRider != null) ...[
            const SizedBox(height: 8),
            _detailsCard(selectedRider),
          ],
        ],
      ),
    );
  }

  Widget _riderCard(JsonMap rider) {
    final id = rider['id'];
    final user = rider['user'] is Map
        ? jsonMap(rider['user'], field: 'rider')
        : const <String, Object?>{};
    final name = user['fullName'] is String
        ? user['fullName'] as String
        : 'Rider applicant';
    final phone = user['phone'] is String ? user['phone'] as String : null;
    final isSelected = id == _selectedRiderId;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AdminSectionCard(
        onTap: () => _select(rider),
        borderColor: isSelected ? AppColors.primaryRed : null,
        child: Row(
          children: [
            const Icon(LucideIcons.userRound, color: AppColors.primaryRed),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                  Text(
                    phone ?? 'Phone unavailable',
                    style: const TextStyle(color: AppColors.secondaryText),
                  ),
                ],
              ),
            ),
            const Icon(LucideIcons.chevronRight),
          ],
        ),
      ),
    );
  }

  Widget _detailsCard(JsonMap listItem) {
    if (_detailsLoading) {
      return const Padding(
        padding: EdgeInsets.all(24),
        child: Center(child: CircularProgressIndicator()),
      );
    }
    final detail = _details;
    if (detail == null) {
      return AdminSectionCard(
        child: Column(
          children: [
            const Text('Rider details could not be loaded.'),
            TextButton(
              onPressed: () => _select(listItem),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }
    final user = detail['user'] is Map
        ? jsonMap(detail['user'], field: 'rider details')
        : const <String, Object?>{};
    final documents = detail['documents'] is Map
        ? jsonMap(detail['documents'], field: 'rider documents')
        : const <String, Object?>{};
    return AdminSectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            user['fullName'] is String
                ? user['fullName'] as String
                : 'Rider details',
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
          ),
          if (detail['bikeNumber'] is String)
            Text('Bike: ${detail['bikeNumber']}'),
          if (user['phone'] is String) Text('Phone: ${user['phone']}'),
          if (user['email'] is String) Text('Email: ${user['email']}'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              OutlinedButton.icon(
                onPressed: documents['drivingLicenceAvailable'] == true
                    ? () => _reviewDocument('driving-licence')
                    : null,
                icon: const Icon(LucideIcons.fileText, size: 17),
                label: const Text('Driving licence'),
              ),
              OutlinedButton.icon(
                onPressed: documents['vehicleLicenceAvailable'] == true
                    ? () => _reviewDocument('vehicle-licence')
                    : null,
                icon: const Icon(LucideIcons.fileText, size: 17),
                label: const Text('Vehicle licence'),
              ),
            ],
          ),
          const Divider(height: 24),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton.icon(
                onPressed: _approve,
                icon: const Icon(LucideIcons.userRoundCheck, size: 17),
                label: const Text('Approve & assign'),
              ),
              OutlinedButton.icon(
                onPressed: _reject,
                icon: const Icon(LucideIcons.userRoundX, size: 17),
                label: const Text('Reject'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RiderApprovalDialog extends StatefulWidget {
  const _RiderApprovalDialog({required this.stores});
  final List<AdminStore> stores;

  @override
  State<_RiderApprovalDialog> createState() => _RiderApprovalDialogState();
}

class _RiderApprovalDialogState extends State<_RiderApprovalDialog> {
  String? _storeId;
  enums.ApproveRiderKycDtoRiderType _riderType =
      enums.ApproveRiderKycDtoRiderType.employee;

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: const Text('Assign rider'),
    content: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        DropdownButtonFormField<String>(
          initialValue: _storeId,
          decoration: const InputDecoration(labelText: 'Store assignment'),
          items: widget.stores.map((store) {
            return DropdownMenuItem<String>(
              value: store.id,
              child: Text('${store.code} · ${store.name}'),
            );
          }).toList(),
          onChanged: (value) => setState(() => _storeId = value),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<enums.ApproveRiderKycDtoRiderType>(
          initialValue: _riderType,
          decoration: const InputDecoration(labelText: 'Rider type'),
          items: const [
            DropdownMenuItem(
              value: enums.ApproveRiderKycDtoRiderType.employee,
              child: Text('Employee'),
            ),
            DropdownMenuItem(
              value: enums.ApproveRiderKycDtoRiderType.freelance,
              child: Text('Freelance'),
            ),
          ],
          onChanged: (value) {
            if (value != null) setState(() => _riderType = value);
          },
        ),
      ],
    ),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Cancel'),
      ),
      FilledButton(
        onPressed: _storeId == null
            ? null
            : () => Navigator.pop(context, (_storeId!, _riderType)),
        child: const Text('Approve'),
      ),
    ],
  );
}
