import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateWagePeriodSchema {
  @ApiProperty({ description: 'Tên kỳ tiền công', example: 'Kỳ 01/09/2026 - 15/09/2026' })
  @IsNotEmpty({ message: 'Tên kỳ tiền công không được để trống' })
  @IsString({ message: 'Tên kỳ tiền công phải là chuỗi' })
  name: string;

  @ApiProperty({ description: 'Ngày bắt đầu kỳ (YYYY-MM-DD)', example: '2026-09-01' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Ngày bắt đầu phải là định dạng ISO Date' })
  startDate: string;

  @ApiProperty({ description: 'Ngày kết thúc kỳ (YYYY-MM-DD)', example: '2026-09-15' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsDateString({}, { message: 'Ngày kết thúc phải là định dạng ISO Date' })
  endDate: string;
}
