import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/admin_models.dart';
import '../../../core/providers.dart';
import '../../../core/widgets/admin_states.dart';

class StoresScreen extends ConsumerWidget {
  const StoresScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(adminAuthProvider);
    final stores = auth.stores;
    final selectedId = auth.selectedStoreId;
    final selectedStores = stores.where((store) => store.id == selectedId);
    final selected = selectedStores.isEmpty ? null : selectedStores.first;
    final located = stores
        .where((store) => store.latitude != null && store.longitude != null)
        .toList(growable: false);
    final center = selected?.latitude != null && selected?.longitude != null
        ? LatLng(selected!.latitude!, selected.longitude!)
        : located.isNotEmpty
        ? LatLng(located.first.latitude!, located.first.longitude!)
        : const LatLng(7.7104, 81.6924);
    if (stores.isEmpty) {
      return const AdminEmpty(
        title: 'No assigned stores',
        message: 'This account does not currently have store access.',
      );
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Store locations',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 5),
        const Text(
          'Map markers use approximate area-level coordinates.',
          style: TextStyle(color: AppColors.secondaryText),
        ),
        const SizedBox(height: 14),
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: SizedBox(
            height: 300,
            child: FlutterMap(
              options: MapOptions(initialCenter: center, initialZoom: 10),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'lk.buyme.admin',
                ),
                MarkerLayer(
                  markers: located
                      .map(
                        (store) => Marker(
                          point: LatLng(store.latitude!, store.longitude!),
                          width: 140,
                          height: 54,
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 7,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Colors.black26,
                                      blurRadius: 4,
                                    ),
                                  ],
                                ),
                                child: Text(
                                  store.code,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 10),
                                ),
                              ),
                              const Icon(
                                LucideIcons.mapPin,
                                color: AppColors.primaryRed,
                                size: 24,
                              ),
                            ],
                          ),
                        ),
                      )
                      .toList(),
                ),
                RichAttributionWidget(
                  attributions: [
                    TextSourceAttribution('OpenStreetMap contributors'),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        ...stores.map(
          (store) => _StoreCard(
            store: store,
            isSelected: store.id == selectedId,
            onSelect: auth.session?.isSuperAdmin == true
                ? () =>
                      ref.read(adminAuthProvider.notifier).selectStore(store.id)
                : null,
          ),
        ),
      ],
    );
  }
}

class _StoreCard extends StatelessWidget {
  const _StoreCard({
    required this.store,
    required this.isSelected,
    required this.onSelect,
  });

  final AdminStore store;
  final bool isSelected;
  final VoidCallback? onSelect;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: AdminSectionCard(
      onTap: onSelect,
      child: Row(
        children: [
          const Icon(LucideIcons.store, color: AppColors.primaryRed),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  store.name,
                  style: const TextStyle(fontWeight: FontWeight.w900),
                ),
                Text(
                  '${store.code} · ${store.isActive ? 'Active' : 'Inactive'}',
                  style: const TextStyle(color: AppColors.secondaryText),
                ),
              ],
            ),
          ),
          if (isSelected)
            const Icon(LucideIcons.circleCheck, color: AppColors.success),
        ],
      ),
    ),
  );
}
