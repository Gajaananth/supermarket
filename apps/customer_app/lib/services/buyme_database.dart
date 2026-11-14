import 'package:flutter/material.dart';
import '../models/models.dart';

class BuyMeDatabase {
  static final BuyMeDatabase instance = BuyMeDatabase._internal();
  BuyMeDatabase._internal();

  // Selected Store (Defaults to Batticaloa Town)
  BuyMeStore selectedStore = const BuyMeStore(
    id: "br-btc-01",
    name: "BuyMe Batticaloa Town",
    code: "DMB-01",
    locality: "Batticaloa Town (Puliyanthivu)",
    address: "No. 45 Main Street, Puliyanthivu, Batticaloa",
    phone: "+94 65 222 4101",
    openingHours: "07:00 AM - 10:00 PM",
    deliveryRadiusKm: 10,
  );

  // 10 Batticaloa Stores
  final List<BuyMeStore> stores = const [
    BuyMeStore(
      id: "br-btc-01",
      name: "BuyMe Batticaloa Town",
      code: "DMB-01",
      locality: "Batticaloa Town (Puliyanthivu)",
      address: "No. 45 Main Street, Puliyanthivu, Batticaloa",
      phone: "+94 65 222 4101",
      openingHours: "07:00 AM - 10:00 PM",
      deliveryRadiusKm: 10,
    ),
    BuyMeStore(
      id: "br-btc-02",
      name: "BuyMe Kattankudy",
      code: "DMB-02",
      locality: "Kattankudy",
      address: "No. 128 Beach Road, Kattankudy-03, Batticaloa",
      phone: "+94 65 224 8202",
      openingHours: "07:00 AM - 10:30 PM",
      deliveryRadiusKm: 8,
    ),
    BuyMeStore(
      id: "br-btc-03",
      name: "BuyMe Eravur",
      code: "DMB-03",
      locality: "Eravur",
      address: "No. 84 Market Junction, Eravur-01, Batticaloa",
      phone: "+94 65 225 3303",
      openingHours: "07:00 AM - 10:00 PM",
      deliveryRadiusKm: 8,
    ),
    BuyMeStore(
      id: "br-btc-04",
      name: "BuyMe Valaichenai",
      code: "DMB-04",
      locality: "Valaichenai",
      address: "No. 19 Station Road, Valaichenai, Batticaloa",
      phone: "+94 65 225 7404",
      openingHours: "07:00 AM - 09:30 PM",
      deliveryRadiusKm: 9,
    ),
    BuyMeStore(
      id: "br-btc-05",
      name: "BuyMe Oddamavadi",
      code: "DMB-05",
      locality: "Oddamavadi",
      address: "No. 62 Bridge View Road, Oddamavadi, Batticaloa",
      phone: "+94 65 225 9505",
      openingHours: "07:00 AM - 10:00 PM",
      deliveryRadiusKm: 8,
    ),
    BuyMeStore(
      id: "br-btc-06",
      name: "BuyMe Chenkalady",
      code: "DMB-06",
      locality: "Chenkalady",
      address: "No. 33 Badulla Road Junction, Chenkalady, Batticaloa",
      phone: "+94 65 226 1606",
      openingHours: "07:00 AM - 09:30 PM",
      deliveryRadiusKm: 8,
    ),
    BuyMeStore(
      id: "br-btc-07",
      name: "BuyMe Kaluwanchikudy",
      code: "DMB-07",
      locality: "Kaluwanchikudy",
      address: "No. 112 Main Street, Kaluwanchikudy, Batticaloa",
      phone: "+94 65 227 2707",
      openingHours: "07:00 AM - 09:30 PM",
      deliveryRadiusKm: 9,
    ),
    BuyMeStore(
      id: "br-btc-08",
      name: "BuyMe Arayampathy",
      code: "DMB-08",
      locality: "Arayampathy",
      address: "No. 76 Temple Road, Arayampathy-02, Batticaloa",
      phone: "+94 65 228 3808",
      openingHours: "07:00 AM - 09:30 PM",
      deliveryRadiusKm: 7,
    ),
    BuyMeStore(
      id: "br-btc-09",
      name: "BuyMe Kiran",
      code: "DMB-09",
      locality: "Kiran",
      address: "No. 24 Coastal Highway, Kiran, Batticaloa",
      phone: "+94 65 229 4909",
      openingHours: "07:30 AM - 09:00 PM",
      deliveryRadiusKm: 7,
    ),
    BuyMeStore(
      id: "br-btc-10",
      name: "BuyMe Vellavely",
      code: "DMB-10",
      locality: "Vellavely",
      address: "No. 51 Agricultural Hub Road, Vellavely, Batticaloa",
      phone: "+94 65 230 5010",
      openingHours: "07:30 AM - 08:30 PM",
      deliveryRadiusKm: 10,
    ),
  ];

