import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { LoginSchema, RegisterSchema } from './auth.schema';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AUTH_ROUTER } from './auth.router';

@ApiTags('Auth - Xác thực người dùng')
@Controller(AUTH_ROUTER.BASE)
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @Post(AUTH_ROUTER.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterSchema) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Đăng nhập tài khoản' })
  @Post(AUTH_ROUTER.LOGIN)
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginSchema) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Cấp lại Access Token mới từ Refresh Token' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtRefreshGuard)
  @Post(AUTH_ROUTER.REFRESH)
  @HttpCode(HttpStatus.OK)
  refreshToken(@GetUser('userId') userId: string, @GetUser('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(userId, refreshToken);
  }

  @ApiOperation({ summary: 'Đăng xuất tài khoản' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAccessGuard)
  @Post(AUTH_ROUTER.LOGOUT)
  @HttpCode(HttpStatus.OK)
  logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @ApiOperation({ summary: 'Lấy thông tin tài khoản đang đăng nhập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAccessGuard)
  @Get(AUTH_ROUTER.PROFILE)
  @HttpCode(HttpStatus.OK)
  getProfile(@GetUser() user: any) {
    return user;
  }
}
