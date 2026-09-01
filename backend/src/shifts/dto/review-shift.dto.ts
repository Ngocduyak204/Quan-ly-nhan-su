import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ShiftStatus } from '@prisma/client';

export class ReviewShiftDto {
  @IsNotEmpty({ message: 'Trạng thái phê duyệt không được để trống' })
  @IsEnum(ShiftStatus, { message: 'Trạng thái phải là APPROVED hoặc REJECTED' })
  status: ShiftStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
