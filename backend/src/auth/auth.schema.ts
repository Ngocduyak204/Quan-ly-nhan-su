import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class LoginSchema {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'admin' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Mật khẩu', example: '123456' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;
}

export class RegisterSchema {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'worker3' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Mật khẩu', example: '123456' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password: string;

  @ApiProperty({ description: 'Họ và tên', example: 'Lê Văn C' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ', example: 'Đà Lạt, Lâm Đồng' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Vai trò (ADMIN / WORKER)', enum: Role, example: Role.WORKER })
  @IsOptional()
  @IsEnum(Role, { message: 'Role phải là ADMIN hoặc WORKER' })
  role?: Role;
}

export class RefreshTokenSchema {
  @ApiProperty({ description: 'JWT Refresh Token' })
  @IsNotEmpty({ message: 'Refresh Token không được để trống' })
  @IsString()
  refreshToken: string;
}

export class ChangePasswordSchema {
  @ApiProperty({ description: 'Mật khẩu hiện tại', example: '123456' })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: 'Mật khẩu mới', example: '654321' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới tối thiểu 6 ký tự' })
  newPassword: string;
}

export class UpdateProfileSchema {
  @ApiPropertyOptional({ description: 'Họ và tên mới', example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại mới', example: '0912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ mới', example: 'Thành phố Đà Lạt' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class ForgotPasswordSchema {
  @ApiProperty({ description: 'Tên đăng nhập', example: 'worker1' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString()
  username: string;

  @ApiPropertyOptional({ description: 'Số điện thoại đăng ký (Nếu có)', example: '0912345678' })
  @IsOptional()
  @IsString()
  phone?: string;
}
