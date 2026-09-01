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
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserSchema, ResetPasswordSchema, UpdateUserSchema } from './users.schema';
import { UsersService } from './users.service';
import { USERS_ROUTER } from './users.router';

@ApiTags('Users - Quản lý nhân công')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller(USERS_ROUTER.BASE)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Tạo tài khoản nhân công mới (Admin)' })
  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserSchema) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Xem danh sách toàn bộ người dùng (Admin)' })
  @Roles(Role.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Xem thông tin chi tiết một người dùng (Admin)' })
  @Roles(Role.ADMIN)
  @Get(USERS_ROUTER.BY_ID)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin người dùng (Admin)' })
  @Roles(Role.ADMIN)
  @Patch(USERS_ROUTER.BY_ID)
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdateUserSchema) {
    return this.usersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Đặt lại mật khẩu cho nhân công (Admin)' })
  @Roles(Role.ADMIN)
  @Post(USERS_ROUTER.RESET_PASSWORD)
  @HttpCode(HttpStatus.OK)
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordSchema) {
    return this.usersService.resetPassword(id, dto);
  }
}
