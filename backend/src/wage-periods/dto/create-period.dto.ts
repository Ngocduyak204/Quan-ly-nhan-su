import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateWagePeriodDto {
  @IsNotEmpty({ message: 'Tên kỳ tiền công không được để trống' })
  @IsString({ message: 'Tên kỳ tiền công phải là chuỗi' })
  name: string;

  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Ngày bắt đầu phải là định dạng ISO Date' })
  startDate: string;

  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsDateString({}, { message: 'Ngày kết thúc phải là định dạng ISO Date' })
  endDate: string;
}
