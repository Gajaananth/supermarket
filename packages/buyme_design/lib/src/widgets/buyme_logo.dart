import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../tokens/app_colors.dart';

enum BuyMeLogoVariant { wordmark, iconOnly, full }

/// BuyMe Vector Logo (CustomPainter & Scalable Vector Components)
class BuyMeLogo extends StatelessWidget {
  final BuyMeLogoVariant variant;
  final double size;
  final bool isDark;
  final String? subtitle;

  const BuyMeLogo({
    super.key,
    this.variant = BuyMeLogoVariant.full,
    this.size = 36,
    this.isDark = false,
    this.subtitle,
  });

  const BuyMeLogo.iconOnly({
    super.key,
    this.size = 40,
    this.isDark = false,
  })  : variant = BuyMeLogoVariant.iconOnly,
        subtitle = null;

  const BuyMeLogo.wordmark({
    super.key,
    this.size = 28,
    this.isDark = false,
    this.subtitle,
  }) : variant = BuyMeLogoVariant.wordmark;

  @override
  Widget build(BuildContext context) {
    if (variant == BuyMeLogoVariant.iconOnly) {
      return _buildIconBadge();
    }

    if (variant == BuyMeLogoVariant.wordmark) {
      return _buildWordmark();
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        _buildIconBadge(),
        SizedBox(width: size * 0.3),
        _buildWordmark(),
      ],
    );
  }

  Widget _buildIconBadge() {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(size * 0.28),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.neonBlue,
            AppColors.deepBlue,
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.neonBlue.withOpacity(0.35),
            blurRadius: size * 0.4,
            offset: Offset(0, size * 0.12),
          ),
        ],
      ),
      child: CustomPaint(
        size: Size(size, size),
        painter: _BuyMeIconPainter(),
      ),
    );
  }

  Widget _buildWordmark() {
    final textColor = isDark ? Colors.white : AppColors.darkNavy;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: "D",
                style: GoogleFonts.manrope(
                  fontSize: size * 0.75,
                  fontWeight: FontWeight.w900,
                  color: AppColors.neonBlue,
                  letterSpacing: -0.5,
                ),
              ),
              TextSpan(
                text: "Mart",
                style: GoogleFonts.manrope(
                  fontSize: size * 0.75,
                  fontWeight: FontWeight.w900,
                  color: textColor,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 1),
          Text(
            subtitle!.toUpperCase(),
            style: GoogleFonts.manrope(
              fontSize: size * 0.22,
              fontWeight: FontWeight.w800,
              color: isDark ? const Color(0xFF94A3B8) : AppColors.mutedText,
              letterSpacing: 1.2,
            ),
          ),
        ],
      ],
    );
  }
}

/// Custom Vector Painter for the BuyMe "D" + Shopping Bag Facet Icon
class _BuyMeIconPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final paintWhite = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final paintAccent = Paint()
      ..color = const Color(0x80FFFFFF)
      ..style = PaintingStyle.fill;

    // Draw stylized modern D with curved outer loop
    final pathD = Path();
    final left = w * 0.26;
    final top = h * 0.22;
    final width = w * 0.48;
    final height = h * 0.56;
    final thickness = w * 0.13;

    // Outer boundary
    pathD.moveTo(left, top);
    pathD.lineTo(left + width * 0.4, top);
    pathD.cubicTo(
      left + width,
      top,
      left + width,
      top + height,
      left + width * 0.4,
      top + height,
    );
    pathD.lineTo(left, top + height);
    pathD.close();

    // Inner cutout
    final innerPath = Path();
    innerPath.moveTo(left + thickness, top + thickness);
    innerPath.lineTo(left + width * 0.35, top + thickness);
    innerPath.cubicTo(
      left + width * 0.7,
      top + thickness,
      left + width * 0.7,
      top + height - thickness,
      left + width * 0.35,
      top + height - thickness,
    );
    innerPath.lineTo(left + thickness, top + height - thickness);
    innerPath.close();

    final finalD = Path.combine(PathOperation.difference, pathD, innerPath);
    canvas.drawPath(finalD, paintWhite);

    // Accent facet: A sparkling geometric ice corner
    final facetPath = Path();
    facetPath.moveTo(w * 0.65, h * 0.25);
    facetPath.lineTo(w * 0.78, h * 0.38);
    facetPath.lineTo(w * 0.65, h * 0.51);
    facetPath.close();
    canvas.drawPath(facetPath, paintAccent);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
