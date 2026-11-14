import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/buyme_database.dart';
import '../services/localization_service.dart';

class BuyMeHomeScreen extends StatefulWidget {
  final VoidCallback onCartTap;
  final Function(BuyMeProduct) onProductTap;
  final VoidCallback onStorePickerTap;
  final VoidCallback onSearchTap;

  const BuyMeHomeScreen({
    super.key,
    required this.onCartTap,
    required this.onProductTap,
    required this.onStorePickerTap,
    required this.onSearchTap,
  });

  @override
  State<BuyMeHomeScreen> createState() => _BuyMeHomeScreenState();
}

class _BuyMeHomeScreenState extends State<BuyMeHomeScreen> {
  String _selectedCatId = "all";

  @override
  Widget build(BuildContext context) {
    final db = BuyMeDatabase.instance;
    final loc = LocalizationService.instance;

    final filteredProducts = _selectedCatId == "all"
        ? db.products
        : db.products.where((p) => p.categoryId == _selectedCatId).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFF),
      appBar: AppBar(
        backgroundColor: Colors.white.withOpacity(0.9),
        elevation: 0,
        centerTitle: false,
        title: GestureDetector(
          onTap: widget.onStorePickerTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                loc.deliveringTo,
                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF168BFF), letterSpacing: 1.0),
              ),
              Row(
                children: [
                  Text(
                    db.selectedStore.name,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF10243B)),
                  ),
                  const Icon(Icons.arrow_drop_down, color: Color(0xFF168BFF), size: 18),
                ],
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: Color(0xFF10243B)),
            onPressed: widget.onSearchTap,
          ),
          ValueListenableBuilder<int>(
            valueListenable: db.cartItemCountNotifier,
            builder: (context, count, child) {
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_bag_outlined, color: Color(0xFF10243B)),
                    onPressed: widget.onCartTap,
                  ),
                  if (count > 0)
                    Positioned(
                      right: 6,
                      top: 6,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(color: Color(0xFF168BFF), shape: BoxShape.circle),
                        child: Text(
                          "$count",
                          style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Promotional Banner
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: const LinearGradient(
                  colors: [Color(0xFF168BFF), Color(0xFF0866CC)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF168BFF).withOpacity(0.25), blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                          child: const Text("BATTICALOA COLD-CHAIN", style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          loc.tr(en: "Fresh In 30-45 Mins", ta: "30-45 நிமிடங்களில் உங்கள் இல்லத்தில்"),
                          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          loc.tr(en: "Lagoon prawns, dairy & organic vegetables.", ta: "வாவி இறால், பால் மற்றும் புதிய காய்கறிகள்."),
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  const Text("🦐", style: TextStyle(fontSize: 42)),
                ],
              ),
            ),

            // Categories Rail
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(loc.categories, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  _buildCategoryChip("all", "All Items", "அனைத்தும்", "🛍️"),
                  ...db.categories.map((c) => _buildCategoryChip(c.id, c.name, c.nameTa, c.icon)),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Products Grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(loc.featuredProducts, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF10243B))),
                  Text("${filteredProducts.length} items", style: const TextStyle(fontSize: 11, color: Color(0xFF168BFF), fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.72,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: filteredProducts.length,
              itemBuilder: (context, idx) {
                final p = filteredProducts[idx];
                return _buildProductCard(p, loc, db);
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String id, String name, String nameTa, String icon) {
    final isSelected = _selectedCatId == id;
    final isTa = LocalizationService.instance.isTamil;
    return GestureDetector(
      onTap: () => setState(() => _selectedCatId = id),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF168BFF) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? const Color(0xFF168BFF) : Colors.blueGrey.shade200),
          boxShadow: isSelected
              ? [BoxShadow(color: const Color(0xFF168BFF).withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 2))]
              : null,
        ),
        child: Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 6),
            Text(
              isTa ? nameTa : name,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : const Color(0xFF10243B),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductCard(BuyMeProduct p, LocalizationService loc, BuyMeDatabase db) {
    final inCart = db.cart.firstWhere((c) => c.product.id == p.id, orElse: () => BuyMeCartItem(product: p, quantity: 0));

    return GestureDetector(
      onTap: () => widget.onProductTap(p),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.blueGrey.shade100),
          boxShadow: [BoxShadow(color: const Color(0xFF10243B).withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image / Icon Top
            Container(
              height: 100,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFFEAF3FF),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Center(
                child: Text(p.icon, style: const TextStyle(fontSize: 48)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    loc.isTamil ? p.nameTa : p.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF10243B)),
                  ),
                  const SizedBox(height: 2),
                  Text(p.unit, style: const TextStyle(fontSize: 10, color: Color(0xFF62748A))),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "LKR ${p.price.toStringAsFixed(0)}",
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF168BFF)),
                      ),
                      if (inCart.quantity > 0)
                        Row(
                          children: [
                            GestureDetector(
                              onTap: () => setState(() => db.updateQuantity(p.id, -1)),
                              child: Container(
                                width: 22,
                                height: 22,
                                decoration: BoxDecoration(color: Colors.blueGrey.shade100, shape: BoxShape.circle),
                                child: const Icon(Icons.remove, size: 12),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                              child: Text("${inCart.quantity}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                            ),
                            GestureDetector(
                              onTap: () => setState(() => db.updateQuantity(p.id, 1)),
                              child: Container(
                                width: 22,
                                height: 22,
                                decoration: const BoxDecoration(color: Color(0xFF168BFF), shape: BoxShape.circle),
                                child: const Icon(Icons.add, size: 12, color: Colors.white),
                              ),
                            ),
                          ],
                        )
                      else
                        GestureDetector(
                          onTap: () => setState(() => db.addToCart(p)),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: const Color(0xFFEAF3FF), borderRadius: BorderRadius.circular(14)),
                            child: const Text("+ Add", style: TextStyle(color: Color(0xFF168BFF), fontWeight: FontWeight.bold, fontSize: 10)),
                          ),
                        ),
                    ],
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

