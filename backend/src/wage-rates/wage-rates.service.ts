import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWageRateSchema } from './wage-rates.schema';

@Injectable()
export class WageRatesService {
  constructor(private prisma: PrismaService) {}

  async create(adminUserId: string, dto: CreateWageRateSchema) {
    const effectiveFromDate = new Date(dto.effectiveFrom);
    const targetUserId = dto.userId && dto.userId.trim() !== '' ? dto.userId.trim() : null;

    // Khóa đơn giá cũ trước đó của đối tượng này (Toàn hệ thống hoặc theo userId)
    await this.prisma.wageRate.updateMany({
      where: {
        userId: targetUserId,
        effectiveTo: null,
      },
      data: {
        effectiveTo: effectiveFromDate,
      },
    });

    // Tạo đơn giá mới
    const rate = await this.prisma.wageRate.create({
      data: {
        pricePerKg: dto.pricePerKg,
        userId: targetUserId,
        effectiveFrom: effectiveFromDate,
        createdBy: adminUserId,
      },
    });

    return this.prisma.wageRate.findUnique({
      where: { id: rate.id },
      include: {
        user: { select: { id: true, fullName: true, username: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.wageRate.findMany({
      include: {
        user: { select: { id: true, fullName: true, username: true } },
      },
      orderBy: [
        { createdAt: 'desc' },
        { effectiveFrom: 'desc' },
      ],
    });
  }

  async findCurrentRate(userId?: string) {
    const now = new Date();

    if (userId && userId.trim() !== '') {
      const userRate = await this.prisma.wageRate.findFirst({
        where: {
          userId: userId.trim(),
          effectiveFrom: { lte: now },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
        },
        orderBy: { effectiveFrom: 'desc' },
      });

      if (userRate) return userRate;
    }

    // Nếu không có đơn giá riêng cho user, dùng đơn giá chung của toàn hệ thống (userId: null)
    return this.prisma.wageRate.findFirst({
      where: {
        userId: null,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }
}
