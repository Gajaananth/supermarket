import 'package:flutter/material.dart';

void main() {
  runApp(const BuyMeRiderApp());
}

class BuyMeRiderApp extends StatelessWidget {
  const BuyMeRiderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BuyMe Rider - Batticaloa District',
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
      home: const RiderMainRootScreen(),
    );
  }
}

class RiderMainRootScreen extends StatefulWidget {
  const RiderMainRootScreen({super.key});

  @override
  State<RiderMainRootScreen> createState() => _RiderMainRootScreenState();
}

class _RiderMainRootScreenState extends State<RiderMainRootScreen> {
  bool _isOnline = true;
  int _currentNavIndex = 0; // 0 = Dispatch, 1 = History, 2 = Earnings, 3 = Profile
  bool _isDelivered = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "BuyMe Fleet Operations",
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF10243B)),
            ),
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _isOnline ? const Color(0xFF10B981) : Colors.grey,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  _isOnline ? "ONLINE • BATTICALOA DISTRICT FLEET" : "OFFLINE",
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: _isOnline ? const Color(0xFF10B981) : Colors.grey,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          Switch(
            value: _isOnline,
            activeColor: const Color(0xFF168BFF),
            onChanged: (val) => setState(() => _isOnline = val),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: IndexedStack(
        index: _currentNavIndex,
        children: [
          _buildDispatchScreen(),
          _buildHistoryScreen(),
          _buildEarningsScreen(),
          _buildProfileScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentNavIndex,
        onDestinationSelected: (idx) => setState(() => _currentNavIndex = idx),
        backgroundColor: Colors.white,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.two_wheeler_outlined), selectedIcon: Icon(Icons.two_wheeler), label: "Dispatch"),
          NavigationDestination(icon: Icon(Icons.assignment_outlined), selectedIcon: Icon(Icons.assignment), label: "Trips"),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), selectedIcon: Icon(Icons.account_balance_wallet), label: "Earnings"),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: "Rider ID"),
        ],
      ),
    );
  }

  Widget _buildDispatchScreen() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Active Delivery Dispatch Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFF168BFF).withOpacity(0.3)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF168BFF).withOpacity(0.08),
                blurRadius: 20,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("ORDER #DMB-2026-901", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF10243B))),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _isDelivered ? const Color(0xFF10B981) : const Color(0xFF168BFF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _isDelivered ? "DELIVERED" : "OUT FOR DELIVERY",
                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Route Points in Batticaloa
              _buildRoutePoint(Icons.store, "BuyMe Batticaloa Town Hub", "No. 45 Main Street, Puliyanthivu", true),
              Padding(
                padding: const EdgeInsets.only(left: 11),
                child: Container(width: 2, height: 26, color: const Color(0xFF168BFF)),
              ),
              _buildRoutePoint(Icons.home, "Kajan Sivanesan", "No. 18 Central Road, Puliyanthivu, Batticaloa", false),

              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF3FF),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text("Payment: Cash on Delivery", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    Text("Collect: LKR 5,190.00", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF168BFF))),
                  ],
                ),
              ),

              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.phone, size: 16),
                      label: const Text("Call Client"),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Calling Kajan Sivanesan (+94 77 123 4567)...")),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isDelivered ? Colors.grey : const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                      ),
                      icon: const Icon(Icons.check, size: 16),
                      label: Text(_isDelivered ? "Delivered ✓" : "Confirm Delivery"),
                      onPressed: _isDelivered
                          ? null
                          : () {
                              setState(() => _isDelivered = true);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text("Delivery Completed! LKR 450.00 commission credited.")),
                              );
                            },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
        const Text("Today's Shift Statistics", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildMetricTile("Completed Trips", _isDelivered ? "8 deliveries" : "7 deliveries", const Color(0xFF168BFF))),
            const SizedBox(width: 12),
            Expanded(child: _buildMetricTile("Shift Earnings", _isDelivered ? "LKR 5,800" : "LKR 5,350", const Color(0xFF10B981))),
          ],
        ),

        const SizedBox(height: 20),
        // Vehicle Specifications Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.blueGrey.shade100),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text("ASSIGNED FLEET VEHICLE", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF168BFF))),
              SizedBox(height: 6),
              Text("Motorcycle • EP BDF-4821", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF10243B))),
              Text("Eastern Province Commercial Registration • Inspected 2026", style: TextStyle(fontSize: 11, color: Color(0xFF62748A))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryScreen() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text("Completed Deliveries Today", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        const SizedBox(height: 12),
        _buildHistoryTile("#ORD-2026-911", "Tharshini Vijayaratnam (Koddaimunai)", "LKR 2,830.00", "08:20 AM"),
        _buildHistoryTile("#ORD-2026-912", "Fathima Nazeera (Kattankudy)", "LKR 2,090.00", "08:35 AM"),
        _buildHistoryTile("#ORD-2026-913", "Kavitha Murugesan (Eravur)", "LKR 1,500.00", "08:50 AM"),
        _buildHistoryTile("#ORD-2026-919", "Tharshini Mahendran (Kiran)", "LKR 1,770.00", "09:05 AM"),
        _buildHistoryTile("#ORD-2026-920", "Maria Anton (Vellavely)", "LKR 2,390.00", "09:18 AM"),
      ],
    );
  }

  Widget _buildHistoryTile(String orderId, String client, String amount, String time) {
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
              Text(orderId, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF168BFF), fontSize: 13)),
              Text(client, style: const TextStyle(fontSize: 11, color: Color(0xFF62748A))),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(amount, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF10243B), fontSize: 13)),
              Text(time, style: const TextStyle(fontSize: 10, color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEarningsScreen() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF168BFF), Color(0xFF0866CC)]),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text("WEEKLY EARNINGS PAYOUT", style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
              SizedBox(height: 6),
              Text("LKR 38,450.00", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
              SizedBox(height: 4),
              Text("Includes 42 completed Batticaloa trips + on-time incentives.", style: TextStyle(color: Colors.white70, fontSize: 11)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildProfileScreen() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Center(
          child: Column(
            children: [
              const CircleAvatar(
                radius: 36,
                backgroundColor: Color(0xFF168BFF),
                child: Text("KS", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 12),
              const Text("Kajan Sivanesan", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF10243B))),
              const Text("Batticaloa Central Fleet • Rating ⭐ 4.9", style: TextStyle(fontSize: 12, color: Color(0xFF62748A))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRoutePoint(IconData icon, String title, String subtitle, bool isPickup) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: isPickup ? const Color(0xFF168BFF) : const Color(0xFF10B981)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10243B))),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF62748A))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMetricTile(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withOpacity(0.06)),
      ),
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