  // 10 Categories
  final List<BuyMeCategory> categories = const [
    BuyMeCategory(id: "cat-vegetables", name: "Fresh Vegetables", nameTa: "புதிய காய்கறிகள்", icon: "🥕", itemCount: 12),
    BuyMeCategory(id: "cat-fruits", name: "Fresh Fruits", nameTa: "புதிய பழங்கள்", icon: "🍌", itemCount: 8),
    BuyMeCategory(id: "cat-staples", name: "Rice & Grains", nameTa: "அரிசி மற்றும் தானியங்கள்", icon: "🌾", itemCount: 10),
    BuyMeCategory(id: "cat-dairy", name: "Dairy & Eggs", nameTa: "பால் மற்றும் முட்டை", icon: "🥛", itemCount: 8),
    BuyMeCategory(id: "cat-cooking", name: "Spices & Oils", nameTa: "சமையல் பொருட்கள்", icon: "🥥", itemCount: 14),
    BuyMeCategory(id: "cat-seafood", name: "Lagoon Catch", nameTa: "மீன் & கடல் உணவு", icon: "🐟", itemCount: 6),
    BuyMeCategory(id: "cat-beverages", name: "Tea & Drinks", nameTa: "தேயிலை மற்றும் பானங்கள்", icon: "☕", itemCount: 9),
    BuyMeCategory(id: "cat-snacks", name: "Biscuits & Snacks", nameTa: "பிஸ்கட் & தின்பண்டங்கள்", icon: "🍪", itemCount: 11),
    BuyMeCategory(id: "cat-household", name: "Household Care", nameTa: "வீட்டு பராமரிப்பு", icon: "🧼", itemCount: 8),
    BuyMeCategory(id: "cat-personal", name: "Personal Care", nameTa: "தனிநபர் சுகாதாரம்", icon: "🧴", itemCount: 7),
  ];

