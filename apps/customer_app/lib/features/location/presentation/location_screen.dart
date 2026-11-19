import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/app_error.dart';
import '../../../core/providers.dart';
import '../../../core/state/location_state.dart';

class LocationScreen extends ConsumerStatefulWidget {
  const LocationScreen({super.key});

  @override
  ConsumerState<LocationScreen> createState() => _LocationScreenState();
}

class _LocationScreenState extends ConsumerState<LocationScreen> {
  static const _batticaloa = LatLng(7.7104, 81.6924);
  final _mapController = MapController();
  final _addressController = TextEditingController();
  LatLng _pin = _batticaloa;
  bool _isBusy = false;
  String? _error;

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _useCurrentLocation() async {
    setState(() {
      _isBusy = true;
      _error = null;
    });
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        throw const AppError('Turn on location services to find your store.');
      }
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        throw const AppError(
          'Location permission is needed. You can also choose a location on the map.',
        );
      }
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 15),
        ),
      );
      await _resolveLocation(LatLng(position.latitude, position.longitude));
    } catch (error) {
      if (mounted) setState(() => _error = _errorMessage(error));
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  Future<void> _searchAddress() async {
    final query = _addressController.text.trim();
    if (query.isEmpty) {
      setState(() => _error = 'Enter a nearby place or address to search.');
      return;
    }
    setState(() {
      _isBusy = true;
      _error = null;
    });
    try {
      final result = await ref.read(customerRepositoryProvider).geocode(query);
      final location = LatLng(
        _number(result, 'latitude'),
        _number(result, 'longitude'),
      );
      _addressController.text = _string(result, 'displayName');
      _mapController.move(location, 15);
      setState(() => _pin = location);
    } catch (error) {
      if (mounted) setState(() => _error = _errorMessage(error));
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  Future<void> _resolveLocation(LatLng location) async {
    setState(() {
      _isBusy = true;
      _error = null;
    });
    try {
      final repository = ref.read(customerRepositoryProvider);
      final store = await repository.nearestStore(
        latitude: location.latitude,
        longitude: location.longitude,
      );
      final address = await repository.reverseGeocode(
        latitude: location.latitude,
        longitude: location.longitude,
      );
      ref.read(selectedLocationProvider.notifier).state = LocationSelection(
        latitude: location.latitude,
        longitude: location.longitude,
        addressLabel: address,
        store: store,
      );
      if (mounted) context.go('/shop');
    } catch (error) {
      if (mounted) setState(() => _error = _errorMessage(error));
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GlassScaffold(
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const BuyMeLogo(),
          const SizedBox(height: 24),
          Text('Where should we deliver?', style: AppTypography.h2),
          const SizedBox(height: 8),
          Text(
            'Choose your Batticaloa delivery location to find the nearest open store.',
            style: AppTypography.bodyMedium,
          ),
          const SizedBox(height: 18),
          TextField(
            controller: _addressController,
            textInputAction: TextInputAction.search,
            onSubmitted: (_) => _searchAddress(),
            decoration: InputDecoration(
              hintText: 'Search for a place or street',
              prefixIcon: const Icon(LucideIcons.search, size: 19),
              suffixIcon: IconButton(
                tooltip: 'Search address',
                onPressed: _isBusy ? null : _searchAddress,
                icon: const Icon(LucideIcons.arrowRight, size: 19),
              ),
            ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            height: 300,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: _batticaloa,
                  initialZoom: 13,
                  onTap: (tapPosition, point) {
                    setState(() {
                      _pin = point;
                      _error = null;
                    });
                  },
                ),
                children: [
                  TileLayer(
                    urlTemplate:
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'lk.buyme.customer',
                  ),
                  MarkerLayer(
                    markers: [
                      Marker(
                        point: _pin,
                        width: 48,
                        height: 56,
                        child: const Icon(
                          LucideIcons.mapPin,
                          size: 42,
                          color: AppColors.primaryRed,
                        ),
                      ),
                    ],
                  ),
                  RichAttributionWidget(
                    attributions: [
                      TextSourceAttribution(
                        'OpenStreetMap contributors',
                        onTap: () => _openAttribution(context),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Tap the map to place the pin at your delivery address.',
            style: AppTypography.bodySmall,
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            ErrorState(message: _error!),
          ],
          const SizedBox(height: 18),
          PrimaryButton(
            text: 'Use my current location',
            icon: const Icon(LucideIcons.locateFixed, size: 18),
            isLoading: _isBusy,
            onPressed: _isBusy ? null : _useCurrentLocation,
          ),
          const SizedBox(height: 10),
          PrimaryButton(
            text: 'Continue with this pin',
            backgroundColor: AppColors.deepRed,
            icon: const Icon(LucideIcons.checkCircle2, size: 18),
            onPressed: _isBusy ? null : () => _resolveLocation(_pin),
          ),
        ],
      ),
    );
  }

  String _errorMessage(Object error) {
    if (error is AppError) return error.message;
    return 'Could not set this location: $error';
  }

  double _number(Map<String, Object?> data, String key) {
    final value = data[key];
    if (value is num) return value.toDouble();
    if (value is String) {
      final parsed = double.tryParse(value);
      if (parsed != null) return parsed;
    }
    throw FormatException('The map result did not contain a valid $key');
  }

  String _string(Map<String, Object?> data, String key) {
    final value = data[key];
    if (value is String && value.isNotEmpty) return value;
    throw FormatException('The map result did not contain a valid $key');
  }

  void _openAttribution(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Map data © OpenStreetMap contributors')),
    );
  }
}
