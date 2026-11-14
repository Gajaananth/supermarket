import 'package:flutter/material.dart';
import 'models/models.dart';
import 'services/buyme_database.dart';
import 'services/localization_service.dart';
import 'screens/auth_screens.dart';
import 'screens/shopping_screens.dart';
import 'screens/checkout_screens.dart';
import 'screens/order_and_account_screens.dart';

void main() {
  runApp(const BuyMeCustomerApp());
}

class BuyMeCustomerApp extends StatelessWidget {
  const BuyMeCustomerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<BuyMeLanguage>(
      valueListenable: LocalizationService.instance.languageNotifier,
      builder: (context, lang, child) {
        return MaterialApp(
          title: 'BuyMe Customer - Batticaloa',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            useMaterial3: true,
            scaffoldBackgroundColor: const Color(0xFFF7FAFF),
            fontFamily: 'DM Sans',
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF168BFF),
              primary: const Color(0xFF168BFF),
              surface: Colors.white,
            ),
          ),
          home: const BuyMeRootFlow(),
        );
      },
    );
  }
}

class BuyMeRootFlow extends StatefulWidget {
  const BuyMeRootFlow({super.key});

  @override
  State<BuyMeRootFlow> createState() => _BuyMeRootFlowState();
}

class _BuyMeRootFlowState extends State<BuyMeRootFlow> {
  // Navigation Flow States
  String _activeRoute = "home"; // "splash", "onboarding", "login", "home", "checkout", "storePicker", "tracking"
  int _activeNavIndex = 0; // 0=Home, 1=Categories, 2=Cart, 3=Track, 4=Profile

