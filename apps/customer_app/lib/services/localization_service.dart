import 'package:flutter/material.dart';

enum BuyMeLanguage { english, tamil }

class LocalizationService {
  static final LocalizationService instance = LocalizationService._internal();
  LocalizationService._internal();

  BuyMeLanguage currentLanguage = BuyMeLanguage.english;

  final ValueNotifier<BuyMeLanguage> languageNotifier =
      ValueNotifier<BuyMeLanguage>(BuyMeLanguage.english);

  void setLanguage(BuyMeLanguage lang) {
    currentLanguage = lang;
    languageNotifier.value = lang;
  }

  bool get isTamil => currentLanguage == BuyMeLanguage.tamil;

  String tr({required String en, required String ta}) {
    return isTamil ? ta : en;
  }

  // Predefined strings
  String get appTitle => "BuyMe";
  String get districtTitle => isTamil ? "மட்டக்களப்பு மாவட்டம்" : "Batticaloa District";
  String get deliveringTo => isTamil ? "விநியோக இடம்" : "DELIVERING TO";
  String get changeStore => isTamil ? "கிளையை மாற்று" : "Change Store";
  String get searchPlaceholder => isTamil ? "மட்டக்களப்பு மளிகை பொருட்களை தேடுங்கள்..." : "Search groceries in Batticaloa...";
  String get categories => isTamil ? "வகைகள்" : "Categories";
  String get featuredProducts => isTamil ? "சிறப்பு பொருட்கள்" : "Featured Groceries";
  String get allProducts => isTamil ? "அனைத்து பொருட்கள்" : "All Products";
  String get addToCart => isTamil ? "+ சேர்" : "+ Add";
  String get shoppingCart => isTamil ? "கூடை" : "Basket";
  String get subtotal => isTamil ? "கூட்டுத்தொகை" : "Subtotal";
  String get deliveryFee => isTamil ? "விநியோக கட்டணம்" : "Delivery Fee";
  String get totalPayable => isTamil ? "செலுத்த வேண்டிய தொகை" : "Total Payable";
  String get checkout => isTamil ? "கொடுப்பனவு செய்ய தொடரவும்" : "Proceed to Checkout";
  String get placeOrder => isTamil ? "ஆர்டரை உறுதிப்படுத்துக (COD)" : "Place Order (Cash on Delivery)";
  String get orderPlaced => isTamil ? "ஆர்டர் வெற்றிகரமாக பெறப்பட்டது!" : "Order Placed Successfully!";
  String get liveTracking => isTamil ? "நேரடி விநியோக கண்காணிப்பு" : "Live Delivery Tracking";
  String get orderHistory => isTamil ? "ஆர்டர் வரலாறு" : "Order History";
  String get profile => isTamil ? "சுயவிவரம்" : "Profile";
  String get loyaltyPoints => isTamil ? "வெகுமதி புள்ளிகள்" : "Loyalty Reward Points";
  String get helpSupport => isTamil ? "உதவி & தொடர்பு" : "Help & Support";
  String get aboutBuyMe => isTamil ? "டி-மார்ட் பற்றி" : "About BuyMe";
  String get codNotice => isTamil ? "பொருட்களை பெற்றதும் பணம் செலுத்துங்கள் (LKR)" : "Pay with Cash on Delivery (LKR)";
  String get callRider => isTamil ? "ரைடரை அழைக்கவும்" : "Call Rider";
}

