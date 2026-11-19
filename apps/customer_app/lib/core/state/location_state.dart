import '../api/api_models.dart';

class LocationSelection {
  const LocationSelection({
    required this.latitude,
    required this.longitude,
    required this.addressLabel,
    required this.store,
  });

  final double latitude;
  final double longitude;
  final String addressLabel;
  final Store store;
}
