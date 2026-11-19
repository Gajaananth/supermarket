import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/api/app_error.dart';
import '../../../core/api/rider_models.dart';
import '../../../core/providers.dart';

class KycScreen extends ConsumerStatefulWidget {
  const KycScreen({super.key});

  @override
  ConsumerState<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends ConsumerState<KycScreen> {
  final _bikeNumber = TextEditingController();
  final _picker = ImagePicker();
  XFile? _drivingLicense;
  XFile? _vehicleLicense;
  JsonMap? _status;
  bool _loading = true;
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadStatus();
  }

  @override
  void dispose() {
    _bikeNumber.dispose();
    super.dispose();
  }

  Future<void> _loadStatus() async {
    try {
      final status = await ref.read(riderRepositoryProvider).kycStatus();
      if (mounted) setState(() => _status = status);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _selectImage(bool driving) async {
    final image = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 85,
      maxWidth: 1800,
    );
    if (image == null || !mounted) return;
    final bytes = await image.length();
    if (bytes > 5 * 1024 * 1024) {
      setState(() => _error = 'Images must be 5 MB or smaller.');
      return;
    }
    setState(() {
      if (driving) {
        _drivingLicense = image;
      } else {
        _vehicleLicense = image;
      }
      _error = null;
    });
  }

  Future<String> _upload(XFile file) async {
    final type = switch (file.name.toLowerCase().split('.').last) {
      'jpg' || 'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      'webp' => 'image/webp',
      _ => throw const AppError('Camera image must be JPEG, PNG, or WebP.'),
    };
    final bytes = await file.readAsBytes();
    final signed = await ref
        .read(riderRepositoryProvider)
        .createKycUploadUrl(type, bytes.length);
    final url = stringValue(signed['uploadUrl']);
    final key = stringValue(signed['objectKey']);
    if (url.isEmpty || key.isEmpty) {
      throw const FormatException('Private upload URL response is incomplete');
    }
    await ref.read(riderRepositoryProvider).uploadSignedFile(
      uploadUrl: url,
      contentType: type,
      bytes: bytes,
    );
    return key;
  }

  Future<void> _submit() async {
    if (_bikeNumber.text.trim().length < 3 ||
        _drivingLicense == null ||
        _vehicleLicense == null) {
      setState(() => _error = 'Enter your bike number and capture both licence photos.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final drivingKey = await _upload(_drivingLicense!);
      final vehicleKey = await _upload(_vehicleLicense!);
      final status = await ref.read(riderRepositoryProvider).submitKyc(
        bikeNumber: _bikeNumber.text,
        drivingKey: drivingKey,
        vehicleKey: vehicleKey,
      );
      if (mounted) {
        setState(() => _status = status);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('KYC submitted for review.')),
        );
      }
    } on AppError catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (error) {
      if (mounted) setState(() => _error = 'KYC submission failed: $error');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = stringValue(_status?['kycStatus'], fallback: 'REGISTERED');
    final canSubmit = status == 'REGISTERED' || status == 'REJECTED';
    return Scaffold(
      appBar: AppBar(title: const Text('Rider verification')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                GlassCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _StatusPill(status),
                      const SizedBox(height: 10),
                      Text(
                        status == 'APPROVED'
                            ? 'Your account is approved.'
                            : status == 'PENDING'
                                ? 'Your documents are being reviewed. You can start working after approval and store assignment.'
                                : status == 'REJECTED'
                                    ? 'Please correct the documents and resubmit.'
                                    : 'Complete rider verification before taking deliveries.',
                      ),
                      if (stringValue(_status?['assignedStoreName']).isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text('Assigned store: ${_status!['assignedStoreName']}'),
                        ),
                      if (stringValue(_status?['rejectionReason']).isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text('Review note: ${_status!['rejectionReason']}'),
                        ),
                    ],
                  ),
                ),
                if (canSubmit) ...[
                  const SizedBox(height: 18),
                  TextField(
                    controller: _bikeNumber,
                    textCapitalization: TextCapitalization.characters,
                    maxLength: 50,
                    decoration: const InputDecoration(
                      labelText: 'Motorcycle registration number',
                    ),
                  ),
                  const SizedBox(height: 12),
                  _DocumentButton(
                    title: 'Driving licence photo',
                    file: _drivingLicense,
                    onPressed: _busy ? null : () => _selectImage(true),
                  ),
                  const SizedBox(height: 10),
                  _DocumentButton(
                    title: 'Vehicle licence photo',
                    file: _vehicleLicense,
                    onPressed: _busy ? null : () => _selectImage(false),
                  ),
                  const SizedBox(height: 18),
                  FilledButton(
                    onPressed: _busy ? null : _submit,
                    child: Text(_busy ? 'Uploading securely…' : 'Submit for review'),
                  ),
                ],
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ],
                const SizedBox(height: 12),
                const Text(
                  'Photos are uploaded to private storage using short-lived signed URLs. Keep the images readable; each file must be at most 5 MB.',
                ),
              ],
            ),
    );
  }
}

class _DocumentButton extends StatelessWidget {
  const _DocumentButton({
    required this.title,
    required this.file,
    required this.onPressed,
  });

  final String title;
  final XFile? file;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) => OutlinedButton.icon(
    onPressed: onPressed,
    icon: Icon(file == null ? Icons.camera_alt_outlined : Icons.check_circle_outline),
    label: Text(file == null ? 'Capture $title' : '$title captured'),
  );
}

class _StatusPill extends StatelessWidget {
  const _StatusPill(this.status);
  final String status;

  @override
  Widget build(BuildContext context) => Chip(
    label: Text(status.replaceAll('_', ' ')),
    backgroundColor: const Color(0xFFFFF6D6),
    side: BorderSide.none,
  );
}
