import 'package:flutter/material.dart';

void main() {
  runApp(const BuyMeAdminMobileApp());
}

class BuyMeAdminMobileApp extends StatelessWidget {
  const BuyMeAdminMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BuyMe Admin Mobile - Batticaloa',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF7FAFF),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF168BFF),
          primary: const Color(0xFF168BFF),
          surface: Colors.white,
        ),
      ),
      home: const AdminMainRootScreen(),
    );
  }
}

class AdminMainRootScreen extends StatefulWidget {
  const AdminMainRootScreen({super.key});

  @override
  State<AdminMainRootScreen> createState() => _AdminMainRootScreenState();
}

class _AdminMainRootScreenState extends State<AdminMainRootScreen> {
  int _currentNavIndex = 0; // 0 = Overview, 1 = Orders, 2 = Stock, 3 = Stores, 4 = Fleet

  final List<Map<String, dynamic>> _stores = const [
    {"name": "BuyMe Batticaloa Town", "code": "DMB-01", "locality": "Puliyanthivu", "orders": 4, "stock": 420},
    {"name": "BuyMe Kattankudy", "code": "DMB-02", "locality": "Kattankudy", "orders": 3, "stock": 380},
    {"name": "BuyMe Eravur", "code": "DMB-03", "locality": "Eravur", "orders": 2, "stock": 290},
    {"name": "BuyMe Valaichenai", "code": "DMB-04", "locality": "Valaichenai", "orders": 3, "stock": 310},
    {"name": "BuyMe Oddamavadi", "code": "DMB-05", "locality": "Oddamavadi", "orders": 2, "stock": 250},
    {"name": "BuyMe Chenkalady", "code": "DMB-06", "locality": "Chenkalady", "orders": 2, "stock": 230},
    {"name": "BuyMe Kaluwanchikudy", "code": "DMB-07", "locality": "Kaluwanchikudy", "orders": 2, "stock": 240},
    {"name": "BuyMe Arayampathy", "code": "DMB-08", "locality": "Arayampathy", "orders": 2, "stock": 210},
    {"name": "BuyMe Kiran", "code": "DMB-09", "locality": "Kiran", "orders": 1, "stock": 180},
    {"name": "BuyMe Vellavely", "code": "DMB-10", "locality": "Vellavely", "orders": 1, "stock": 160},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              "BuyMe Admin Portal",
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF10243B)),
            ),
            Text(
              "10 Hubs Active • Batticaloa District",
              style: TextStyle(fontSize: 10, color: Color(0xFF168BFF), fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
      body: IndexedStack(
        index: _currentNavIndex,
        children: [
          _buildOverviewScreen(),
          _buildOrdersScreen(),
          _buildStockScreen(),
          _buildStoresScreen(),
          _buildFleetScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentNavIndex,
        onDestinationSelected: (idx) => setState(() => _currentNavIndex = idx),
        backgroundColor: Colors.white,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: "Overview"),
          NavigationDestination(icon: Icon(Icons.shopping_bag_outlined), selectedIcon: Icon(Icons.shopping_bag), label: "Orders"),
          NavigationDestination(icon: Icon(Icons.inventory_2_outlined), selectedIcon: Icon(Icons.inventory_2), label: "Stock"),
          NavigationDestination(icon: Icon(Icons.storefront_outlined), selectedIcon: Icon(Icons.storefront), label: "Stores"),
          NavigationDestination(icon: Icon(Icons.two_wheeler_outlined), selectedIcon: Icon(Icons.two_wheeler), label: "Fleet"),
        ],
      ),
    );
  }

  Widget _buildOverviewScreen() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF168BFF), Color(0xFF0866CC)]),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(color: const Color(0xFF168BFF).withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text("DISTRICT REVENUE TODAY (LKR)", style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
              SizedBox(height: 6),
              Text("LKR 184,520.00", style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900)),
              SizedBox(height: 4),
              Text("+18.4% vs last week • 10 Active Stores", style: TextStyle(color: Colors.white70, fontSize: 11)),
            ],
          ),
        ),
        const SizedBox(height: 18),

        Row(
          children: [
            Expanded(child: _buildMetricTile("Live Orders", "22 active", const Color(0xFF168BFF))),
            const SizedBox(width: 12),
            Expanded(child: _buildMetricTile("Online Riders", "15 riders", const Color(0xFF10B981))),
          ],
        ),
        const SizedBox(height: 20),

        const Text("Active Delivery Pipeline", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        const SizedBox(height: 10),
        _buildOrderRow("#ORD-2026-901", "Kajan Sivanesan", "BuyMe Batticaloa Town", "LKR 5,190.00", "Out for Delivery"),
        _buildOrderRow("#ORD-2026-902", "Mohamed Rizwan", "BuyMe Kattankudy", "LKR 3,110.00", "Out for Delivery"),
        _buildOrderRow("#ORD-2026-903", "Anton Jeroshan", "BuyMe Eravur", "LKR 3,630.00", "Out for Delivery"),
        _buildOrderRow("#ORD-2026-904", "Niroshan K.", "BuyMe Valaichenai", "LKR 4,740.00", "Out for Delivery"),
      ],
    );
  }

  Widget _buildOrdersScreen() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text("All District Orders (22 Live)", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        const SizedBox(height: 12),
        _buildOrderRow("#ORD-2026-901", "Kajan Sivanesan", "BuyMe Batticaloa Town", "LKR 5,190.00", "Out for Delivery"),
        _buildOrderRow("#ORD-2026-902", "Mohamed Rizwan", "BuyMe Kattankudy", "LKR 3,110.00", "Out for Delivery"),
        _buildOrderRow("#ORD-2026-903", "Anton Jeroshan", "BuyMe Eravur", "LKR 3,630.00", "Out for Delivery"),
        _buildOrderRow("#ORD-2026-904", "Niroshan K.", "BuyMe Valaichenai", "LKR 4,740.00", "Out for Delivery"),
        _buildOrderRow("#ORD-2026-905", "Tharshan S.", "BuyMe Chenkalady", "LKR 2,610.00", "Out for Delivery"),
        _buildOrderRow("#ORD-2026-906", "Roshan J.", "BuyMe Arayampathy", "LKR 2,870.00", "Out for Delivery"),
        _buildOrderRow("#ORD-2026-907", "Ahamed M.", "BuyMe Oddamavadi", "LKR 4,330.00", "Preparing"),
        _buildOrderRow("#ORD-2026-908", "Yathushan R.", "BuyMe Kaluwanchikudy", "LKR 2,770.00", "Ready"),
      ],
    );
  }

  Widget _buildStockScreen() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text("Multi-Store Stock Matrix", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        const SizedBox(height: 12),
        _buildStockItem("Batticaloa Red Raw Rice (5kg)", "Staples", "185 in stock", false),
        _buildStockItem("Fresh Lagoon Prawns (500g)", "Seafood", "45 in stock", false),
        _buildStockItem("Fresh Seer Fish Slices (500g)", "Seafood", "35 in stock", true),
        _buildStockItem("Ambewela Fresh Milk (1L)", "Dairy", "190 in stock", false),
        _buildStockItem("Kotmale Cheddar Cheese", "Dairy", "48 in stock", true),
        _buildStockItem("Eastern Roasted Curry Powder", "Spices", "140 in stock", false),
        _buildStockItem("Munchee Cream Cracker", "Snacks", "260 in stock", false),
      ],
    );
  }

  Widget _buildStoresScreen() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _stores.length,
      itemBuilder: (context, idx) {
        final b = _stores[idx];
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.blueGrey.shade100)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(b["name"], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10243B))),
                  Text("Locality: ${b["locality"]} • Code: ${b["code"]}", style: const TextStyle(fontSize: 11, color: Color(0xFF62748A))),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(12)),
                child: Text("${b["orders"]} Active", style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 10)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFleetScreen() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text("Delivery Fleet Roster (15 Active)", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        const SizedBox(height: 12),
        _buildRiderTile("Kajan Sivanesan", "Motorcycle • EP BDF-4821", "BuyMe Batticaloa Town", "Delivering"),
        _buildRiderTile("Mohamed Ahamed", "Motorcycle • EP BEH-7712", "BuyMe Kattankudy", "Delivering"),
        _buildRiderTile("Anton Jeroshan", "Motorcycle • EP BDJ-5502", "BuyMe Eravur", "Delivering"),
        _buildRiderTile("Jeroshan Peter", "Electric Scooter • EP CPQ-1204", "BuyMe Valaichenai", "Delivering"),
        _buildRiderTile("Niroshan Kanapathipillai", "Motorcycle • EP BGL-1940", "BuyMe Batticaloa Town", "Available"),
        _buildRiderTile("Rizwan Faleel", "Electric Scooter • EP CPR-3091", "BuyMe Kattankudy", "Available"),
      ],
    );
  }

  Widget _buildRiderTile(String name, String vehicle, String store, String status) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.blueGrey.shade100)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10243B))),
              Text("$vehicle • $store", style: const TextStyle(fontSize: 11, color: Color(0xFF62748A))),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: status == "Delivering" ? const Color(0xFFEAF3FF) : const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(status, style: TextStyle(color: status == "Delivering" ? const Color(0xFF168BFF) : const Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 10)),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderRow(String id, String customer, String store, String total, String status) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.blueGrey.shade100)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(id, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF168BFF), fontSize: 12)),
              Text(customer, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF10243B), fontSize: 13)),
              Text(store, style: const TextStyle(fontSize: 10, color: Color(0xFF62748A))),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(total, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF10243B), fontSize: 13)),
              Container(
                margin: const EdgeInsets.only(top: 4),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: const Color(0xFFEAF3FF), borderRadius: BorderRadius.circular(8)),
                child: Text(status, style: const TextStyle(color: Color(0xFF168BFF), fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStockItem(String name, String cat, String stock, bool isLow) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.blueGrey.shade100)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10243B))),
              Text(cat, style: const TextStyle(fontSize: 11, color: Color(0xFF62748A))),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: isLow ? const Color(0xFFFEF3C7) : const Color(0xFFEAF3FF), borderRadius: BorderRadius.circular(12)),
            child: Text(stock, style: TextStyle(color: isLow ? const Color(0xFFD97706) : const Color(0xFF168BFF), fontWeight: FontWeight.bold, fontSize: 11)),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.black.withOpacity(0.06))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF62748A), fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}
