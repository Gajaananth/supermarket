import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _code = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _code.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final controller = ref.read(adminAuthProvider.notifier);
    final state = ref.read(adminAuthProvider);
    if (state.requires2fa) {
      if (!RegExp(r'^\d{6}$').hasMatch(_code.text.trim())) {
        return _showError('Enter the six-digit verification code.');
      }
      await controller.verifyTwoFactor(_code.text.trim());
      return;
    }
    final email = _email.text.trim();
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
      return _showError('Enter a valid admin email address.');
    }
    if (_password.text.length < 6) {
      return _showError('Password must be at least six characters.');
    }
    await controller.signIn(email: email, password: _password.text);
  }

  void _showError(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminAuthProvider);
    if (state.isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primaryRed),
        ),
      );
    }
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.softRed, AppColors.canvas, AppColors.softYellow],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: GlassCard(
                  opaqueTextSurface: true,
                  isElevated: true,
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Icon(
                        LucideIcons.store,
                        color: AppColors.primaryRed,
                        size: 44,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        state.requires2fa
                            ? 'Verify your sign-in'
                            : 'Admin sign-in',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppColors.darkNavy,
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        state.requires2fa
                            ? state.demoCode != null
                                  ? 'Use the staging demo code shown below.'
                                  : 'Enter the verification code sent to ${state.challengeEmail ?? 'your admin email'}.'
                            : 'Sign in with your Super Admin or assigned Store Admin account.',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppColors.secondaryText,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 24),
                      if (state.error != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.errorLight,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.errorBorder),
                          ),
                          child: Text(
                            state.error!,
                            style: const TextStyle(color: AppColors.error),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      if (state.requires2fa)
                        TextField(
                          controller: _code,
                          autofocus: true,
                          keyboardType: TextInputType.number,
                          maxLength: 6,
                          textInputAction: TextInputAction.done,
                          decoration: const InputDecoration(
                            labelText: 'Six-digit code',
                            prefixIcon: Icon(LucideIcons.keyRound),
                            counterText: '',
                          ),
                          onSubmitted: (_) => _submit(),
                        )
                      else ...[
                        TextField(
                          controller: _email,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.username],
                          decoration: const InputDecoration(
                            labelText: 'Admin email',
                            prefixIcon: Icon(LucideIcons.mail),
                          ),
                        ),
                        const SizedBox(height: 14),
                        TextField(
                          controller: _password,
                          obscureText: _obscurePassword,
                          textInputAction: TextInputAction.done,
                          autofillHints: const [AutofillHints.password],
                          onSubmitted: (_) => _submit(),
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: const Icon(LucideIcons.lockKeyhole),
                            suffixIcon: IconButton(
                              onPressed: () => setState(
                                () => _obscurePassword = !_obscurePassword,
                              ),
                              icon: Icon(
                                _obscurePassword
                                    ? LucideIcons.eye
                                    : LucideIcons.eyeOff,
                              ),
                              tooltip: _obscurePassword
                                  ? 'Show password'
                                  : 'Hide password',
                            ),
                          ),
                        ),
                      ],
                      if (state.demoCode != null) ...[
                        const SizedBox(height: 12),
                        SelectableText(
                          'Staging demo code: ${state.demoCode}',
                          style: const TextStyle(
                            color: AppColors.primaryRed,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                      const SizedBox(height: 20),
                      PrimaryButton(
                        text: state.requires2fa ? 'Verify code' : 'Sign in',
                        icon: Icon(
                          state.requires2fa
                              ? LucideIcons.shieldCheck
                              : LucideIcons.logIn,
                        ),
                        onPressed: _submit,
                      ),
                      if (state.requires2fa) ...[
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: ref
                              .read(adminAuthProvider.notifier)
                              .cancelTwoFactor,
                          child: const Text('Back to sign-in'),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
