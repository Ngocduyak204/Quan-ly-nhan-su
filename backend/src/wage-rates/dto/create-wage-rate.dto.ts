import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWageRateDto {
  @IsNotEmpty({ message: 'Đơn giá tiền công (VNĐ/kg) không được để trống' })
  @IsNumber({}, { message: 'Đơn giá phải là số' })
  @Min(0, { message: 'Đơn giá không được nhỏ hơn 0' })
  pricePerKg: number;

  @IsOptional()
  @IsString({ message: 'userId phải là chuỗi' })
  userId?: string;

  @IsNotEmpty({ message: 'Thời điểm bắt đầu hiệu lực không được để trống' })
  @IsDateString({}, { message: 'Thời điểm hiệu lực phải là định dạng ISO Date' })
  effectiveFrom: string;
}
