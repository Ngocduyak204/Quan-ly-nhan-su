import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateWageRateSchema } from './wage-rates.schema';
import { WageRatesService } from './wage-rates.service';
import { WAGE_RATES_ROUTER } from './wage-rates.router';

@ApiTags('WageRates - Đơn giá theo kg')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller(WAGE_RATES_ROUTER.BASE)
export class WageRatesController {
  constructor(private wageRatesService: WageRatesService) {}

  @ApiOperation({ summary: 'Thiết lập đơn giá mới theo kg (Admin)' })
  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@GetUser('id') adminUserId: string, @Body() dto: CreateWageRateSchema) {
    return this.wageRatesService.create(adminUserId, dto);
  }

  @ApiOperation({ summary: 'Xem toàn bộ lịch sử đơn giá (Admin)' })
  @Roles(Role.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.wageRatesService.findAll();
  }

  @ApiOperation({ summary: 'Lấy đơn giá đang áp dụng hiện tại' })
  @Roles(Role.WORKER, Role.ADMIN)
  @Get(WAGE_RATES_ROUTER.CURRENT)
  @HttpCode(HttpStatus.OK)
  findCurrentRate(@Query('userId') userId?: string) {
    return this.wageRatesService.findCurrentRate(userId);
  }
}
