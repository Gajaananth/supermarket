import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductImageService, ProductImageUpload } from './product-image.service';
import { ProductsService } from './products.service';
import { CreateProductDto, SearchProductsDto, UpdateProductDto } from './dto/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly products: ProductsService,
    private readonly images: ProductImageService,
  ) {}

  @Get()
  @Public()
  findAll(@Query() query: SearchProductsDto) {
    return this.products.findAll(query);
  }

  @Get('barcode/:barcode')
  @Public()
  findByBarcode(@Param('barcode') barcode: string) {
    return this.products.findByBarcode(barcode);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.findOne(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateProductDto, @CurrentUser() user: UserPayload) {
    return this.products.create(dto, user);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.products.update(id, dto, user);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.products.deactivate(id, user);
  }

  @Post(':id/image')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
      required: ['image'],
    },
  })
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_request, file, callback) => {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
        callback(new BadRequestException('Only PNG, JPEG, and WebP images are allowed'), false);
        return;
      }
      callback(null, true);
    },
  }))
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(new ParseFilePipe({
      validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
    })) file: ProductImageUpload,
    @CurrentUser() user: UserPayload,
  ) {
    await this.products.findOne(id);
    const saved = await this.images.save(file);
    try {
      return await this.products.setImageUrl(id, saved.url, user);
    } catch (error) {
      const { unlink } = await import('node:fs/promises');
      await unlink(saved.path);
      throw error;
    }
  }
}
