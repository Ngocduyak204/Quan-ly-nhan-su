import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { ChangePasswordSchema, ForgotPasswordSchema, LoginSchema, RegisterSchema, UpdateProfileSchema } from './auth.schema';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { AUTH_ROUTER } from './auth.router';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
};

@ApiTags('Auth - Xác thực & Hồ sơ người dùng')
@Controller(AUTH_ROUTER.BASE)
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @Post(AUTH_ROUTER.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterSchema,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    res.cookie('refresh_token', result.tokens.refreshToken, COOKIE_OPTIONS);
    return result;
  }

  @ApiOperation({ summary: 'Đăng nhập tài khoản' })
  @Post(AUTH_ROUTER.LOGIN)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginSchema,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie('refresh_token', result.tokens.refreshToken, COOKIE_OPTIONS);
    return result;
  }

  @ApiOperation({ summary: 'Cấp lại Access Token mới từ Refresh Token' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtRefreshGuard)
  @Post(AUTH_ROUTER.REFRESH)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @GetUser('userId') userId: string,
    @GetUser('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshToken(userId, refreshToken);
    res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTIONS);
    return tokens;
  }

  @ApiOperation({ summary: 'Đăng xuất tài khoản (Thu hồi toàn bộ Token)' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAccessGuard)
  @Post(AUTH_ROUTER.LOGOUT)
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refresh_token', { path: '/' });
    return this.authService.logout(userId);
  }

  @ApiOperation({ summary: 'Lấy thông tin profile tài khoản đang đăng nhập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAccessGuard)
  @Get(AUTH_ROUTER.PROFILE)
  @HttpCode(HttpStatus.OK)
  getProfile(@GetUser() user: any) {
    return user;
  }

  @ApiOperation({ summary: 'Cập nhật thông tin trang cá nhân (Họ tên, SĐT, Địa chỉ)' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAccessGuard)
  @Patch(AUTH_ROUTER.PROFILE)
  @HttpCode(HttpStatus.OK)
  updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateProfileSchema) {
    return this.authService.updateProfile(userId, dto);
  }

  @ApiOperation({ summary: 'Thay đổi mật khẩu tài khoản cá nhân' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAccessGuard)
  @Post(AUTH_ROUTER.CHANGE_PASSWORD)
  @HttpCode(HttpStatus.OK)
  changePassword(@GetUser('id') userId: string, @Body() dto: ChangePasswordSchema) {
    return this.authService.changePassword(userId, dto);
  }

  @ApiOperation({ summary: 'Yêu cầu quên mật khẩu' })
  @Post(AUTH_ROUTER.FORGOT_PASSWORD)
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordSchema) {
    return this.authService.forgotPassword(dto);
  }

  @ApiOperation({ summary: 'Xem danh sách yêu cầu đặt lại mật khẩu (Admin)' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('reset-requests')
  @HttpCode(HttpStatus.OK)
  getPasswordResetRequests() {
    return this.authService.getPasswordResetRequests();
  }

  @ApiOperation({ summary: 'Xử lý đặt lại mật khẩu cho yêu cầu quên mật khẩu (Admin)' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('reset-requests/:id/resolve')
  @HttpCode(HttpStatus.OK)
  resolvePasswordResetRequest(
    @Param('id') requestId: string,
    @GetUser('id') adminUserId: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resolvePasswordResetRequest(requestId, adminUserId, newPassword);
  }
}