  // 35 Products
  final List<BuyMeProduct> products = const [
    BuyMeProduct(
      id: "prod-001",
      name: "Eastern Star Batticaloa Red Raw Rice",
      nameTa: "மட்டக்களப்பு சிவப்பு பச்சை அரிசி",
      brand: "Eastern Star",
      categoryId: "cat-staples",
      unit: "5 kg bag",
      price: 1250,
      originalPrice: 1400,
      discountPercent: 10,
      isFeatured: true,
      isOffer: true,
      stock: 185,
      description: "Traditional high-fiber red raw rice harvested from Batticaloa paddy plains.",
      descriptionTa: "மட்டக்களப்பின் செழிப்பான வயல்வெளிகளில் இருந்து நேரடியாக அறுவடை செய்யப்பட்ட சிவப்பு பச்சை அரிசி.",
      img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
      icon: "🌾",
    ),
    BuyMeProduct(
      id: "prod-002",
      name: "Araliya Keeri Samba Premium Rice",
      nameTa: "அரலியா கீரி சம்பா அரிசி",
      brand: "Araliya",
      categoryId: "cat-staples",
      unit: "5 kg pack",
      price: 1450,
      originalPrice: 1550,
      discountPercent: 6,
      isFeatured: true,
      stock: 240,
      description: "Fragrant pearl-grained Keeri Samba rice for family feasts.",
      descriptionTa: "விருந்து உபசரிப்புக்கு ஏற்ற வாசனை கீரி சம்பா அரிசி.",
      img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
      icon: "🌾",
    ),
    BuyMeProduct(
      id: "prod-005",
      name: "Fresh Batticaloa Lagoon Prawns (Jumbo)",
      nameTa: "மட்டக்களப்பு வாவி இறால் (சுத்தம் செய்யப்பட்டது)",
      brand: "BuyMe Lagoon Catch",
      categoryId: "cat-seafood",
      unit: "500 g pack",
      price: 1850,
      originalPrice: 2100,
      discountPercent: 12,
      isFeatured: true,
      isOffer: true,
      stock: 45,
      description: "World-famous sweet Batticaloa lagoon jumbo prawns, deveined and cold-chain packed.",
      descriptionTa: "மட்டக்களப்பு வாவியின் சுவையான பிரசித்தி பெற்ற பெரிய இறால்.",
      img: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=400&q=80",
      icon: "🦐",
    ),
    BuyMeProduct(
      id: "prod-006",
      name: "Fresh Coastal Seer Fish Slices (Thora)",
      nameTa: "கடல் தோரா மீன் துண்டுகள்",
      brand: "BuyMe Ocean Catch",
      categoryId: "cat-seafood",
      unit: "500 g pack",
      price: 2200,
      originalPrice: 2400,
      discountPercent: 8,
      isFeatured: true,
      stock: 35,
      description: "Prime fresh seer fish cuts from Pasikudah and Batticaloa coast.",
      descriptionTa: "பாசிக்குடா மற்றும் மட்டக்களப்பு கடற்பரப்பில் பிடிக்கப்பட்ட தரமான தோரா மீன் துண்டுகள்.",
      img: "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=400&q=80",
      icon: "🐟",
    ),
    BuyMeProduct(
      id: "prod-007",
      name: "Ambewela Farm Fresh Full Cream Milk",
      nameTa: "அம்பேவெல பசுப்பால்",
      brand: "Ambewela",
      categoryId: "cat-dairy",
      unit: "1 Liter bottle",
      price: 540,
      stock: 190,
      description: "Pure pasteurized fresh cow's milk from Ambewela highland farms.",
      descriptionTa: "அம்பேவெல பண்ணையிலிருந்து நேரடியாக பெறப்படும் தூய பசும்பால்.",
      img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
      icon: "🥛",
    ),
    BuyMeProduct(
      id: "prod-008",
      name: "Highland Pure Buffalo Curd Pot",
      nameTa: "ஹைலண்ட் எருமை தயிர் சட்டி",
      brand: "Highland",
      categoryId: "cat-dairy",
      unit: "1 Liter clay pot",
      price: 680,
      stock: 70,
      description: "Authentic thick natural buffalo curd in a traditional clay pot.",
      descriptionTa: "பாரம்பரிய களிமண் சட்டியில் தயாரிக்கப்பட்ட கெட்டியான எருமைப்பால் தயிர்.",
      img: "https://images.unsplash.com/photo-1588710929895-67ff7e4a11f2?auto=format&fit=crop&w=400&q=80",
      icon: "🏺",
    ),
    BuyMeProduct(
      id: "prod-009",
      name: "Farm Fresh Grade A Brown Eggs",
      nameTa: "பண்ணை பிரெஷ் நாட்டு முட்டை",
      brand: "BuyMe Farm Select",
      categoryId: "cat-dairy",
      unit: "Pack of 10",
      price: 520,
      stock: 210,
      description: "Nutrient-rich, sanitized and quality-graded brown eggs.",
      descriptionTa: "தரமான பண்ணைகளில் இருந்து பெறப்பட்ட தரம்பிரிக்கப்பட்ட நாட்டு முட்டைகள்.",
      img: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80",
      icon: "🥚",
    ),
    BuyMeProduct(
      id: "prod-011",
      name: "Nuwara Eliya Crisp Fresh Carrots",
      nameTa: "நுவரெலியா பிரெஷ் கேரட்",
      brand: "BuyMe Highlands",
      categoryId: "cat-vegetables",
      unit: "500 g bunch",
      price: 280,
      originalPrice: 320,
      discountPercent: 12,
      isOffer: true,
      stock: 130,
      description: "Crunchy high-altitude carrots directly from up-country farms.",
      descriptionTa: "மலைநாட்டு பண்ணைகளில் இருந்து நேரடியாக கொண்டுவரப்படும் புதிய கேரட்.",
      img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=400&q=80",
      icon: "🥕",
    ),
    BuyMeProduct(
      id: "prod-012",
      name: "Local Jaffna & Eastern Red Shallots",
      nameTa: "யாழ்ப்பாணம் சிவப்பு சின்ன வெங்காயம்",
      brand: "BuyMe Fresh",
      categoryId: "cat-vegetables",
      unit: "500 g pack",
      price: 380,
      stock: 150,
      description: "Intensely flavorful red onions essential for authentic Eastern curries.",
      descriptionTa: "கிழக்கு மற்றும் யாழ்ப்பாண சமையலின் பாரம்பரிய சுவைக்கு அவசியமான சின்ன வெங்காயம்.",
      img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80",
      icon: "🧅",
    ),
    BuyMeProduct(
      id: "prod-018",
      name: "Fresh Green Coconuts (Pol / Husked)",
      nameTa: "தேங்காய் (சமையல்)",
      brand: "BuyMe Local",
      categoryId: "cat-cooking",
      unit: "1 whole husked coconut",
      price: 140,
      stock: 350,
      description: "Fresh mature coconut with thick milk-rich flesh.",
      descriptionTa: "தினசரி சமையல் மற்றும் பால் பிழியலுக்கு ஏற்ற தரமான தேங்காய்.",
      img: "https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=400&q=80",
      icon: "🥥",
    ),
    BuyMeProduct(
      id: "prod-019",
      name: "Baraka Pure Coconut Oil Bottle",
      nameTa: "பராக்கா தூய தேங்காய் எண்ணெய்",
      brand: "Baraka",
      categoryId: "cat-cooking",
      unit: "750 ml bottle",
      price: 890,
      stock: 110,
      description: "100% pure expelled coconut oil for cooking and hair care.",
      descriptionTa: "100% தூய தேங்காய் எண்ணெய், சமையல் பயன்பாட்டிற்கு சிறந்தது.",
      img: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80",
      icon: "🥥",
    ),
    BuyMeProduct(
      id: "prod-020",
      name: "Eastern Roasted Curry Powder (Thool)",
      nameTa: "கிழக்கு வறுத்த கறித்தூள்",
      brand: "BuyMe Heritage",
      categoryId: "cat-cooking",
      unit: "250 g pouch",
      price: 380,
      originalPrice: 420,
      discountPercent: 9,
      isFeatured: true,
      stock: 140,
      description: "Authentic Batticaloa roasted spice blend with coriander, cumin, and curry leaves.",
      descriptionTa: "மட்டக்களப்பின் பாரம்பரிய கைமணத்துடன் வறுத்து அரைக்கப்பட்ட வாசனை கறித்தூள்.",
      img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
      icon: "🥘",
    ),
    BuyMeProduct(
      id: "prod-022",
      name: "Dilmah Premium Ceylon Single Origin Tea",
      nameTa: "டில்மா சிலோன் தேயிலை",
      brand: "Dilmah",
      categoryId: "cat-beverages",
      unit: "400 g pouch",
      price: 1150,
      stock: 175,
      description: "Finest single-origin pure Ceylon black tea.",
      descriptionTa: "மத்திய மலைநாட்டில் கைப்பட பறிக்கப்பட்ட தூய சிலோன் கறுப்பு தேயிலை.",
      img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80",
      icon: "☕",
    ),
    BuyMeProduct(
      id: "prod-025",
      name: "Munchee Super Cream Cracker",
      nameTa: "மஞ்சி சுப்பர் கிரீம் கிராக்கர்",
      brand: "Munchee",
      categoryId: "cat-snacks",
      unit: "500 g pack",
      price: 420,
      originalPrice: 460,
      discountPercent: 8,
      isFeatured: true,
      stock: 260,
      description: "Sri Lanka's favorite crispy, flaky cream cracker.",
      descriptionTa: "இலங்கையின் விருப்பமான மொறுமொறுப்பான கிரீம் கிராக்கர் பிஸ்கட்.",
      img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80",
      icon: "🍪",
    ),
    BuyMeProduct(
      id: "prod-027",
      name: "Traditional Batticaloa Spicy Murukku",
      nameTa: "மட்டக்களப்பு கார முறுக்கு",
      brand: "BuyMe Heritage",
      categoryId: "cat-snacks",
      unit: "300 g pack",
      price: 340,
      stock: 115,
      description: "Crunchy handcrafted Eastern savory murukku with cumin and sesame.",
      descriptionTa: "சீரகம் மற்றும் எள் மணத்துடன் தயாரிக்கப்பட்ட காரமான கைமுறுக்கு.",
      img: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80",
      icon: "🥨",
    ),
    BuyMeProduct(
      id: "prod-035",
      name: "Dry Sprats (Cleaned Nethili Karuvadu)",
      nameTa: "சுத்தம் செய்யப்பட்ட நெத்திலி கருவாடு",
      brand: "BuyMe Ocean Harvest",
      categoryId: "cat-seafood",
      unit: "250 g pack",
      price: 620,
      stock: 90,
      description: "Sun-dried headless cleaned sprats.",
      descriptionTa: "சூரிய ஒளியில் உலர்த்தப்பட்டு தலை நீக்கப்பட்ட சுவையான நெத்திலி கருவாடு.",
      img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80",
      icon: "🐟",
    ),
  ];

