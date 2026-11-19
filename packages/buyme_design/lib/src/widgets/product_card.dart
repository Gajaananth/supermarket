import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_radii.dart';
import '../tokens/app_shadows.dart';
import '../tokens/app_typography.dart';

/// BuyMe Product Card with Image Fallback, Bilingual Typography, and Quantity Stepper
class ProductCard extends StatelessWidget {
  final String id;
  final String name;
  final String? nameTa;
  final String unit;
  final double price;
  final double? originalPrice;
  final int discountPercent;
  final String? imageUrl;
  final int quantityInCart;
  final VoidCallback onAdd;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;
  final VoidCallback? onTap;
  final bool inStock;

  const ProductCard({
    super.key,
    required this.id,
    required this.name,
    this.nameTa,
    required this.unit,
    required this.price,
    this.originalPrice,
    this.discountPercent = 0,
    this.imageUrl,
    this.quantityInCart = 0,
    required this.onAdd,
    required this.onIncrement,
    required this.onDecrement,
    this.onTap,
    this.inStock = true,
  });

  String _formatLKR(double amount) {
    return "LKR ${amount.toStringAsFixed(2).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}";
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        borderRadius: AppRadii.border2Xl,
        boxShadow: AppShadows.card,
      ),
      child: ClipRRect(
        borderRadius: AppRadii.border2Xl,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.glassFillElevated,
              borderRadius: AppRadii.border2Xl,
              border: Border.all(color: AppColors.glassBorder, width: 1.0),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Image Thumbnail with Discount Badge
                GestureDetector(
                  onTap: onTap,
                  child: Stack(
                    children: [
                      Container(
                        height: 120,
                        width: double.infinity,
                        decoration: const BoxDecoration(
                          color: Color(0xFFF1F5FD),
                          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                        ),
                        child: imageUrl != null && imageUrl!.startsWith("http")
                            ? Image.network(
                                imageUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (ctx, err, stack) => _buildImageFallback(),
                              )
                            : (imageUrl != null && imageUrl!.isNotEmpty
                                ? Image.asset(
                                    imageUrl!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (ctx, err, stack) => _buildImageFallback(),
                                  )
                                : _buildImageFallback()),
                      ),
                      if (discountPercent > 0)
                        Positioned(
                          top: 8,
                          left: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.neonBlue,
                              borderRadius: AppRadii.borderFull,
                              boxShadow: const [
                                BoxShadow(color: Color(0x33168BFF), blurRadius: 6, offset: Offset(0, 2)),
                              ],
                            ),
                            child: Text(
                              "$discountPercent% OFF",
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                // 2. Opaque Content Box for Maximum Contrast
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: 'Manrope',
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: AppColors.darkNavy,
                          ),
                        ),
                        if (nameTa != null && nameTa!.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            nameTa!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.tamilBody(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ],
                        const SizedBox(height: 4),
                        Text(
                          unit,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.mutedText,
                          ),
                        ),
                        const Spacer(),

                        // 3. Price & Action Row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _formatLKR(price),
                                  style: const TextStyle(
                                    fontFamily: 'Manrope',
                                    fontSize: 13,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.neonBlue,
                                  ),
                                ),
                                if (originalPrice != null && originalPrice! > price)
                                  Text(
                                    _formatLKR(originalPrice!),
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.subtleText,
                                      decoration: TextDecoration.lineThrough,
                                    ),
                                  ),
                              ],
                            ),

                            // Stepper or Add button
                            quantityInCart > 0
                                ? Container(
                                    decoration: BoxDecoration(
                                      color: AppColors.softBlue,
                                      borderRadius: AppRadii.borderFull,
                                      border: Border.all(color: AppColors.neonBlue.withAlpha(50)),
                                    ),
                                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        GestureDetector(
                                          onTap: onDecrement,
                                          child: Container(
                                            width: 22,
                                            height: 22,
                                            decoration: const BoxDecoration(
                                              color: Colors.white,
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(LucideIcons.minus, size: 12, color: AppColors.neonBlue),
                                          ),
                                        ),
                                        Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 6),
                                          child: Text(
                                            "$quantityInCart",
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w800,
                                              fontSize: 12,
                                              color: AppColors.darkNavy,
                                            ),
                                          ),
                                        ),
                                        GestureDetector(
                                          onTap: onIncrement,
                                          child: Container(
                                            width: 22,
                                            height: 22,
                                            decoration: const BoxDecoration(
                                              color: AppColors.neonBlue,
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(LucideIcons.plus, size: 12, color: Colors.white),
                                          ),
                                        ),
                                      ],
                                    ),
                                  )
                                : GestureDetector(
                                    onTap: inStock ? onAdd : null,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: inStock ? AppColors.softBlue : AppColors.iceWhite,
                                        borderRadius: AppRadii.borderFull,
                                        border: Border.all(
                                          color: inStock ? AppColors.neonBlue.withAlpha(60) : AppColors.borderCard,
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            inStock ? LucideIcons.plus : LucideIcons.alertCircle,
                                            size: 13,
                                            color: inStock ? AppColors.neonBlue : AppColors.mutedText,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            inStock ? "Add" : "Out",
                                            style: TextStyle(
                                              color: inStock ? AppColors.neonBlue : AppColors.mutedText,
                                              fontWeight: FontWeight.w800,
                                              fontSize: 11,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildImageFallback() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.shoppingBag, size: 36, color: AppColors.neonBlue.withAlpha(140)),
          const SizedBox(height: 4),
          const Text(
            "BuyMe Fresh",
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.mutedText),
          ),
        ],
      ),
    );
  }
}

