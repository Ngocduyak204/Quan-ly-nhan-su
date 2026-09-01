import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWageRateSchema } from './wage-rates.schema';

@Injectable()
export class WageRatesService {
  constructor(private prisma: PrismaService) {}

  async create(adminUserId: string, dto: CreateWageRateSchema) {
    const effectiveFromDate = new Date(dto.effectiveFrom);

    await this.prisma.wageRate.updateMany({
      where: {
        userId: dto.userId || null,
        effectiveTo: null,
      },
      data: {
        effectiveTo: effectiveFromDate,
      },
    });

    const rate = await this.prisma.wageRate.create({
      data: {
        pricePerKg: dto.pricePerKg,
        userId: dto.userId || null,
        effectiveFrom: effectiveFromDate,
        createdBy: adminUserId,
      },
    });

    return rate;
  }

  async findAll() {
    return this.prisma.wageRate.findMany({
      include: {
        user: { select: { fullName: true, username: true } },
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async findCurrentRate(userId?: string) {
    const now = new Date();
    return this.prisma.wageRate.findFirst({
      where: {
        userId: userId || null,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }
}
