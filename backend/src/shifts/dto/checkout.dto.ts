import { IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CheckoutDto {
  @IsNotEmpty({ message: 'Vĩ độ Check-out không được để trống' })
  @IsLatitude({ message: 'Latitude không hợp lệ' })
  lat: number;

  @IsNotEmpty({ message: 'Kinh độ Check-out không được để trống' })
  @IsLongitude({ message: 'Longitude không hợp lệ' })
  lng: number;

  @IsNotEmpty({ message: 'GPS Accuracy không được để trống' })
  @IsNumber({}, { message: 'Accuracy phải là số' })
  accuracy: number;

  @IsNotEmpty({ message: 'Ảnh Check-out không được để trống' })
  @IsString({ message: 'Ảnh Check-out phải là chuỗi' })
  photoUrl: string;

  @IsNotEmpty({ message: 'Sản lượng (kg) không được để trống' })
  @IsNumber({}, { message: 'Sản lượng phải là số' })
  @Min(0.01, { message: 'Sản lượng phải lớn hơn 0 kg' })
  outputVolumeKg: number;

  @IsNotEmpty({ message: 'Ảnh minh chứng sản lượng không được để trống' })
  @IsString({ message: 'Ảnh minh chứng sản lượng phải là chuỗi' })
  volumeProofPhotoUrl: string;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}
