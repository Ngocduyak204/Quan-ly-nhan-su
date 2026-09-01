import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWageRateSchema {
  @ApiProperty({ description: 'Đơn giá tiền công (VNĐ/kg)', example: 16000 })
  @IsNotEmpty({ message: 'Đơn giá tiền công (VNĐ/kg) không được để trống' })
  @IsNumber({}, { message: 'Đơn giá phải là số' })
  @Min(0, { message: 'Đơn giá không được nhỏ hơn 0' })
  pricePerKg: number;

  @ApiPropertyOptional({ description: 'ID nhân công (Nếu để trống sẽ áp dụng làm Đơn giá chung toàn hệ thống)', example: '' })
  @IsOptional()
  @IsString({ message: 'userId phải là chuỗi' })
  userId?: string;

  @ApiProperty({ description: 'Thời điểm bắt đầu hiệu lực (Định dạng ISO Date)', example: '2026-09-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'Thời điểm bắt đầu hiệu lực không được để trống' })
  @IsDateString({}, { message: 'Thời điểm hiệu lực phải là định dạng ISO Date' })
  effectiveFrom: string;
}
