import 'package:flutter/material.dart';
import '../tokens/app_colors.dart';

/// Layered Scaffold with Atmospheric Aurora Gradient Blobs
/// Soft Red + Yellow + Tint foundation for real BackdropFilter glass blurs.
class GlassScaffold extends StatelessWidget {
  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? bottomNavigationBar;
  final Widget? floatingActionButton;
  final FloatingActionButtonLocation? floatingActionButtonLocation;
  final bool resizeToAvoidBottomInset;

  const GlassScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.bottomNavigationBar,
    this.floatingActionButton,
    this.floatingActionButtonLocation,
    this.resizeToAvoidBottomInset = true,
  });

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      resizeToAvoidBottomInset: resizeToAvoidBottomInset,
      extendBody: true,
      extendBodyBehindAppBar: true,
      appBar: appBar,
      floatingActionButton: floatingActionButton,
      floatingActionButtonLocation: floatingActionButtonLocation,
      bottomNavigationBar: bottomNavigationBar,
      body: Stack(
        children: [
          // 1. Aurora Orb: Top Left (Soft Brand Red)
          Positioned(
            top: -60,
            left: -40,
            width: size.width * 0.75,
            height: size.width * 0.75,
            child: Container(
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.auroraBlob1,
                    Color(0x00E4002B),
                  ],
                ),
              ),
            ),
          ),

          // 2. Aurora Orb: Mid Right (Warm Yellow)
          Positioned(
            top: size.height * 0.28,
            right: -80,
            width: size.width * 0.85,
            height: size.width * 0.85,
            child: Container(
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.auroraBlob2,
                    Color(0x00FFC20E),
                  ],
                ),
              ),
            ),
          ),

          // 3. Aurora Orb: Bottom Left (Soft Rosy Tint)
          Positioned(
            bottom: -50,
            left: -30,
            width: size.width * 0.8,
            height: size.width * 0.8,
            child: Container(
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.auroraBlob3,
                    Color(0x00FFE9EC),
                  ],
                ),
              ),
            ),
          ),

          // 4. Foreground Page Content
          SafeArea(
            bottom: false,
            child: body,
          ),
        ],
      ),
    );
  }
}
