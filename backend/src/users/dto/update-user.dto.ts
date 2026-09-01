import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role phải là ADMIN hoặc WORKER' })
  role?: Role;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Trạng thái phải là ACTIVE hoặc INACTIVE' })
  status?: UserStatus;
}
