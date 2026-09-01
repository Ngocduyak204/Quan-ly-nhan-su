import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

export class CreateUserSchema {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'worker_moi' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Mật khẩu', example: '123456' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;

  @ApiProperty({ description: 'Họ và tên', example: 'Phạm Văn D' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0933445566' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ', example: 'Nông trường 1' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Vai trò (ADMIN / WORKER)', enum: Role, example: Role.WORKER })
  @IsOptional()
  @IsEnum(Role, { message: 'Role không hợp lệ (ADMIN hoặc WORKER)' })
  role?: Role;
}

export class UpdateUserSchema {
  @ApiPropertyOptional({ description: 'Họ và tên mới', example: 'Phạm Văn D (Đã sửa)' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại mới', example: '0933445566' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ mới', example: 'Nông trường 2' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Vai trò mới', enum: Role })
  @IsOptional()
  @IsEnum(Role, { message: 'Role phải là ADMIN hoặc WORKER' })
  role?: Role;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', enum: UserStatus, example: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Trạng thái phải là ACTIVE hoặc INACTIVE' })
  status?: UserStatus;
}

export class ResetPasswordSchema {
  @ApiProperty({ description: 'Mật khẩu mới', example: '654321' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới tối thiểu 6 ký tự' })
  newPassword: string;
}
