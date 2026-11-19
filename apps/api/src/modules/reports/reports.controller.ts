import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@Roles(Role.SUPER_ADMIN)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get bounded, store-filterable daily sales and order aggregates' })
  overview(@Query() query: ReportQueryDto) {
    return this.reports.overview(query);
  }
}
