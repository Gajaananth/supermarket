import 'package:flutter/foundation.dart';

import '../auth/admin_auth_controller.dart';

class RouterRefresh extends ChangeNotifier {
  RouterRefresh(this._auth) {
    _removeListener = _auth.addListener(_onChanged);
  }

  final AdminAuthController _auth;
  late final void Function() _removeListener;

  void _onChanged(AdminAuthState _) => notifyListeners();

  @override
  void dispose() {
    _removeListener();
    super.dispose();
  }
}
