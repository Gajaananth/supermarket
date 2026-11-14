import 'package:flutter/material.dart';
import '../tokens/app_radii.dart';

/// BuyMe Shimmer Skeleton Loader for Loading States
class SkeletonLoader extends StatefulWidget {
  final double? width;
  final double? height;
  final BorderRadius borderRadius;
  final Widget? child;

  const SkeletonLoader({
    super.key,
    this.width,
    this.height,
    this.borderRadius = AppRadii.borderMd,
    this.child,
  });

  /// Preset for circular avatar / icon skeletons
  factory SkeletonLoader.circle({required double size, Key? key}) {
    return SkeletonLoader(
      key: key,
      width: size,
      height: size,
      borderRadius: BorderRadius.circular(size / 2),
    );
  }

  /// Preset for single line text skeleton
  factory SkeletonLoader.text({
    double width = double.infinity,
    double height = 14,
    Key? key,
  }) {
    return SkeletonLoader(
      key: key,
      width: width,
      height: height,
      borderRadius: AppRadii.borderSm,
    );
  }

  /// Preset for product card or list card skeleton
  factory SkeletonLoader.card({
    double width = double.infinity,
    double height = 180,
    Key? key,
  }) {
    return SkeletonLoader(
      key: key,
      width: width,
      height: height,
      borderRadius: AppRadii.border2Xl,
    );
  }

  @override
  State<SkeletonLoader> createState() => _SkeletonLoaderState();
}

class _SkeletonLoaderState extends State<SkeletonLoader> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();

    _animation = Tween<double>(begin: -1.0, end: 2.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: widget.borderRadius,
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              stops: [
                (_animation.value - 0.3).clamp(0.0, 1.0),
                _animation.value.clamp(0.0, 1.0),
                (_animation.value + 0.3).clamp(0.0, 1.0),
              ],
              colors: const [
                Color(0xFFE2E8F0),
                Color(0xFFF1F5F9),
                Color(0xFFE2E8F0),
              ],
            ),
          ),
          child: widget.child,
        );
      },
    );
  }
}
