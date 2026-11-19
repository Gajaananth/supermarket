import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @Public()
  findAll() {
    return this.categories.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categories.findOne(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: UserPayload) {
    return this.categories.create(dto, user);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.categories.update(id, dto, user);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.SUPER_ADMIN)
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.categories.deactivate(id, user);
  }
}
