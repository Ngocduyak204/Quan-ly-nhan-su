import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role, ShiftStatus } from '@prisma/client';
import { Request } from 'express';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdjustVolumeSchema, CheckinSchema, CheckoutSchema, ReviewShiftSchema } from './shifts.schema';
import { ShiftsService } from './shifts.service';
import { SHIFTS_ROUTER } from './shifts.router';

@ApiTags('Shifts - Chấm công & Sản lượng')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller(SHIFTS_ROUTER.BASE)
export class ShiftsController {
  constructor(private shiftsService: ShiftsService) {}

  @ApiOperation({ summary: 'Check-in ca làm việc (GPS + Ảnh Camera trực tiếp)' })
  @Roles(Role.WORKER, Role.ADMIN)
  @Post(SHIFTS_ROUTER.CHECKIN)
  @HttpCode(HttpStatus.CREATED)
  checkin(@GetUser('id') userId: string, @Body() dto: CheckinSchema, @Req() req: Request) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    return this.shiftsService.checkin(userId, dto, ip, userAgent);
  }

  @ApiOperation({ summary: 'Check-out ca làm việc (GPS + Ảnh Check-out + Nhập kg + Ảnh minh chứng)' })
  @Roles(Role.WORKER, Role.ADMIN)
  @Post(SHIFTS_ROUTER.CHECKOUT)
  @HttpCode(HttpStatus.OK)
  checkout(@GetUser('id') userId: string, @Body() dto: CheckoutSchema, @Req() req: Request) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    return this.shiftsService.checkout(userId, dto, ip, userAgent);
  }

  @ApiOperation({ summary: 'Lấy ca làm việc đang hoạt động của nhân công' })
  @Roles(Role.WORKER, Role.ADMIN)
  @Get(SHIFTS_ROUTER.ACTIVE)
  @HttpCode(HttpStatus.OK)
  getActiveShift(@GetUser('id') userId: string) {
    return this.shiftsService.getActiveShift(userId);
  }

  @ApiOperation({ summary: 'Lấy danh sách ca làm việc của bản thân nhân công' })
  @Roles(Role.WORKER, Role.ADMIN)
  @Get(SHIFTS_ROUTER.MY_SHIFTS)
  @HttpCode(HttpStatus.OK)
  getMyShifts(@GetUser('id') userId: string) {
    return this.shiftsService.getMyShifts(userId);
  }

  @ApiOperation({ summary: 'Admin xem danh sách toàn bộ ca làm việc & các ca bị gán nhãn BẤT THƯỜNG' })
  @ApiQuery({ name: 'status', enum: ShiftStatus, required: false })
  @ApiQuery({ name: 'isAnomaly', type: Boolean, required: false })
  @Roles(Role.ADMIN)
  @Get(SHIFTS_ROUTER.ADMIN_ALL)
  @HttpCode(HttpStatus.OK)
  findAllShifts(
    @Query('status') status?: ShiftStatus,
    @Query('isAnomaly') isAnomaly?: string,
  ) {
    const anomalyBool = isAnomaly === 'true' ? true : isAnomaly === 'false' ? false : undefined;
    return this.shiftsService.findAllShifts(status, anomalyBool);
  }

  @ApiOperation({ summary: 'Admin điều chỉnh sản lượng kg (bắt buộc nhập lý do lưu Audit Log)' })
  @Roles(Role.ADMIN)
  @Patch(SHIFTS_ROUTER.ADJUST_VOLUME)
  @HttpCode(HttpStatus.OK)
  adjustVolume(
    @Param('id') id: string,
    @GetUser('id') adminUserId: string,
    @Body() dto: AdjustVolumeSchema,
  ) {
    return this.shiftsService.adjustVolume(id, adminUserId, dto);
  }

  @ApiOperation({ summary: 'Admin phê duyệt / từ chối ca làm việc bất thường' })
  @Roles(Role.ADMIN)
  @Patch(SHIFTS_ROUTER.REVIEW)
  @HttpCode(HttpStatus.OK)
  reviewShift(
    @Param('id') id: string,
    @GetUser('id') adminUserId: string,
    @Body() dto: ReviewShiftSchema,
  ) {
    return this.shiftsService.reviewShift(id, adminUserId, dto);
  }
}
