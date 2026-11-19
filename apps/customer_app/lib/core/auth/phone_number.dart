String? validateSriLankanPhone(String input) {
  final compact = input.replaceAll(RegExp(r'[\s()-]'), '');
  final normalized = compact.startsWith('+94')
      ? '0${compact.substring(3)}'
      : compact;
  if (!RegExp(r'^0?7\d{8}$').hasMatch(normalized)) {
    return 'Enter a valid Sri Lankan mobile number';
  }
  return null;
}

String normalizeSriLankanPhone(String input) {
  final compact = input.replaceAll(RegExp(r'[\s()-]'), '');
  if (compact.startsWith('+94') && compact.length == 12) return compact;
  if (compact.startsWith('0') && compact.length == 10) {
    return '+94${compact.substring(1)}';
  }
  if (compact.startsWith('7') && compact.length == 9) return '+94$compact';
  throw const FormatException('Enter a valid Sri Lankan mobile number');
}
