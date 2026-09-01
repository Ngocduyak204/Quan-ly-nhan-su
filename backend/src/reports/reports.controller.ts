import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReportsService } from './reports.service';
import { REPORTS_ROUTER } from './reports.router';

@ApiTags('Reports - Báo cáo thống kê')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller(REPORTS_ROUTER.BASE)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Lấy báo cáo tổng hợp sản lượng & tiền công dạng bảng Excel (Admin)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Từ ngày (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Đến ngày (YYYY-MM-DD)' })
  @Get(REPORTS_ROUTER.SUMMARY)
  @HttpCode(HttpStatus.OK)
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSummary(startDate, endDate);
  }
}
