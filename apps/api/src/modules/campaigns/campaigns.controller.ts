import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CampaignListQueryDto,
  CreateCampaignDto,
  UpdateCampaignDto,
} from './dto/campaign.dto';
import { CampaignsService } from './campaigns.service';

@ApiTags('Campaigns')
@ApiBearerAuth('JWT-auth')
@Roles(Role.SUPER_ADMIN)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  list(@Query() query: CampaignListQueryDto) {
    return this.campaigns.list(query);
  }

  @Post()
  create(
    @Body() dto: CreateCampaignDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.campaigns.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.campaigns.update(id, dto, user);
  }
}
