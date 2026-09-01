import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Đang khởi tạo dữ liệu mẫu (Seeding data)...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Tạo Tài khoản Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      fullName: 'Quản Trị Viên Hệ Thống',
      phone: '0901234567',
      address: 'Văn Phòng Trung Tâm',
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Đã tạo tài khoản Admin: username = "admin" | password = "123456"`);

  // 2. Tạo Tài khoản Worker 1
  const worker1 = await prisma.user.upsert({
    where: { username: 'worker1' },
    update: {},
    create: {
      username: 'worker1',
      passwordHash,
      fullName: 'Nguyễn Văn A',
      phone: '0912345678',
      address: 'Khu Vực Hái Nông Sản 1',
      role: Role.WORKER,
    },
  });
  console.log(`✅ Đã tạo tài khoản Worker 1: username = "worker1" | password = "123456"`);

  // 3. Tạo Tài khoản Worker 2
  const worker2 = await prisma.user.upsert({
    where: { username: 'worker2' },
    update: {},
    create: {
      username: 'worker2',
      passwordHash,
      fullName: 'Trần Thị B',
      phone: '0987654321',
      address: 'Khu Vực Hái Nông Sản 2',
      role: Role.WORKER,
    },
  });
  console.log(`✅ Đã tạo tài khoản Worker 2: username = "worker2" | password = "123456"`);

  // 4. Tạo Đơn giá chung mặc định theo kg (15,000 VNĐ / kg)
  const existingRate = await prisma.wageRate.findFirst({
    where: { userId: null },
  });

  if (!existingRate) {
    await prisma.wageRate.create({
      data: {
        pricePerKg: 15000,
        effectiveFrom: new Date('2026-01-01'),
        createdBy: admin.id,
      },
    });
    console.log(`✅ Đã khởi tạo đơn giá mặc định: 15,000 VNĐ / kg`);
  }

  console.log('🎉 Hoàn tất đổ dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
