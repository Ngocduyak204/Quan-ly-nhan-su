import { PrismaClient, Role, ShiftStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Đang khởi tạo dữ liệu thử nghiệm đầy đủ cho Admin...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Tạo Tài khoản Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      passwordHash,
      fullName: 'Quản Trị Viên Hệ Thống',
      phone: '0901234567',
      address: 'Văn Phòng Trung Tâm',
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin: username = "admin" | password = "123456"`);

  // 2. Tạo các Tài khoản Worker
  const worker1 = await prisma.user.upsert({
    where: { username: 'worker1' },
    update: { passwordHash },
    create: {
      username: 'worker1',
      passwordHash,
      fullName: 'Nguyễn Văn A',
      phone: '0912345678',
      address: 'Khu Vực Hái Nông Sản 1',
      role: Role.WORKER,
    },
  });

  const worker2 = await prisma.user.upsert({
    where: { username: 'worker2' },
    update: { passwordHash },
    create: {
      username: 'worker2',
      passwordHash,
      fullName: 'Trần Thị B',
      phone: '0987654321',
      address: 'Khu Vực Hái Nông Sản 2',
      role: Role.WORKER,
    },
  });

  const worker3 = await prisma.user.upsert({
    where: { username: 'worker3' },
    update: { passwordHash },
    create: {
      username: 'worker3',
      passwordHash,
      fullName: 'Lê Văn C',
      phone: '0933445566',
      address: 'Khu Vực Hái Nông Sản 3',
      role: Role.WORKER,
    },
  });
  console.log(`✅ Workers: worker1, worker2, worker3 | password = "123456"`);

  // 3. Đơn giá tiền công (Wage Rates)
  await prisma.wageRate.deleteMany({});
  
  const baseRate = await prisma.wageRate.create({
    data: {
      pricePerKg: 15000,
      effectiveFrom: new Date('2026-01-01'),
      createdBy: admin.id,
    },
  });

  const customRate = await prisma.wageRate.create({
    data: {
      pricePerKg: 18000,
      userId: worker3.id,
      effectiveFrom: new Date('2026-08-01'),
      createdBy: admin.id,
    },
  });
  console.log(`✅ Đã thiết lập đơn giá: Chung (15,000 VNĐ/kg), Riêng Worker 3 (18,000 VNĐ/kg)`);

  // 4. Xóa ca cũ & Khởi tạo danh sách Ca làm việc (Work Shifts) đa dạng
  await prisma.shiftAuditLog.deleteMany({});
  await prisma.deviceLog.deleteMany({});
  await prisma.workShift.deleteMany({});

  // Ca 1: Hoàn thành bình thường (Worker 1)
  await prisma.workShift.create({
    data: {
      userId: worker1.id,
      checkinTime: new Date('2026-08-28T07:00:00Z'),
      checkinLat: 11.9404,
      checkinLng: 108.4583,
      checkinAccuracy: 12,
      checkinPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      checkoutTime: new Date('2026-08-28T17:00:00Z'),
      checkoutLat: 11.9405,
      checkoutLng: 108.4584,
      checkoutAccuracy: 10,
      checkoutPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      outputVolumeKg: 450,
      volumeProofPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
      appliedWageRate: 15000,
      calculatedWage: 6750000,
      distanceMeters: 15.2,
      isAnomaly: false,
      status: ShiftStatus.COMPLETED,
    },
  });

  // Ca 2: Hoàn thành bình thường (Worker 2)
  await prisma.workShift.create({
    data: {
      userId: worker2.id,
      checkinTime: new Date('2026-08-29T07:15:00Z'),
      checkinLat: 11.9410,
      checkinLng: 108.4590,
      checkinAccuracy: 15,
      checkinPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      checkoutTime: new Date('2026-08-29T16:45:00Z'),
      checkoutLat: 11.9412,
      checkoutLng: 108.4591,
      checkoutAccuracy: 8,
      checkoutPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      outputVolumeKg: 520,
      volumeProofPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
      appliedWageRate: 15000,
      calculatedWage: 7800000,
      distanceMeters: 22.4,
      isAnomaly: false,
      status: ShiftStatus.COMPLETED,
    },
  });

  // Ca 3: BẤT THƯỜNG Khoảng cách GPS > 100m (Worker 1) -> Chờ Admin Duyệt
  await prisma.workShift.create({
    data: {
      userId: worker1.id,
      checkinTime: new Date('2026-08-30T07:00:00Z'),
      checkinLat: 11.9404,
      checkinLng: 108.4583,
      checkinAccuracy: 10,
      checkinPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      checkoutTime: new Date('2026-08-30T17:30:00Z'),
      checkoutLat: 11.9520,
      checkoutLng: 108.4700,
      checkoutAccuracy: 12,
      checkoutPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      outputVolumeKg: 680,
      volumeProofPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
      appliedWageRate: 15000,
      calculatedWage: 10200000,
      distanceMeters: 1840.5,
      isAnomaly: true,
      anomalyReasons: ['Khoảng cách Check-in ➔ Check-out vượt ngưỡng an toàn (1840m > 100m)'],
      status: ShiftStatus.PENDING_REVIEW,
    },
  });

  // Ca 4: BẤT THƯỜNG GPS Accuracy > 50m (Worker 2) -> Chờ Admin Duyệt
  await prisma.workShift.create({
    data: {
      userId: worker2.id,
      checkinTime: new Date('2026-08-31T06:45:00Z'),
      checkinLat: 11.9400,
      checkinLng: 108.4580,
      checkinAccuracy: 85,
      checkinPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      checkoutTime: new Date('2026-08-31T17:00:00Z'),
      checkoutLat: 11.9402,
      checkoutLng: 108.4582,
      checkoutAccuracy: 90,
      checkoutPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      outputVolumeKg: 410,
      volumeProofPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
      appliedWageRate: 15000,
      calculatedWage: 6150000,
      distanceMeters: 30.1,
      isAnomaly: true,
      anomalyReasons: ['Độ chính xác tín hiệu GPS kém (Checkin: 85m, Checkout: 90m > 50m)'],
      status: ShiftStatus.PENDING_REVIEW,
    },
  });

  // Ca 5: Đang thực hiện ca (WORKING - Worker 3)
  await prisma.workShift.create({
    data: {
      userId: worker3.id,
      checkinTime: new Date(),
      checkinLat: 11.9404,
      checkinLng: 108.4583,
      checkinAccuracy: 10,
      checkinPhotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      status: ShiftStatus.WORKING,
    },
  });

  // Ca 6: Hoàn thành theo đơn giá riêng 18,000 VNĐ/kg (Worker 3)
  await prisma.workShift.create({
    data: {
      userId: worker3.id,
      checkinTime: new Date('2026-08-27T07:00:00Z'),
      checkinLat: 11.9404,
      checkinLng: 108.4583,
      checkinAccuracy: 10,
      checkinPhotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      checkoutTime: new Date('2026-08-27T16:30:00Z'),
      checkoutLat: 11.9405,
      checkoutLng: 108.4584,
      checkoutAccuracy: 8,
      checkoutPhotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      outputVolumeKg: 380,
      volumeProofPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
      appliedWageRate: 18000,
      calculatedWage: 6840000,
      distanceMeters: 18.0,
      isAnomaly: false,
      status: ShiftStatus.COMPLETED,
    },
  });

  console.log(`✅ Đã khởi tạo 6 Ca làm việc (Bao gồm Ca hoàn thành, Ca bất thường GPS và Ca đang làm)`);

  // 5. Khởi tạo Kỳ tiền công mẫu (Wage Period)
  await prisma.wagePeriod.deleteMany({});
  await prisma.wagePeriod.create({
    data: {
      name: 'Kỳ Tiền Công Tháng 08/2026',
      startDate: new Date('2026-08-01T00:00:00Z'),
      endDate: new Date('2026-08-31T23:59:59Z'),
      isLocked: false,
    },
  });
  console.log(`✅ Đã khởi tạo Kỳ tiền công Tháng 08/2026 (Sẵn sàng để Admin bấm CHỐT KỲ)`);

  console.log('\n🎉 ĐÃ ĐỔ XONG DỮ LIỆU THỬ NGHIỆM ĐẦY ĐỦ VÀO DATABASE!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