  // Active User Cart
  final List<BuyMeCartItem> cart = [];
  final ValueNotifier<int> cartItemCountNotifier = ValueNotifier<int>(0);

  void addToCart(BuyMeProduct product) {
    final idx = cart.indexWhere((c) => c.product.id == product.id);
    if (idx >= 0) {
      cart[idx].quantity++;
    } else {
      cart.add(BuyMeCartItem(product: product, quantity: 1));
    }
    _notifyCart();
  }

  void updateQuantity(String productId, int delta) {
    final idx = cart.indexWhere((c) => c.product.id == productId);
    if (idx >= 0) {
      cart[idx].quantity += delta;
      if (cart[idx].quantity <= 0) {
        cart.removeAt(idx);
      }
      _notifyCart();
    }
  }

  void _notifyCart() {
    cartItemCountNotifier.value = cart.fold(0, (sum, item) => sum + item.quantity);
  }

  double get cartSubtotal => cart.fold(0.0, (sum, i) => sum + i.subtotal);
  double get cartDeliveryFee => selectedStore.deliveryFeeLkr;
  double get cartGrandTotal => cartSubtotal + (cart.isEmpty ? 0 : cartDeliveryFee);

  // Active Orders Log
  final List<BuyMeOrder> orders = [
    BuyMeOrder(
      id: "ORD-2026-901",
      customerName: "Kajan Sivanesan",
      customerPhone: "+94 77 123 4567",
      deliveryAddress: "No. 18 Central Road, Puliyanthivu, Batticaloa",
      storeId: "br-btc-01",
      storeName: "BuyMe Batticaloa Town",
      items: [],
      itemsTotal: 4940,
      deliveryFee: 250,
      totalAmount: 5190,
      status: BuyMeOrderStatus.outForDelivery,
      riderName: "Kajan Sivanesan (EP BDF-4821)",
      riderPhone: "+94 77 345 6789",
      createdAt: DateTime.now().subtract(const Duration(minutes: 25)),
      estimatedDelivery: "14 mins",
    ),
    BuyMeOrder(
      id: "ORD-2026-902",
      customerName: "Mohamed Rizwan",
      customerPhone: "+94 76 345 6789",
      deliveryAddress: "No. 105 Beach Road, Kattankudy-02, Batticaloa",
      storeId: "br-btc-02",
      storeName: "BuyMe Kattankudy",
      items: [],
      itemsTotal: 2860,
      deliveryFee: 250,
      totalAmount: 3110,
      status: BuyMeOrderStatus.preparing,
      createdAt: DateTime.now().subtract(const Duration(minutes: 15)),
      estimatedDelivery: "28 mins",
    ),
  ];

  void placeSimulatedOrder({
    required String address,
    required String phone,
    required String customerName,
  }) {
    final order = BuyMeOrder(
      id: "ORD-2026-${orders.length + 903}",
      customerName: customerName,
      customerPhone: phone,
      deliveryAddress: address,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      items: List.from(cart),
      itemsTotal: cartSubtotal,
      deliveryFee: cartDeliveryFee,
      totalAmount: cartGrandTotal,
      status: BuyMeOrderStatus.confirmed,
      riderName: "Kamal Perera (Assigned)",
      riderPhone: "+94 77 345 6789",
      createdAt: DateTime.now(),
      estimatedDelivery: "25-35 mins",
    );
    orders.insert(0, order);
    cart.clear();
    _notifyCart();
  }
}

