import 'package:buyme_design/buyme_design.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../core/providers.dart';

class CategoriesScreen extends ConsumerWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categories = ref.watch(categoriesProvider);
    return GlassScaffold(
      appBar: AppBar(title: Text('Shop by category', style: AppTypography.h3)),
      body: categories.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => ErrorState(
          message: '$error',
          onRetry: () => ref.invalidate(categoriesProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return const EmptyState(
              title: 'No categories yet',
              description: 'Check back soon for available products.',
              icon: LucideIcons.layoutGrid,
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.fromLTRB(18, 8, 18, 28),
            itemCount: items.length,
            gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: 220,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              mainAxisExtent: 174,
            ),
            itemBuilder: (context, index) {
              final category = items[index];
              return CategoryCard(
                id: category.id,
                title: category.name,
                titleTa: category.nameTa,
                imageUrl: null,
                onTap: () => context.go(
                  Uri(
                    path: '/shop',
                    queryParameters: {'categoryId': category.id},
                  ).toString(),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
