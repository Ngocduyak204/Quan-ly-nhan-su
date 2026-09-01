import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateWagePeriodSchema } from './wage-periods.schema';
import { WagePeriodsService } from './wage-periods.service';
import { WAGE_PERIODS_ROUTER } from './wage-periods.router';

@ApiTags('WagePeriods - Chốt kỳ tiền công')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller(WAGE_PERIODS_ROUTER.BASE)
export class WagePeriodsController {
  constructor(private wagePeriodsService: WagePeriodsService) {}

  @ApiOperation({ summary: 'Tạo kỳ tiền công mới (Admin)' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateWagePeriodSchema) {
    return this.wagePeriodsService.create(dto);
  }

  @ApiOperation({ summary: 'Xem danh sách toàn bộ các kỳ tiền công (Admin)' })
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.wagePeriodsService.findAll();
  }

  @ApiOperation({ summary: 'Chốt kỳ tiền công (Đóng băng dữ liệu Read-Only cho kỳ)' })
  @Patch(WAGE_PERIODS_ROUTER.LOCK)
  @HttpCode(HttpStatus.OK)
  lockPeriod(@Param('id') id: string, @GetUser('id') adminUserId: string) {
    return this.wagePeriodsService.lockPeriod(id, adminUserId);
  }
}
