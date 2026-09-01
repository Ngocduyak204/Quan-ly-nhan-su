import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AdjustVolumeDto {
  @IsNotEmpty({ message: 'Sản lượng mới không được để trống' })
  @IsNumber({}, { message: 'Sản lượng mới phải là số' })
  @Min(0, { message: 'Sản lượng không được nhỏ hơn 0' })
  newVolumeKg: number;

  @IsNotEmpty({ message: 'Lý do điều chỉnh không được để trống' })
  @IsString({ message: 'Lý do điều chỉnh phải là chuỗi' })
  reason: string;
}
