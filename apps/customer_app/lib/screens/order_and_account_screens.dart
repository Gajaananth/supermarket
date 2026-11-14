import 'package:flutter/material.dart';
import '../services/buyme_database.dart';
import '../services/localization_service.dart';

class BuyMeOrderTrackingScreen extends StatelessWidget {
  final VoidCallback onBackToStore;

  const BuyMeOrderTrackingScreen({super.key, required this.onBackToStore});

  @override
  Widget build(BuildContext context) {
    final db = BuyMeDatabase.instance;
    final loc = LocalizationService.instance;
    final activeOrder = db.orders.first;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        title: Text(loc.liveTracking, style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Simulated Map Graphic
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: const LinearGradient(
                  colors: [Color(0xFFEAF3FF), Color(0xFFD6E8FF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(color: const Color(0xFF168BFF).withOpacity(0.3)),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Positioned(
                    top: 16,
                    left: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.9), borderRadius: BorderRadius.circular(12)),
                      child: Text("🏪 ${activeOrder.storeName}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF10243B))),
                    ),
                  ),
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("🛵", style: TextStyle(fontSize: 42)),
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(color: const Color(0xFF10243B), borderRadius: BorderRadius.circular(12)),
                        child: const Text("Kamal Perera • 36 km/h", style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  Positioned(
                    bottom: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.9), borderRadius: BorderRadius.circular(12)),
                      child: const Text("📍 Puliyanthivu, Batticaloa", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Color(0xFF10243B))),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Order Status Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.blueGrey.shade100),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(activeOrder.id, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF168BFF), fontSize: 14)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: const Color(0xFFEAF3FF), borderRadius: BorderRadius.circular(12)),
                        child: Text(
                          "ETA: ${activeOrder.estimatedDelivery}",
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF168BFF)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 20,
                        backgroundColor: Color(0xFF168BFF),
                        child: Text("KP", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(activeOrder.riderName ?? "Kamal Perera", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            const Text("Motorcycle • EP BDF-4821 • ⭐ 4.9", style: TextStyle(color: Color(0xFF62748A), fontSize: 11)),
                          ],
                        ),
                      ),
                      ElevatedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Calling Rider Kamal (+94 77 345 6789)...")),
                          );
                        },
                        icon: const Icon(Icons.phone, size: 14),
                        label: Text(loc.callRider, style: const TextStyle(fontSize: 11)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFEAF3FF),
                          foregroundColor: const Color(0xFF168BFF),
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Cash Collection Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Payable to Rider (COD):", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF065F46), fontSize: 12)),
                  Text(
                    "LKR ${activeOrder.totalAmount.toStringAsFixed(2)}",
                    style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF059669), fontSize: 15),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: onBackToStore,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF168BFF),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                minimumSize: const Size(double.infinity, 48),
              ),
              child: const Text("Back to Shopping ➔", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

class BuyMeProfileScreen extends StatelessWidget {
  final VoidCallback onLanguageChangeTap;
  final VoidCallback onOrderHistoryTap;

  const BuyMeProfileScreen({
    super.key,
    required this.onLanguageChangeTap,
    required this.onOrderHistoryTap,
  });

  @override
  Widget build(BuildContext context) {
    final loc = LocalizationService.instance;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        title: Text(loc.profile, style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Center(
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF168BFF), Color(0xFF0866CC)]),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF168BFF).withOpacity(0.3), blurRadius: 16, offset: const Offset(0, 6)),
                      ],
                    ),
                    child: const Center(
                      child: Text("KS", style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text("Kajan Sivanesan", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF10243B))),
                  const SizedBox(height: 2),
                  const Text("+94 77 123 4567 • Puliyanthivu, Batticaloa", style: TextStyle(fontSize: 12, color: Color(0xFF62748A))),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Loyalty Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.amber.shade200),
                boxShadow: [BoxShadow(color: Colors.amber.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 4))],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Text("⭐", style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(loc.loyaltyPoints, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10243B))),
                          const Text("Redeemable at any BuyMe store", style: TextStyle(fontSize: 10, color: Color(0xFF62748A))),
                        ],
                      ),
                    ],
                  ),
                  const Text("520 pts", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Colors.amber)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Settings Tile List
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.blueGrey.shade100),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.history, color: Color(0xFF168BFF)),
                    title: Text(loc.orderHistory, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    trailing: const Icon(Icons.chevron_right, color: Colors.blueGrey),
                    onTap: onOrderHistoryTap,
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.language, color: Color(0xFF168BFF)),
                    title: const Text("Language / மொழி", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text(loc.isTamil ? "தமிழ் (Tamil)" : "English", style: const TextStyle(fontSize: 11, color: Color(0xFF168BFF))),
                    trailing: const Icon(Icons.chevron_right, color: Colors.blueGrey),
                    onTap: onLanguageChangeTap,
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.info_outline, color: Color(0xFF168BFF)),
                    title: Text(loc.aboutBuyMe, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: const Text("10 Stores in Batticaloa District", style: TextStyle(fontSize: 11, color: Color(0xFF62748A))),
                    trailing: const Icon(Icons.chevron_right, color: Colors.blueGrey),
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text("About BuyMe Batticaloa"),
                          content: const Text(
                            "BuyMe is the premier supermarket network operating 10 stores exclusively across Batticaloa District, Eastern Province, Sri Lanka. Features cold-chain delivery of local lagoon catch and up-country staples.",
                          ),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Close")),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

