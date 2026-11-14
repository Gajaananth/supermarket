import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/buyme_database.dart';
import '../services/localization_service.dart';

class BuyMeCartScreen extends StatefulWidget {
  final VoidCallback onCheckoutTap;
  final VoidCallback onContinueShopping;

  const BuyMeCartScreen({
    super.key,
    required this.onCheckoutTap,
    required this.onContinueShopping,
  });

  @override
  State<BuyMeCartScreen> createState() => _BuyMeCartScreenState();
}

class _BuyMeCartScreenState extends State<BuyMeCartScreen> {
  @override
  Widget build(BuildContext context) {
    final db = BuyMeDatabase.instance;
    final loc = LocalizationService.instance;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        title: Text(loc.shoppingCart, style: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
      ),
      body: db.cart.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("🛒", style: TextStyle(fontSize: 64)),
                  const SizedBox(height: 16),
                  Text(
                    loc.tr(en: "Your Basket is Empty", ta: "உங்கள் கூடை காலியாக உள்ளது"),
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF10243B)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    loc.tr(en: "Explore Batticaloa fresh produce and staples.", ta: "மட்டக்களப்பு புதிய உணவுப் பொருட்களை பார்வையிடுங்கள்."),
                    style: const TextStyle(color: Color(0xFF62748A), fontSize: 12),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: widget.onContinueShopping,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF168BFF),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: Text(loc.tr(en: "Shop Groceries", ta: "பொருட்களை வாங்குக")),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: db.cart.length,
                    itemBuilder: (context, idx) {
                      final item = db.cart[idx];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: Colors.blueGrey.shade100),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(color: const Color(0xFFEAF3FF), borderRadius: BorderRadius.circular(12)),
                              child: Center(child: Text(item.product.icon, style: const TextStyle(fontSize: 22))),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    loc.isTamil ? item.product.nameTa : item.product.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF10243B)),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    "LKR ${item.product.price.toStringAsFixed(0)} • ${item.product.unit}",
                                    style: const TextStyle(fontSize: 11, color: Color(0xFF168BFF), fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove_circle_outline, color: Color(0xFF62748A), size: 20),
                                  onPressed: () => setState(() => db.updateQuantity(item.product.id, -1)),
                                ),
                                Text("${item.quantity}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                IconButton(
                                  icon: const Icon(Icons.add_circle, color: Color(0xFF168BFF), size: 20),
                                  onPressed: () => setState(() => db.updateQuantity(item.product.id, 1)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // Bill Summary Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                    boxShadow: [BoxShadow(color: const Color(0xFF10243B).withOpacity(0.06), blurRadius: 20, offset: const Offset(0, -4))],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(loc.subtotal, style: const TextStyle(color: Color(0xFF62748A), fontSize: 12)),
                          Text("LKR ${db.cartSubtotal.toStringAsFixed(2)}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("${loc.deliveryFee} (${db.selectedStore.locality})", style: const TextStyle(color: Color(0xFF62748A), fontSize: 12)),
                          Text("LKR ${db.cartDeliveryFee.toStringAsFixed(2)}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                      const Divider(height: 18),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(loc.totalPayable, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF10243B))),
                          Text(
                            "LKR ${db.cartGrandTotal.toStringAsFixed(2)}",
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: Color(0xFF168BFF)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: widget.onCheckoutTap,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF168BFF),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                          ),
                          child: Text(loc.checkout, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

class BuyMeStorePickerScreen extends StatelessWidget {
  final Function(BuyMeStore) onSelectStore;

  const BuyMeStorePickerScreen({super.key, required this.onSelectStore});

  @override
  Widget build(BuildContext context) {
    final db = BuyMeDatabase.instance;
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        title: const Text("Select BuyMe Store", style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: db.stores.length,
        itemBuilder: (context, idx) {
          final b = db.stores[idx];
          final isSelected = b.id == db.selectedStore.id;

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: isSelected ? const Color(0xFF168BFF) : Colors.blueGrey.shade200, width: isSelected ? 2 : 1),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.all(14),
              leading: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF168BFF) : const Color(0xFFEAF3FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    b.code.replaceFirst("DMB-", ""),
                    style: TextStyle(
                      color: isSelected ? Colors.white : const Color(0xFF168BFF),
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
              title: Text(b.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF10243B))),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(b.address, style: const TextStyle(fontSize: 11, color: Color(0xFF62748A))),
                  const SizedBox(height: 4),
                  Text("🕒 ${b.openingHours} • ${b.deliveryRadiusKm.toStringAsFixed(0)} km coverage", style: const TextStyle(fontSize: 10, color: Color(0xFF168BFF), fontWeight: FontWeight.w600)),
                ],
              ),
              trailing: isSelected
                  ? const Icon(Icons.check_circle, color: Color(0xFF168BFF))
                  : const Icon(Icons.chevron_right, color: Colors.blueGrey),
              onTap: () {
                db.selectedStore = b;
                onSelectStore(b);
              },
            ),
          );
        },
      ),
    );
  }
}

class BuyMeCheckoutScreen extends StatefulWidget {
  final VoidCallback onOrderConfirmed;

  const BuyMeCheckoutScreen({super.key, required this.onOrderConfirmed});

  @override
  State<BuyMeCheckoutScreen> createState() => _BuyMeCheckoutScreenState();
}

class _BuyMeCheckoutScreenState extends State<BuyMeCheckoutScreen> {
  final _addressController = TextEditingController(text: "No. 18 Central Road, Puliyanthivu, Batticaloa");
  final _phoneController = TextEditingController(text: "+94 77 123 4567");
  final _nameController = TextEditingController(text: "Kajan Sivanesan");

  @override
  Widget build(BuildContext context) {
    final db = BuyMeDatabase.instance;
    final loc = LocalizationService.instance;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        title: const Text("Checkout & Delivery", style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Fulfillment Store
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.blueGrey.shade200)),
              child: Row(
                children: [
                  const Text("🏪", style: TextStyle(fontSize: 28)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("FULFILLMENT SUPERSTORE", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF168BFF))),
                        Text(db.selectedStore.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10243B))),
                        Text(db.selectedStore.locality, style: const TextStyle(fontSize: 11, color: Color(0xFF62748A))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Delivery Details
            const Text("DELIVERY RECIPIENT", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF168BFF))),
            const SizedBox(height: 8),
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: "Full Name",
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.blueGrey.shade200)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneController,
              decoration: InputDecoration(
                labelText: "Phone Number",
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.blueGrey.shade200)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _addressController,
              maxLines: 2,
              decoration: InputDecoration(
                labelText: "Delivery Address in Batticaloa",
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.blueGrey.shade200)),
              ),
            ),
            const SizedBox(height: 20),

            // Payment Mode (COD)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFEAF3FF),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF168BFF).withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.payments_outlined, color: Color(0xFF168BFF), size: 32),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Payment Method: Cash on Delivery (COD)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF10243B))),
                        Text(loc.codNotice, style: const TextStyle(fontSize: 11, color: Color(0xFF62748A))),
                      ],
                    ),
                  ),
                  const Icon(Icons.check_circle, color: Color(0xFF168BFF)),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Order Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  db.placeSimulatedOrder(
                    address: _addressController.text,
                    phone: _phoneController.text,
                    customerName: _nameController.text,
                  );
                  widget.onOrderConfirmed();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                ),
                child: Text(
                  "${loc.placeOrder} • LKR ${db.cartGrandTotal.toStringAsFixed(2)}",
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

