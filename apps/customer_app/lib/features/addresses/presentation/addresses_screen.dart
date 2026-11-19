import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/providers.dart';

class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addresses = ref.watch(addressesProvider);
    return GlassScaffold(
      appBar: AppBar(
        title: Text('Delivery addresses', style: AppTypography.h3),
        actions: [
          IconButton(
            tooltip: 'Add address',
            onPressed: () => _createAddress(context, ref),
            icon: const Icon(LucideIcons.plus),
          ),
        ],
      ),
      body: addresses.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => ErrorState(
          message: '$error',
          onRetry: () => ref.invalidate(addressesProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return EmptyState(
              title: 'No saved addresses',
              description: 'Add an address to continue with delivery.',
              icon: LucideIcons.mapPin,
              actionLabel: 'Add delivery address',
              onAction: () => _createAddress(context, ref),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(18),
            itemCount: items.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final address = items[index];
              return GlassCard(
                opaqueTextSurface: true,
                padding: const EdgeInsets.all(16),
                onTap: () => context.pop(address.id),
                child: Row(
                  children: [
                    const Icon(LucideIcons.mapPin, color: AppColors.primaryRed),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  address.label,
                                  style: AppTypography.h4,
                                ),
                              ),
                              if (address.isDefault) ...[
                                const SizedBox(width: 8),
                                const StatusBadge(
                                  status: BuyMeOrderStatus.confirmed,
                                  customLabel: 'Default',
                                  isCompact: true,
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${address.streetAddress}, ${address.locality}',
                            style: AppTypography.bodyMedium,
                          ),
                          Text(
                            '${address.recipientName} • ${address.recipientPhone}',
                            style: AppTypography.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      tooltip: 'Delete address',
                      onPressed: () => _deleteAddress(context, ref, address.id),
                      icon: const Icon(
                        LucideIcons.trash2,
                        color: AppColors.error,
                        size: 19,
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  Future<void> _createAddress(BuildContext context, WidgetRef ref) async {
    final location = ref.read(selectedLocationProvider);
    if (location == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Select a location before adding an address.'),
        ),
      );
      return;
    }
    final draft = await showDialog<_AddressDraft>(
      context: context,
      builder: (context) => const _AddressFormDialog(),
    );
    if (draft == null) return;
    try {
      final existing = await ref.read(addressesProvider.future);
      await ref
          .read(customerRepositoryProvider)
          .createAddress(
            label: draft.label,
            recipientName: draft.recipientName,
            recipientPhone: draft.recipientPhone,
            streetAddress: draft.streetAddress,
            locality: draft.locality,
            latitude: location.latitude,
            longitude: location.longitude,
            landmark: draft.landmark,
            isDefault: existing.isEmpty,
          );
      ref.invalidate(addressesProvider);
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not save this address: $error')),
        );
      }
    }
  }

  Future<void> _deleteAddress(
    BuildContext context,
    WidgetRef ref,
    String id,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete address?'),
        content: const Text('This saved delivery address will be removed.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Keep'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ref.read(customerRepositoryProvider).deleteAddress(id);
      ref.invalidate(addressesProvider);
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not delete this address: $error')),
        );
      }
    }
  }
}

class _AddressDraft {
  const _AddressDraft({
    required this.label,
    required this.recipientName,
    required this.recipientPhone,
    required this.streetAddress,
    required this.locality,
    this.landmark,
  });

  final String label;
  final String recipientName;
  final String recipientPhone;
  final String streetAddress;
  final String locality;
  final String? landmark;
}

class _AddressFormDialog extends StatefulWidget {
  const _AddressFormDialog();

  @override
  State<_AddressFormDialog> createState() => _AddressFormDialogState();
}

class _AddressFormDialogState extends State<_AddressFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _label = TextEditingController(text: 'Home');
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _street = TextEditingController();
  final _locality = TextEditingController();
  final _landmark = TextEditingController();

  @override
  void dispose() {
    _label.dispose();
    _name.dispose();
    _phone.dispose();
    _street.dispose();
    _locality.dispose();
    _landmark.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add delivery address'),
      content: SizedBox(
        width: 440,
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _field(_label, 'Label', required: true),
                _field(_name, 'Recipient name', required: true),
                _field(
                  _phone,
                  'Recipient phone',
                  required: true,
                  keyboard: TextInputType.phone,
                ),
                _field(_street, 'Street address', required: true),
                _field(_landmark, 'Landmark'),
                _field(_locality, 'Locality', required: true),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () {
            if (!_formKey.currentState!.validate()) return;
            Navigator.pop(
              context,
              _AddressDraft(
                label: _label.text.trim(),
                recipientName: _name.text.trim(),
                recipientPhone: _phone.text.trim(),
                streetAddress: _street.text.trim(),
                locality: _locality.text.trim(),
                landmark: _landmark.text.trim().isEmpty
                    ? null
                    : _landmark.text.trim(),
              ),
            );
          },
          child: const Text('Save address'),
        ),
      ],
    );
  }

  Widget _field(
    TextEditingController controller,
    String label, {
    bool required = false,
    TextInputType keyboard = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboard,
        decoration: InputDecoration(labelText: label),
        validator: required
            ? (value) => value == null || value.trim().isEmpty
                  ? 'Enter ${label.toLowerCase()}'
                  : null
            : null,
      ),
    );
  }
}
