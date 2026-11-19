import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/api/app_error.dart';
import '../../../core/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _destination = TextEditingController();
  final _code = TextEditingController();
  bool _codeRequested = false;
  bool _busy = false;
  String? _demoCode;
  String? _error;

  @override
  void dispose() {
    _destination.dispose();
    _code.dispose();
    super.dispose();
  }

  Future<void> _requestCode() async {
    final destination = _destination.text.trim();
    if (!_validDestination(destination)) {
      setState(() => _error = 'Enter a registered +94 phone number or email.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final demoCode = await ref
          .read(riderRepositoryProvider)
          .requestOtp(destination);
      if (mounted) {
        setState(() {
          _codeRequested = true;
          _demoCode = demoCode;
        });
      }
    } on AppError catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (error) {
      if (mounted) setState(() => _error = 'Could not request a code: $error');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _verify() async {
    if (!_validDestination(_destination.text.trim()) ||
        !RegExp(r'^\d{6}$').hasMatch(_code.text.trim())) {
      setState(() => _error = 'Enter a valid destination and 6-digit code.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await ref
          .read(riderAuthProvider.notifier)
          .signIn(
            destination: _destination.text.trim(),
            code: _code.text.trim(),
          );
    } on AppError catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (error) {
      if (mounted) setState(() => _error = 'Sign in failed: $error');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  bool _validDestination(String value) =>
      RegExp(r'^\+94\d{9}$').hasMatch(value) ||
      RegExp(
        r'^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$',
        caseSensitive: false,
      ).hasMatch(value);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: ListView(
              padding: const EdgeInsets.all(24),
              shrinkWrap: true,
              children: [
                const SizedBox(height: 32),
                const Center(child: BuyMeLogo()),
                const SizedBox(height: 30),
                const Text(
                  'Rider sign in',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Use your registered phone number or email. Staging demo accounts display a test code after sign-in is requested.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),
                TextField(
                  controller: _destination,
                  keyboardType: TextInputType.emailAddress,
                  enabled: !_busy && !_codeRequested,
                  decoration: const InputDecoration(
                    labelText: 'Phone (+94…) or email',
                    prefixIcon: Icon(LucideIcons.userRound),
                  ),
                ),
                if (_codeRequested) ...[
                  if (_demoCode != null) ...[
                    const SizedBox(height: 14),
                    SelectableText(
                      'Staging demo code: $_demoCode',
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ],
                  const SizedBox(height: 14),
                  TextField(
                    controller: _code,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    decoration: const InputDecoration(
                      labelText: '6-digit code',
                      prefixIcon: Icon(LucideIcons.keyRound),
                    ),
                  ),
                ],
                if (_error != null) ...[
                  const SizedBox(height: 10),
                  Text(
                    _error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ],
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: _busy
                      ? null
                      : (_codeRequested ? _verify : _requestCode),
                  child: Text(
                    _busy
                        ? 'Please wait…'
                        : _codeRequested
                        ? 'Verify and continue'
                        : 'Send sign-in code',
                  ),
                ),
                if (_codeRequested)
                  TextButton(
                    onPressed: _busy
                        ? null
                        : () => setState(() {
                            _codeRequested = false;
                            _demoCode = null;
                            _code.clear();
                          }),
                    child: const Text('Change destination'),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
