import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../api/generated/buyme.enums.swagger.dart' as enums;
import '../../../core/api/admin_models.dart';
import '../../../core/api/app_error.dart';
import '../../../core/providers.dart';
import '../../../core/widgets/admin_states.dart';

class DepositsScreen extends ConsumerStatefulWidget {
  const DepositsScreen({super.key});

  @override
  ConsumerState<DepositsScreen> createState() => _DepositsScreenState();
}

class _DepositsScreenState extends ConsumerState<DepositsScreen> {
  bool _loading = true;
  String? _error;
  List<AdminCashDeposit> _deposits = const [];

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
      final values = await ref
          .read(adminRepositoryProvider)
          .depositQueue(storeId: ref.read(adminAuthProvider).selectedStoreId);
      if (!mounted) return;
      setState(() {
        _deposits = values
            .map(AdminCashDeposit.fromJson)
            .toList(growable: false);
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

  Future<void> _verify(
    AdminCashDeposit deposit,
    enums.VerifyRiderDepositDtoAction action,
  ) async {
    final inputs = await showDialog<_DepositDecision>(
      context: context,
      builder: (context) => _DepositDecisionDialog(
        action: action,
        submittedAmount: deposit.amount,
      ),
    );
    if (inputs == null) return;
    try {
      await ref
          .read(adminRepositoryProvider)
          .verifyDeposit(
            id: deposit.id,
            action: action,
            rejectionReason: inputs.reason,
            receivedAmount: inputs.receivedAmount,
            varianceReason: inputs.varianceReason,
          );
      await _load();
      _notify('Deposit review submitted.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    }
  }

  Future<void> _openSlip(AdminCashDeposit deposit) async {
    try {
      final link = await ref
          .read(adminRepositoryProvider)
          .depositSlipUrl(deposit.id);
      final opened = await launchUrl(
        Uri.parse(link),
        mode: LaunchMode.externalApplication,
      );
      if (!opened) _notify('Could not open the private deposit slip link.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    } on FormatException catch (error) {
      _notify(error.message);
    }
  }

  Future<void> _resolveVariance(AdminCashDeposit deposit) async {
    final decision =
        await showDialog<(enums.ResolveDepositVarianceDtoAction, String)>(
          context: context,
          builder: (context) => const _VarianceResolutionDialog(),
        );
    if (decision == null) return;
    try {
      await ref
          .read(adminRepositoryProvider)
          .resolveDepositVariance(
            id: deposit.id,
            action: decision.$1,
            resolutionNote: decision.$2,
          );
      await _load();
      _notify('Deposit variance resolved.');
    } on AdminApiException catch (error) {
      _notify(error.message);
    }
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
    if (_loading) return const AdminLoading(label: 'Loading deposit queue…');
    if (_error != null) return AdminError(message: _error!, onRetry: _load);
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Deposit verification',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          const Text(
            'Verify uploaded bank slips. Differences are sent to the variance workflow.',
            style: TextStyle(color: AppColors.secondaryText),
          ),
          const SizedBox(height: 14),
          if (_deposits.isEmpty)
            const AdminEmpty(
              title: 'Queue is clear',
              message: 'Pending deposits and variance cases will appear here.',
            )
          else
            ..._deposits.map(_depositCard),
        ],
      ),
    );
  }

  Widget _depositCard(AdminCashDeposit deposit) {
    final canReview = deposit.status == 'PENDING';
    final canResolveVariance =
        deposit.status == 'VARIANCE' &&
        ref.read(adminAuthProvider).session?.isSuperAdmin == true;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AdminSectionCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.account_balance, color: AppColors.primaryRed),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    deposit.depositNumber,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
                _DepositStatus(status: deposit.status),
              ],
            ),
            const SizedBox(height: 10),
            Text(deposit.riderName ?? 'Rider details unavailable'),
            Text(
              'Bank reference: ${deposit.bankRefNumber}',
              style: const TextStyle(color: AppColors.secondaryText),
            ),
            if (deposit.varianceReason != null)
              Text(
                'Variance: ${deposit.varianceReason}',
                style: const TextStyle(color: AppColors.warning),
              ),
            const SizedBox(height: 6),
            Text(
              formatLkr(deposit.amount),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                OutlinedButton.icon(
                  onPressed: () => _openSlip(deposit),
                  icon: const Icon(Icons.open_in_new, size: 17),
                  label: const Text('Open slip'),
                ),
                if (canReview) ...[
                  FilledButton.tonal(
                    onPressed: () => _verify(
                      deposit,
                      enums.VerifyRiderDepositDtoAction.approve,
                    ),
                    child: const Text('Approve'),
                  ),
                  OutlinedButton(
                    onPressed: () => _verify(
                      deposit,
                      enums.VerifyRiderDepositDtoAction.variance,
                    ),
                    child: const Text('Record variance'),
                  ),
                  TextButton(
                    onPressed: () => _verify(
                      deposit,
                      enums.VerifyRiderDepositDtoAction.reject,
                    ),
                    child: const Text('Reject'),
                  ),
                ],
                if (canResolveVariance)
                  OutlinedButton(
                    onPressed: () => _resolveVariance(deposit),
                    child: const Text('Resolve variance'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _VarianceResolutionDialog extends StatefulWidget {
  const _VarianceResolutionDialog();

  @override
  State<_VarianceResolutionDialog> createState() =>
      _VarianceResolutionDialogState();
}

class _VarianceResolutionDialogState extends State<_VarianceResolutionDialog> {
  final _note = TextEditingController();
  var _action = enums.ResolveDepositVarianceDtoAction.acceptVariance;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: const Text('Resolve deposit variance'),
    content: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        DropdownButtonFormField<enums.ResolveDepositVarianceDtoAction>(
          initialValue: _action,
          decoration: const InputDecoration(labelText: 'Resolution'),
          items: const [
            DropdownMenuItem(
              value: enums.ResolveDepositVarianceDtoAction.acceptVariance,
              child: Text('Accept variance'),
            ),
            DropdownMenuItem(
              value: enums.ResolveDepositVarianceDtoAction.rejectDeposit,
              child: Text('Reject deposit'),
            ),
          ],
          onChanged: (value) {
            if (value != null) setState(() => _action = value);
          },
        ),
        TextField(
          controller: _note,
          maxLength: 300,
          decoration: const InputDecoration(labelText: 'Resolution note'),
        ),
      ],
    ),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Cancel'),
      ),
      FilledButton(
        onPressed: () {
          final note = _note.text.trim();
          if (note.isNotEmpty) Navigator.pop(context, (_action, note));
        },
        child: const Text('Resolve'),
      ),
    ],
  );
}

