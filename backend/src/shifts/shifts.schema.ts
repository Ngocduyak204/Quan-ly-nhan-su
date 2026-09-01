import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ShiftStatus } from '@prisma/client';

export class CheckinSchema {
  @ApiProperty({ description: 'Vĩ độ GPS Check-in (Latitude)', example: 11.9404 })
  @IsNotEmpty({ message: 'Vĩ độ (Latitude) không được để trống' })
  @IsLatitude({ message: 'Latitude không hợp lệ' })
  lat: number;

  @ApiProperty({ description: 'Kinh độ GPS Check-in (Longitude)', example: 108.4583 })
  @IsNotEmpty({ message: 'Kinh độ (Longitude) không được để trống' })
  @IsLongitude({ message: 'Longitude không hợp lệ' })
  lng: number;

  @ApiProperty({ description: 'Bán kính sai số GPS (mét)', example: 12.5 })
  @IsNotEmpty({ message: 'GPS Accuracy không được để trống' })
  @IsNumber({}, { message: 'Accuracy phải là số' })
  accuracy: number;

  @ApiProperty({ description: 'URL hoặc chuỗi Base64 ảnh chụp camera Check-in', example: 'data:image/jpeg;base64,...' })
  @IsNotEmpty({ message: 'Ảnh Check-in không được để trống' })
  @IsString({ message: 'Ảnh Check-in phải là chuỗi' })
  photoUrl: string;

  @ApiPropertyOptional({ description: 'Mã định danh thiết bị', example: 'device-fingerprint-abc-123' })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}

export class CheckoutSchema {
  @ApiProperty({ description: 'Vĩ độ GPS Check-out (Latitude)', example: 11.9408 })
  @IsNotEmpty({ message: 'Vĩ độ Check-out không được để trống' })
  @IsLatitude({ message: 'Latitude không hợp lệ' })
  lat: number;

  @ApiProperty({ description: 'Kinh độ GPS Check-out (Longitude)', example: 108.4587 })
  @IsNotEmpty({ message: 'Kinh độ Check-out không được để trống' })
  @IsLongitude({ message: 'Longitude không hợp lệ' })
  lng: number;

  @ApiProperty({ description: 'Bán kính sai số GPS (mét)', example: 10.0 })
  @IsNotEmpty({ message: 'GPS Accuracy không được để trống' })
  @IsNumber({}, { message: 'Accuracy phải là số' })
  accuracy: number;

  @ApiProperty({ description: 'URL hoặc chuỗi Base64 ảnh Check-out', example: 'data:image/jpeg;base64,...' })
  @IsNotEmpty({ message: 'Ảnh Check-out không được để trống' })
  @IsString({ message: 'Ảnh Check-out phải là chuỗi' })
  photoUrl: string;

  @ApiProperty({ description: 'Sản lượng thu hoạch (kg)', example: 85.5 })
  @IsNotEmpty({ message: 'Sản lượng (kg) không được để trống' })
  @IsNumber({}, { message: 'Sản lượng phải là số' })
  @Min(0.01, { message: 'Sản lượng phải lớn hơn 0 kg' })
  outputVolumeKg: number;

  @ApiProperty({ description: 'URL hoặc chuỗi Base64 ảnh minh chứng cân sản lượng', example: 'data:image/jpeg;base64,...' })
  @IsNotEmpty({ message: 'Ảnh minh chứng sản lượng không được để trống' })
  @IsString({ message: 'Ảnh minh chứng sản lượng phải là chuỗi' })
  volumeProofPhotoUrl: string;

  @ApiPropertyOptional({ description: 'Mã định danh thiết bị', example: 'device-fingerprint-abc-123' })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}

export class AdjustVolumeSchema {
  @ApiProperty({ description: 'Sản lượng mới sau khi điều chỉnh (kg)', example: 90.0 })
  @IsNotEmpty({ message: 'Sản lượng mới không được để trống' })
  @IsNumber({}, { message: 'Sản lượng mới phải là số' })
  @Min(0, { message: 'Sản lượng không được nhỏ hơn 0' })
  newVolumeKg: number;

  @ApiProperty({ description: 'Bắt buộc nhập lý do điều chỉnh để lưu Audit Log', example: 'Nhân công cân sót 4.5kg nông sản' })
  @IsNotEmpty({ message: 'Lý do điều chỉnh không được để trống' })
  @IsString({ message: 'Lý do điều chỉnh phải là chuỗi' })
  reason: string;
}

export class ReviewShiftSchema {
  @ApiProperty({ description: 'Trạng thái phê duyệt ca (APPROVED / REJECTED)', enum: ShiftStatus, example: ShiftStatus.APPROVED })
  @IsNotEmpty({ message: 'Trạng thái phê duyệt không được để trống' })
  @IsEnum(ShiftStatus, { message: 'Trạng thái phải là APPROVED hoặc REJECTED' })
  status: ShiftStatus;

  @ApiPropertyOptional({ description: 'Lý do duyệt / từ chối', example: 'Đã xác minh vị trí GPS thực tế' })
  @IsOptional()
  @IsString()
  reason?: string;
}
