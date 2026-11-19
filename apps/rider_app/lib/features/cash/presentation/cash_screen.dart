import 'package:buyme_design/buyme_design.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/app_error.dart';
import '../../../core/api/rider_models.dart';
import '../../../core/providers.dart';

class CashScreen extends ConsumerStatefulWidget {
  const CashScreen({super.key});

  @override
  ConsumerState<CashScreen> createState() => _CashScreenState();
}

class _CashScreenState extends ConsumerState<CashScreen> {
  final _bankReference = TextEditingController();
  RiderCash? _cash;
  List<JsonMap> _deposits = const [];
  PlatformFile? _slip;
  bool _loading = true;
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _bankReference.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final repository = ref.read(riderRepositoryProvider);
      final cash = await repository.cash();
      final deposits = await repository.deposits();
      if (!mounted) return;
      setState(() {
        _cash = cash;
        _deposits = deposits;
        _error = null;
        _loading = false;
      });
    } on AppError catch (error) {
      if (mounted) {
        setState(() {
          _error = error.message;
          _loading = false;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _error = 'Unable to load cash balance: $error';
          _loading = false;
        });
      }
    }
  }

  Future<void> _chooseSlip() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['jpg', 'jpeg', 'png', 'pdf'],
      withData: true,
    );
    if (result == null || result.files.isEmpty) return;
    final file = result.files.single;
    if (file.bytes == null) {
      setState(() => _error = 'Could not read the selected slip file.');
      return;
    }
    if (file.size < 1 || file.size > 5 * 1024 * 1024) {
      setState(() => _error = 'Deposit slip must be at most 5 MB.');
      return;
    }
    setState(() {
      _slip = file;
      _error = null;
    });
  }

  Future<void> _submitDeposit() async {
    final cash = _cash;
    final file = _slip;
    if (cash == null || cash.cashInHand <= 0) {
      setState(() => _error = 'There is no cash balance to deposit.');
      return;
    }
    if (file?.bytes == null || _bankReference.text.trim().length < 4) {
      setState(() => _error = 'Select your bank slip and enter a bank reference.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final extension = file!.extension!.toLowerCase();
      final contentType = switch (extension) {
        'jpg' || 'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'pdf' => 'application/pdf',
        _ => throw const AppError('Choose a JPEG, PNG, or PDF slip.'),
      };
      final repository = ref.read(riderRepositoryProvider);
      final signed = await repository.createDepositUploadUrl(contentType, file.size);
      final url = stringValue(signed['uploadUrl']);
      final objectKey = stringValue(signed['objectKey']);
      if (url.isEmpty || objectKey.isEmpty) {
        throw const FormatException('Deposit upload URL response is incomplete');
      }
      await repository.uploadSignedFile(
        uploadUrl: url,
        contentType: contentType,
        bytes: file.bytes!,
      );
      await repository.submitDeposit(
        amount: cash.cashInHand,
        bankReference: _bankReference.text,
        objectKey: objectKey,
      );
      if (!mounted) return;
      setState(() {
        _slip = null;
        _bankReference.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Deposit submitted. Delivery access stays locked until verification.')),
      );
      await _load();
    } on AppError catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (error) {
      if (mounted) setState(() => _error = 'Deposit submission failed: $error');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cash = _cash;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(LucideIcons.arrowLeft),
        ),
        title: const Text('Cash & deposits'),
        actions: [
          IconButton(onPressed: _loading ? null : _load, icon: const Icon(LucideIcons.refreshCw)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  GlassCard(
                    isElevated: true,
                    opaqueTextSurface: true,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('CASH IN HAND'),
                        const SizedBox(height: 8),
                        Text(
                          'LKR ${(cash?.cashInHand ?? 0).toStringAsFixed(2)}',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 12),
                        Text('Deposit threshold: LKR ${(cash?.threshold ?? 0).toStringAsFixed(2)}'),
                        Text('Maximum holding period: ${cash?.maxHours ?? 0} hours'),
                        if (cash?.isCashLocked == true || cash?.depositPending == true) ...[
                          const SizedBox(height: 10),
                          Text(
                            cash?.cashLockReason.isNotEmpty == true
                                ? cash!.cashLockReason
                                : 'Delivery access is locked while the deposit is pending.',
                            style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.error),
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (cash != null && cash.cashInHand > 0 && !cash.depositPending) ...[
                    const SizedBox(height: 16),
                    GlassCard(
                      opaqueTextSurface: true,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Submit deposit • LKR ${cash.cashInHand.toStringAsFixed(2)}'),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _bankReference,
                            maxLength: 100,
                            decoration: const InputDecoration(labelText: 'Bank reference number'),
                          ),
                          const SizedBox(height: 8),
                          OutlinedButton.icon(
                            onPressed: _busy ? null : _chooseSlip,
                            icon: const Icon(LucideIcons.paperclip),
                            label: Text(_slip?.name ?? 'Choose bank slip (JPEG, PNG, PDF)'),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: FilledButton(
                              onPressed: _busy ? null : _submitDeposit,
                              child: Text(_busy ? 'Uploading securely…' : 'Submit full cash balance'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    ErrorState(message: _error!, onRetry: () => _load()),
                  ],
                  const SizedBox(height: 18),
                  Text('Deposit history', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 10),
                  if (_deposits.isEmpty)
                    const EmptyState(
                      title: 'No deposits submitted',
                      description: 'Submitted deposits will appear here with their review status.',
                      icon: LucideIcons.receipt,
                    ),
                  for (final deposit in _deposits)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: GlassCard(
                        opaqueTextSurface: true,
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: const Icon(LucideIcons.landmark),
                          title: Text('LKR ${numberValue(deposit['amount']).toStringAsFixed(2)}'),
                          subtitle: Text(
                            '${stringValue(deposit['bankRefNumber'])} • ${_date(deposit['submittedAt'])}',
                          ),
                          trailing: Text(stringValue(deposit['status'])),
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  String _date(Object? value) {
    final date = DateTime.tryParse(stringValue(value));
    if (date == null) return 'Date unavailable';
    return DateFormat('dd MMM, HH:mm').format(date.toLocal());
  }
}
