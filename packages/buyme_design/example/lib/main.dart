import 'package:flutter/material.dart';
import 'package:buyme_design/buyme_design.dart';
import 'package:lucide_icons/lucide_icons.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BuyMeDesignPreviewApp());
}

class BuyMeDesignPreviewApp extends StatelessWidget {
  const BuyMeDesignPreviewApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BuyMe Design System Showcase',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: AppColors.iceWhite,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.neonBlue,
          primary: AppColors.neonBlue,
          surface: AppColors.iceWhite,
        ),
        useMaterial3: true,
      ),
      home: const DesignPreviewHome(),
    );
  }
}

class DesignPreviewHome extends StatefulWidget {
  const DesignPreviewHome({super.key});

  @override
  State<DesignPreviewHome> createState() => _DesignPreviewHomeState();
}

class _DesignPreviewHomeState extends State<DesignPreviewHome> {
  int _currentNavIndex = 0;
  int _demoQuantity1 = 1;
  int _demoQuantity2 = 0;
  int _selectedCategoryIndex = 0;
  final TextEditingController _searchCtrl = TextEditingController();
  final TextEditingController _inputCtrl = TextEditingController(text: "Kallady Beach Road, Batticaloa");

  @override
  void dispose() {
    _searchCtrl.dispose();
    _inputCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GlassScaffold(
      appBar: GlassAppBar(
        titleText: "BuyMe Design System",
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bell, color: AppColors.darkNavy, size: 20),
            onPressed: () {
              BuyMeToast.show(
                context,
                message: "Notifications",
                subtitle: "You have 3 active delivery updates in Batticaloa.",
                type: ToastType.info,
              );
            },
          ),
          IconButton(
            icon: const Icon(LucideIcons.sparkles, color: AppColors.neonBlue, size: 20),
            onPressed: () {
              BuyMeToast.show(
                context,
                message: "Neon Ice Glass Token Active",
                subtitle: "BackdropFilter sigma 20 with 72% white fill & 1px border",
                type: ToastType.success,
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      bottomNavigationBar: GlassBottomNav(
        currentIndex: _currentNavIndex,
        onTap: (i) => setState(() => _currentNavIndex = i),
        items: const [
          GlassNavItem(icon: LucideIcons.layoutGrid, label: "All Tokens"),
          GlassNavItem(icon: LucideIcons.layers, label: "Surfaces"),
          GlassNavItem(icon: LucideIcons.shoppingBag, label: "Products"),
          GlassNavItem(icon: LucideIcons.barChart3, label: "Stats"),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 110),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Banner with Logo & Batticaloa District Badge
            _buildHeroBanner(),
            const SizedBox(height: 24),

            // SECTION 1: Brand & Logos
            _buildSectionHeader("01. Brand & Wordmarks", "CustomPainter vector logos and badges"),
            const SizedBox(height: 12),
            _buildLogosRow(),
            const SizedBox(height: 24),

            // SECTION 2: Typography & High-Contrast Colors
            _buildSectionHeader("02. Typography & Palette", "Manrope headings, DM Sans body & Noto Sans Tamil"),
            const SizedBox(height: 12),
            _buildTypographySection(),
            const SizedBox(height: 14),
            _buildPaletteSection(),
            const SizedBox(height: 24),

            // SECTION 3: Frosted Glass Surfaces & Modals
            _buildSectionHeader("03. Glass Surfaces & Aurora", "BackdropFilter (sigma 20) over radial orbs"),
            const SizedBox(height: 12),
            _buildGlassCardsSection(),
            const SizedBox(height: 24),

            // SECTION 4: Buttons & Interactive Inputs
            _buildSectionHeader("04. Interactive Controls", "Animated press-scale buttons & inputs"),
            const SizedBox(height: 12),
            _buildControlsSection(),
            const SizedBox(height: 24),

            // SECTION 5: Product & Category Cards
            _buildSectionHeader("05. Supermarket Cards", "Product cards with LKR currency & category pills"),
            const SizedBox(height: 12),
            _buildCardsSection(),
            const SizedBox(height: 24),

            // SECTION 6: Status Badges & Metrics
            _buildSectionHeader("06. Status Badges & KPI Stats", "Order progress tags and live stat metrics"),
            const SizedBox(height: 12),
            _buildBadgesAndStatsSection(),
            const SizedBox(height: 24),

            // SECTION 7: Order Timeline & Feedback
            _buildSectionHeader("07. Stepper Timeline & Feedback", "Live delivery tracking, skeletons and toasts"),
            const SizedBox(height: 12),
            _buildTimelineAndFeedbackSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 4,
              height: 18,
              decoration: BoxDecoration(
                color: AppColors.neonBlue,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              title,
              style: AppTypography.h3.copyWith(
                fontSize: 17,
                color: AppColors.darkNavy,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Padding(
          padding: const EdgeInsets.only(left: 12),
          child: Text(
            subtitle,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.secondaryText,
              fontSize: 12,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeroBanner() {
    return GlassCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const BuyMeLogo(size: 38, subtitle: "Batticaloa"),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.neonBlue.withOpacity(0.12),
                  borderRadius: AppRadii.borderFull,
                  border: Border.all(color: AppColors.borderNeon, width: 1),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(LucideIcons.mapPin, size: 12, color: AppColors.neonBlue),
                    const SizedBox(width: 4),
                    Text(
                      "10 Stores",
                      style: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.w800,
                        color: AppColors.neonBlue,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            "Neon Ice Glass Design System",
            style: AppTypography.h2.copyWith(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppColors.darkNavy,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "Shared across Flutter mobile apps and web dashboard. 100% token synchronization from tokens.json.",
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.secondaryText,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogosRow() {
    return Row(
      children: [
        Expanded(
          child: GlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const BuyMeLogo(size: 32, subtitle: "Customer"),
                const SizedBox(height: 8),
                Text("Full Logo", style: AppTypography.caption),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const BuyMeLogo.iconOnly(size: 36),
                const SizedBox(height: 8),
                Text("App Icon", style: AppTypography.caption),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GlassCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const BuyMeLogo.wordmark(size: 26, subtitle: "Express"),
                const SizedBox(height: 8),
                Text("Wordmark", style: AppTypography.caption),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTypographySection() {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Heading H1 — Manrope 800", style: AppTypography.h1.copyWith(fontSize: 22)),
          const SizedBox(height: 4),
          Text("Heading H2 — Manrope 800", style: AppTypography.h2.copyWith(fontSize: 18)),
          const SizedBox(height: 4),
          Text("Heading H3 — Manrope 700", style: AppTypography.h3.copyWith(fontSize: 15)),
          const SizedBox(height: 8),
          const Divider(color: AppColors.borderCard, height: 1),
          const SizedBox(height: 8),
          Text(
            "Body Regular — DM Sans 500: Fresh grocery delivered within 30 minutes in Batticaloa Town, Kattankudy, Eravur, and Valaichenai.",
            style: AppTypography.bodyMedium.copyWith(color: AppColors.bodyText),
          ),
          const SizedBox(height: 6),
          Text(
            "தமிழ் எழுத்துரு — Noto Sans Tamil: மட்டக்களப்பு மாவட்டத்திற்கான பிரீமியம் சூப்பர் மார்க்கெட் விநியோகம்.",
            style: AppTypography.tamilBody(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.darkNavy,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text("LKR 1,850.00", style: AppTypography.priceLarge.copyWith(fontSize: 20)),
              const SizedBox(width: 12),
              Text("LKR 2,200.00", style: AppTypography.priceMedium.copyWith(
                fontSize: 14,
                color: AppColors.mutedText,
                decoration: TextDecoration.lineThrough,
              )),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaletteSection() {
    final chips = [
      {"name": "Neon Blue", "hex": "#168BFF", "color": AppColors.neonBlue, "textDark": false},
      {"name": "Deep Blue", "hex": "#0866CC", "color": AppColors.deepBlue, "textDark": false},
      {"name": "Dark Navy", "hex": "#10243B", "color": AppColors.darkNavy, "textDark": false},
      {"name": "Ice White", "hex": "#F7FAFF", "color": AppColors.iceWhite, "textDark": true},
      {"name": "Soft Blue", "hex": "#EAF3FF", "color": AppColors.softBlue, "textDark": true},
      {"name": "Success", "hex": "#10B981", "color": AppColors.success, "textDark": false},
      {"name": "Warning", "hex": "#F59E0B", "color": AppColors.warning, "textDark": false},
      {"name": "Error", "hex": "#EF4444", "color": AppColors.error, "textDark": false},
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: chips.map((c) {
        final color = c["color"] as Color;
        final isDarkText = c["textDark"] as bool;
        return Container(
          width: 78,
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
          decoration: BoxDecoration(
            color: color,
            borderRadius: AppRadii.borderMd,
            border: Border.all(color: Colors.black.withOpacity(0.08)),
            boxShadow: const [
              BoxShadow(color: Color(0x10000000), blurRadius: 4, offset: Offset(0, 2)),
            ],
          ),
          child: Column(
            children: [
              Text(
                c["name"] as String,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: isDarkText ? AppColors.darkNavy : Colors.white,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                c["hex"] as String,
                style: TextStyle(
                  fontSize: 8.5,
                  fontWeight: FontWeight.w600,
                  color: isDarkText ? AppColors.secondaryText : Colors.white70,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildGlassCardsSection() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: GlassCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(LucideIcons.box, color: AppColors.neonBlue, size: 22),
                    const SizedBox(height: 8),
                    Text("Standard Glass", style: AppTypography.h4.copyWith(fontSize: 14)),
                    const SizedBox(height: 2),
                    Text("68% Fill, Sigma 20 blur", style: AppTypography.caption),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: GlassCard(
                isElevated: true,
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(LucideIcons.shieldCheck, color: AppColors.deepBlue, size: 22),
                    const SizedBox(height: 8),
                    Text("Elevated Glass", style: AppTypography.h4.copyWith(fontSize: 14)),
                    const SizedBox(height: 2),
                    Text("82% Fill, 48px shadow", style: AppTypography.caption),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: SecondaryButton(
                text: "Open Glass Sheet",
                icon: const Icon(LucideIcons.chevronsUp, size: 16, color: AppColors.darkNavy),
                onPressed: () {
                  GlassSheet.show(
                    context: context,
                    builder: (sheetCtx) => Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("BuyMe Delivery Hubs", style: AppTypography.h3),
                        const SizedBox(height: 8),
                        Text("Select nearest store in Batticaloa District:", style: AppTypography.bodySmall),
                        const SizedBox(height: 12),
                        const StatusBadge(status: BuyMeOrderStatus.ready, customLabel: "BuyMe Batticaloa Town — Central Hub"),
                        const SizedBox(height: 8),
                        const StatusBadge(status: BuyMeOrderStatus.ready, customLabel: "BuyMe Kattankudy — Active"),
                        const SizedBox(height: 8),
                        const StatusBadge(status: BuyMeOrderStatus.ready, customLabel: "BuyMe Eravur — Active"),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SecondaryButton(
                text: "Open Glass Dialog",
                icon: const Icon(LucideIcons.externalLink, size: 16, color: AppColors.darkNavy),
                onPressed: () {
                  GlassDialog.show(
                    context: context,
                    builder: (dialogCtx) => Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Confirm Order", style: AppTypography.h3),
                        const SizedBox(height: 8),
                        Text(
                          "Place immediate express delivery for BuyMe Batticaloa Town?",
                          style: AppTypography.bodyMedium,
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            TextButton(
                              onPressed: () => Navigator.pop(dialogCtx),
                              child: const Text("Cancel"),
                            ),
                            const SizedBox(width: 8),
                            PrimaryButton(
                              text: "Confirm",
                              width: 110,
                              height: 40,
                              onPressed: () {
                                Navigator.pop(dialogCtx);
                                BuyMeToast.show(
                                  context,
                                  message: "Order #ORD-7742 Confirmed!",
                                  subtitle: "Dispatching to Kallady Beach Road.",
                                  type: ToastType.success,
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildControlsSection() {
    return Column(
      children: [
        SearchBarWidget(
          controller: _searchCtrl,
          hintText: "Search 500+ fresh items in Batticaloa...",
          onFilterTap: () {
            BuyMeToast.show(context, message: "Filters clicked", type: ToastType.info);
          },
        ),
        const SizedBox(height: 12),
        BuyMeTextField(
          label: "Delivery Address (Batticaloa)",
          controller: _inputCtrl,
          prefixIcon: const Icon(LucideIcons.mapPin, size: 18, color: AppColors.neonBlue),
          suffixIcon: const Icon(LucideIcons.checkCircle, size: 18, color: AppColors.success),
          helperText: "Serving 10 proposed hubs in Batticaloa District.",
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: PrimaryButton(
                text: "Primary Action",
                icon: const Icon(LucideIcons.shoppingBag, size: 18, color: Colors.white),
                onPressed: () {
                  BuyMeToast.show(
                    context,
                    message: "Item Added to Cart",
                    subtitle: "LKR 450.00 added to your order",
                    type: ToastType.success,
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: SecondaryButton(
                text: "Secondary Action",
                icon: const Icon(LucideIcons.bookmark, size: 16, color: AppColors.darkNavy),
                onPressed: () {
                  BuyMeToast.show(
                    context,
                    message: "Saved for Later",
                    type: ToastType.info,
                  );
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCardsSection() {
    final categories = [
      {"id": "c1", "title": "Fresh Fruits", "titleTa": "பழங்கள்", "icon": LucideIcons.apple, "count": 48},
      {"id": "c2", "title": "Vegetables", "titleTa": "காய்கறிகள்", "icon": LucideIcons.carrot, "count": 64},
      {"id": "c3", "title": "Dairy & Milk", "titleTa": "பால் பொருட்கள்", "icon": LucideIcons.milk, "count": 32},
      {"id": "c4", "title": "Lagoon Seafood", "titleTa": "கடல் உணவு", "icon": LucideIcons.fish, "count": 22},
    ];

    return Column(
      children: [
        // Category Cards Grid
        SizedBox(
          height: 140,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final cat = categories[index];
              return SizedBox(
                width: 110,
                child: CategoryCard(
                  id: cat["id"] as String,
                  title: cat["title"] as String,
                  titleTa: cat["titleTa"] as String,
                  icon: cat["icon"] as IconData,
                  itemCount: cat["count"] as int,
                  isSelected: _selectedCategoryIndex == index,
                  onTap: () => setState(() => _selectedCategoryIndex = index),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),

        // Product Cards Grid
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ProductCard(
                id: "p1",
                name: "Fresh Red Tomatoes",
                nameTa: "நாட்டுத் தக்காளி",
                unit: "1 kg",
                price: 380.0,
                originalPrice: 450.0,
                discountPercent: 15,
                quantityInCart: _demoQuantity1,
                onAdd: () => setState(() => _demoQuantity1 = 1),
                onIncrement: () => setState(() => _demoQuantity1++),
                onDecrement: () => setState(() => _demoQuantity1 = (_demoQuantity1 > 0 ? _demoQuantity1 - 1 : 0)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ProductCard(
                id: "p2",
                name: "Anchor Full Cream Milk",
                nameTa: "பால் மா",
                unit: "400 g",
                price: 1150.0,
                discountPercent: 0,
                quantityInCart: _demoQuantity2,
                onAdd: () => setState(() => _demoQuantity2 = 1),
                onIncrement: () => setState(() => _demoQuantity2++),
                onDecrement: () => setState(() => _demoQuantity2 = (_demoQuantity2 > 0 ? _demoQuantity2 - 1 : 0)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildBadgesAndStatsSection() {
    return Column(
      children: [
        // Status Badges Row
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: const [
            StatusBadge(status: BuyMeOrderStatus.pending),
            StatusBadge(status: BuyMeOrderStatus.confirmed),
            StatusBadge(status: BuyMeOrderStatus.preparing),
            StatusBadge(status: BuyMeOrderStatus.outForDelivery),
            StatusBadge(status: BuyMeOrderStatus.delivered),
            StatusBadge(status: BuyMeOrderStatus.cancelled),
          ],
        ),
        const SizedBox(height: 16),

        // KPI Stat Cards
        Row(
          children: const [
            Expanded(
              child: StatCard(
                title: "Daily Revenue",
                value: "LKR 148.5K",
                icon: LucideIcons.banknote,
                trendText: "+18.2%",
                isPositiveTrend: true,
                subtitle: "Batticaloa Stores",
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: StatCard(
                title: "Active Orders",
                value: "42 Orders",
                icon: LucideIcons.truck,
                trendText: "32 mins avg",
                isPositiveTrend: true,
                subtitle: "98.4% On Time",
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTimelineAndFeedbackSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GlassCard(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Live Order Tracking", style: AppTypography.h4),
                  const StatusBadge(status: BuyMeOrderStatus.outForDelivery, isCompact: true),
                ],
              ),
              const SizedBox(height: 14),
              const StepperTimeline(
                steps: [
                  TimelineStepItem(
                    title: "Order Placed & Confirmed",
                    titleTa: "ஆர்டர் உறுதிப்படுத்தப்பட்டது",
                    subtitle: "BuyMe Batticaloa Town Hub",
                    time: "10:15 AM",
                    state: BuyMeStepState.completed,
                  ),
                  TimelineStepItem(
                    title: "Packed & Quality Checked",
                    titleTa: "பொதி செய்யப்பட்டது",
                    subtitle: "All 6 items verified in stock",
                    time: "10:28 AM",
                    state: BuyMeStepState.completed,
                  ),
                  TimelineStepItem(
                    title: "Rider Out For Delivery",
                    titleTa: "விநியோகஸ்தர் புறப்பட்டார்",
                    subtitle: "Rider Suresh assigned (Hero Honda WP-8821)",
                    time: "10:35 AM",
                    state: BuyMeStepState.active,
                  ),
                  TimelineStepItem(
                    title: "Delivered to Customer",
                    titleTa: "வழங்கப்படும்",
                    subtitle: "Estimated arrival at Kallady in 12 mins",
                    time: "10:47 AM",
                    state: BuyMeStepState.pending,
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Skeleton Shimmer Preview
        GlassCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Skeleton Loading Wave", style: AppTypography.h4.copyWith(fontSize: 14)),
              const SizedBox(height: 12),
              Row(
                children: [
                  SkeletonLoader.circle(size: 44),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SkeletonLoader.text(height: 14, width: 140),
                        const SizedBox(height: 6),
                        SkeletonLoader.text(height: 10, width: 200),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
