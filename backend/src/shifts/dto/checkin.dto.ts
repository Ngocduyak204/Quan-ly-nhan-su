import { IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckinDto {
  @IsNotEmpty({ message: 'Vĩ độ (Latitude) không được để trống' })
  @IsLatitude({ message: 'Latitude không hợp lệ' })
  lat: number;

  @IsNotEmpty({ message: 'Kinh độ (Longitude) không được để trống' })
  @IsLongitude({ message: 'Longitude không hợp lệ' })
  lng: number;

  @IsNotEmpty({ message: 'GPS Accuracy không được để trống' })
  @IsNumber({}, { message: 'Accuracy phải là số' })
  accuracy: number;

  @IsNotEmpty({ message: 'Ảnh Check-in không được để trống' })
  @IsString({ message: 'Ảnh Check-in phải là chuỗi' })
  photoUrl: string;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}
