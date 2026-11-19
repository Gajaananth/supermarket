import 'package:flutter/foundation.dart';

import '../auth/rider_auth_controller.dart';

class RouterRefresh extends ChangeNotifier {
  RouterRefresh(this._auth) {
    _removeListener = _auth.addListener(_onChanged);
  }

  final RiderAuthController _auth;
  late final void Function() _removeListener;

  void _onChanged(RiderAuthState _) => notifyListeners();

  @override
  void dispose() {
    _removeListener();
    super.dispose();
  }
}