class _DepositDecision {
  const _DepositDecision({
    this.reason,
    this.receivedAmount,
    this.varianceReason,
  });
  final String? reason;
  final double? receivedAmount;
  final String? varianceReason;
}

class _DepositDecisionDialog extends StatefulWidget {
  const _DepositDecisionDialog({
    required this.action,
    required this.submittedAmount,
  });
  final enums.VerifyRiderDepositDtoAction action;
  final double submittedAmount;

  @override
  State<_DepositDecisionDialog> createState() => _DepositDecisionDialogState();
}

class _DepositDecisionDialogState extends State<_DepositDecisionDialog> {
  late final _amount = TextEditingController(
    text: widget.submittedAmount.toStringAsFixed(2),
  );
  final _reason = TextEditingController();

  @override
  void dispose() {
    _amount.dispose();
    _reason.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final variance =
        widget.action == enums.VerifyRiderDepositDtoAction.variance;
    final reject = widget.action == enums.VerifyRiderDepositDtoAction.reject;
    return AlertDialog(
      title: Text(
        variance
            ? 'Record variance'
            : reject
            ? 'Reject deposit'
            : 'Approve deposit',
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (variance)
            TextField(
              controller: _amount,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: const InputDecoration(labelText: 'Amount received'),
            ),
          TextField(
            controller: _reason,
            autofocus: !variance,
            maxLength: 300,
            decoration: InputDecoration(
              labelText: reject ? 'Rejection reason' : 'Variance reason',
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () {
            final reason = _reason.text.trim();
            if (reject && reason.isEmpty) return;
            if (variance) {
              final received = double.tryParse(_amount.text.trim());
              if (reason.isEmpty || received == null || received < 0) return;
              Navigator.pop(
                context,
                _DepositDecision(
                  receivedAmount: received,
                  varianceReason: reason,
                ),
              );
            } else {
              Navigator.pop(
                context,
                _DepositDecision(reason: reject ? reason : null),
              );
            }
          },
          child: Text(
            variance
                ? 'Submit variance'
                : reject
                ? 'Reject deposit'
                : 'Approve',
          ),
        ),
      ],
    );
  }
}

class _DepositStatus extends StatelessWidget {
  const _DepositStatus({required this.status});
  final String status;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
    decoration: BoxDecoration(
      color: status == 'PENDING' ? AppColors.warningLight : AppColors.infoLight,
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(status.replaceAll('_', ' ')),
  );
}
