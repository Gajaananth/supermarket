import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/auth/phone_number.dart';
import '../../../core/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({this.redirectTo, super.key});

  final String? redirectTo;

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  String? _phoneError;
  String? _operationError;

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _requestCode() async {
    final validation = validateSriLankanPhone(_phoneController.text);
    if (validation != null) {
      setState(() {
        _phoneError = validation;
        _operationError = null;
      });
      return;
    }
    setState(() {
      _phoneError = null;
      _operationError = null;
    });
    try {
      await ref
          .read(authControllerProvider.notifier)
          .requestOtp(normalizeSriLankanPhone(_phoneController.text));
    } catch (error) {
      if (mounted) setState(() => _operationError = '$error');
    }
  }

  Future<void> _verifyCode() async {
    final code = _codeController.text.trim();
    if (!RegExp(r'^\d{6}$').hasMatch(code)) {
      setState(() => _operationError = 'Enter the 6-digit code you received.');
      return;
    }
    setState(() => _operationError = null);
    try {
      await ref
          .read(authControllerProvider.notifier)
          .verifyOtp(
            phone: normalizeSriLankanPhone(_phoneController.text),
            code: code,
          );
      final firebaseReady = ref.read(firebaseRuntimeReadyProvider);
      if (firebaseReady) {
        try {
          await ref
              .read(pushNotificationServiceProvider)
              .registerIfConfigured(ref.read(customerRepositoryProvider));
        } catch (error) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Signed in, but notifications are off: $error'),
              ),
            );
          }
        }
      }
      if (mounted) context.go(widget.redirectTo ?? '/shop');
    } catch (error) {
      if (mounted) setState(() => _operationError = '$error');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    return GlassScaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: GlassCard(
              opaqueTextSurface: true,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const BuyMeLogo(),
                  const SizedBox(height: 28),
                  Text('Welcome to BuyMe', style: AppTypography.h2),
                  const SizedBox(height: 8),
                  Text(
                    auth.otpRequested
                        ? auth.demoCode != null
                              ? 'Use the staging demo code below.'
                              : 'Enter the code sent to your mobile number.'
                        : 'Sign in with your Sri Lankan mobile number.',
                    style: AppTypography.bodyMedium,
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    autofillHints: const [AutofillHints.telephoneNumber],
                    enabled: !auth.otpRequested && !auth.isBusy,
                    decoration: InputDecoration(
                      labelText: 'Mobile number',
                      hintText: '077 123 4567',
                      prefixIcon: const Icon(LucideIcons.phone, size: 19),
                      errorText: _phoneError,
                    ),
                  ),
                  if (auth.otpRequested) ...[
                    if (auth.demoCode != null) ...[
                      const SizedBox(height: 14),
                      SelectableText(
                        'Staging demo code: ${auth.demoCode}',
                        style: const TextStyle(
                          color: AppColors.primaryRed,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                    const SizedBox(height: 14),
                    TextField(
                      controller: _codeController,
                      keyboardType: TextInputType.number,
                      autofillHints: const [AutofillHints.oneTimeCode],
                      maxLength: 6,
                      decoration: const InputDecoration(
                        labelText: '6-digit verification code',
                        counterText: '',
                        prefixIcon: Icon(LucideIcons.keyRound, size: 19),
                      ),
                    ),
                  ],
                  if (_operationError != null || auth.error != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      _operationError ?? auth.error!,
                      style: const TextStyle(color: AppColors.error),
                    ),
                  ],
                  const SizedBox(height: 22),
                  PrimaryButton(
                    text: auth.otpRequested
                        ? 'Verify and sign in'
                        : 'Send code',
                    icon: Icon(
                      auth.otpRequested
                          ? LucideIcons.shieldCheck
                          : LucideIcons.messageCircle,
                      size: 18,
                    ),
                    isLoading: auth.isBusy,
                    onPressed: auth.isBusy
                        ? null
                        : auth.otpRequested
                        ? _verifyCode
                        : _requestCode,
                  ),
                  if (auth.otpRequested) ...[
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: auth.isBusy
                          ? null
                          : () {
                              ref
                                  .read(authControllerProvider.notifier)
                                  .resetOtp();
                              _codeController.clear();
                              setState(() => _operationError = null);
                            },
                      child: const Text('Use a different number'),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
