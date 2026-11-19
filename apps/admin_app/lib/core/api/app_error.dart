import 'package:chopper/chopper.dart';

typedef JsonMap = Map<String, Object?>;

class AdminApiException implements Exception {
  const AdminApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

Object? readResponse(Response response) {
  if (!response.isSuccessful) {
    throw AdminApiException(
      _message(response.body),
      statusCode: response.statusCode,
    );
  }
  final body = response.body;
  if (body is Map && body.containsKey('data')) return body['data'];
  return body;
}

JsonMap jsonMap(Object? value, {required String field}) {
  if (value is Map) return Map<String, Object?>.from(value);
  throw FormatException('Invalid $field response');
}

List<JsonMap> jsonMaps(Object? value, {required String field}) {
  final list = value is List
      ? value
      : value is Map && value['items'] is List
      ? value['items'] as List
      : null;
  if (list == null) throw FormatException('Invalid $field response');
  return list
      .map((item) => jsonMap(item, field: field))
      .toList(growable: false);
}

String requiredString(JsonMap value, String key) {
  final result = value[key];
  if (result is! String || result.trim().isEmpty) {
    throw FormatException('The response is missing $key');
  }
  return result;
}

double numberValue(Object? value, {required String field}) {
  if (value is num) return value.toDouble();
  if (value is String) {
    final parsed = double.tryParse(value);
    if (parsed != null) return parsed;
  }
  throw FormatException('Invalid $field value');
}

String _message(Object? body) {
  if (body is Map) {
    final message = body['message'];
    if (message is String && message.isNotEmpty) return message;
    if (message is List) return message.join(', ');
  }
  return 'The request failed. Please try again.';
}
