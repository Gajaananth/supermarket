import { Module } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductImageService],
  exports: [ProductsService],
})
export class ProductsModule {}