  @override
  Widget build(BuildContext context) {
    final loc = LocalizationService.instance;
    final db = BuyMeDatabase.instance;

    if (_activeRoute == "splash") {
      return BuyMeSplashScreen(onFinish: () => setState(() => _activeRoute = "home"));
    }

    if (_activeRoute == "onboarding") {
      return BuyMeOnboardingScreen(onComplete: () => setState(() => _activeRoute = "home"));
    }

    if (_activeRoute == "login") {
      return BuyMeLoginScreen(
        onLoginSuccess: () => setState(() => _activeRoute = "home"),
        onRegisterTap: () => setState(() => _activeRoute = "home"),
        onForgotPasswordTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Demo OTP sent to +94 77 123 4567: 8492")),
          );
        },
      );
    }

    if (_activeRoute == "storePicker") {
      return BuyMeStorePickerScreen(
        onSelectStore: (store) {
          setState(() => _activeRoute = "home");
        },
      );
    }

    if (_activeRoute == "checkout") {
      return BuyMeCheckoutScreen(
        onOrderConfirmed: () {
          setState(() {
            _activeNavIndex = 3; // Switch to tracking tab
            _activeRoute = "home";
          });
        },
      );
    }

    // Main App with Bottom Navigation Bar
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      body: IndexedStack(
        index: _activeNavIndex,
        children: [
          // 0: Home
          BuyMeHomeScreen(
            onCartTap: () => setState(() => _activeNavIndex = 2),
            onStorePickerTap: () => setState(() => _activeRoute = "storePicker"),
            onSearchTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Search across 35 Batticaloa products active.")),
              );
            },
            onProductTap: (product) {
              _showProductDetailsModal(context, product, loc, db);
            },
          ),

          // 1: Categories
          Scaffold(
            appBar: AppBar(
              title: Text(loc.categories, style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
              backgroundColor: Colors.white,
              elevation: 0,
            ),
            body: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.1,
              ),
              itemCount: db.categories.length,
              itemBuilder: (context, idx) {
                final c = db.categories[idx];
                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.blueGrey.shade100),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(c.icon, style: const TextStyle(fontSize: 36)),
                      const SizedBox(height: 8),
                      Text(
                        loc.isTamil ? c.nameTa : c.name,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF10243B)),
                      ),
                      Text("${c.itemCount} items", style: const TextStyle(fontSize: 10, color: Color(0xFF168BFF))),
                    ],
                  ),
                );
              },
            ),
          ),

          // 2: Cart
          BuyMeCartScreen(
            onCheckoutTap: () => setState(() => _activeRoute = "checkout"),
            onContinueShopping: () => setState(() => _activeNavIndex = 0),
          ),

          // 3: Tracking
          BuyMeOrderTrackingScreen(
            onBackToStore: () => setState(() => _activeNavIndex = 0),
          ),

          // 4: Profile
          BuyMeProfileScreen(
            onOrderHistoryTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Past orders for Batticaloa delivery loaded.")),
              );
            },
            onLanguageChangeTap: () {
              _showLanguageDialog(context, loc);
            },
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.95),
          border: Border(top: BorderSide(color: Colors.blueGrey.shade100)),
        ),
        child: BottomNavigationBar(
          currentIndex: _activeNavIndex,
          onTap: (idx) => setState(() => _activeNavIndex = idx),
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: const Color(0xFF168BFF),
          unselectedItemColor: const Color(0xFF62748A),
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 10),
          items: [
            BottomNavigationBarItem(icon: const Icon(Icons.storefront_outlined), activeIcon: const Icon(Icons.storefront), label: loc.tr(en: "Store", ta: "கடை")),
            BottomNavigationBarItem(icon: const Icon(Icons.grid_view_outlined), activeIcon: const Icon(Icons.grid_view), label: loc.tr(en: "Categories", ta: "வகைகள்")),
            BottomNavigationBarItem(
              icon: ValueListenableBuilder<int>(
                valueListenable: db.cartItemCountNotifier,
                builder: (context, count, child) {
                  return Stack(
                    children: [
                      const Icon(Icons.shopping_bag_outlined),
                      if (count > 0)
                        Positioned(
                          right: 0,
                          top: 0,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: const BoxDecoration(color: Color(0xFF168BFF), shape: BoxShape.circle),
                            constraints: const BoxConstraints(minWidth: 12, minHeight: 12),
                            child: Text("$count", textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                          ),
                        ),
                    ],
                  );
                },
              ),
              activeIcon: const Icon(Icons.shopping_bag),
              label: loc.shoppingCart,
            ),
            BottomNavigationBarItem(icon: const Icon(Icons.moped_outlined), activeIcon: const Icon(Icons.moped), label: loc.tr(en: "Track", ta: "கண்காணிப்பு")),
            BottomNavigationBarItem(icon: const Icon(Icons.person_outline), activeIcon: const Icon(Icons.person), label: loc.profile),
          ],
        ),
      ),
    );
  }

  void _showLanguageDialog(BuildContext context, LocalizationService loc) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Select Language / மொழியை தெரிவுசெய்க"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text("English (Default)"),
              trailing: !loc.isTamil ? const Icon(Icons.check, color: Color(0xFF168BFF)) : null,
              onTap: () {
                loc.setLanguage(BuyMeLanguage.english);
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              title: const Text("தமிழ் (Tamil)"),
              trailing: loc.isTamil ? const Icon(Icons.check, color: Color(0xFF168BFF)) : null,
              onTap: () {
                loc.setLanguage(BuyMeLanguage.tamil);
                Navigator.pop(ctx);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showProductDetailsModal(BuildContext context, BuyMeProduct p, LocalizationService loc, BuyMeDatabase db) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.blueGrey.shade300, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 16),
            Row(
              children: [
                Text(p.icon, style: const TextStyle(fontSize: 48)),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(loc.isTamil ? p.nameTa : p.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF10243B))),
                      Text("${p.brand} • ${p.unit}", style: const TextStyle(color: Color(0xFF62748A), fontSize: 12)),
                      const SizedBox(height: 4),
                      Text("LKR ${p.price.toStringAsFixed(0)}", style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF168BFF))),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(loc.isTamil ? p.descriptionTa : p.description, style: const TextStyle(fontSize: 12, color: Color(0xFF62748A), height: 1.4)),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  db.addToCart(p);
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("✓ Added ${p.name} to Basket")),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF168BFF),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                ),
                child: Text(loc.addToCart, style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
