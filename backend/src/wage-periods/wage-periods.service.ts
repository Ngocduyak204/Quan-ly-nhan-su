import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWagePeriodSchema } from './wage-periods.schema';

@Injectable()
export class WagePeriodsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWagePeriodSchema) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
    }

    return this.prisma.wagePeriod.create({
      data: {
        name: dto.name,
        startDate,
        endDate,
      },
    });
  }

  async findAll() {
    return this.prisma.wagePeriod.findMany({
      include: {
        locker: { select: { fullName: true } },
        _count: { select: { workShifts: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async lockPeriod(id: string, adminUserId: string) {
    const period = await this.prisma.wagePeriod.findUnique({
      where: { id },
    });

    if (!period) {
      throw new NotFoundException('Không tìm thấy kỳ tiền công');
    }

    if (period.isLocked) {
      throw new BadRequestException('Kỳ tiền công này đã được chốt trước đó');
    }

    await this.prisma.workShift.updateMany({
      where: {
        checkinTime: {
          gte: period.startDate,
          lte: period.endDate,
        },
        wagePeriodId: null,
      },
      data: {
        wagePeriodId: period.id,
      },
    });

    return this.prisma.wagePeriod.update({
      where: { id },
      data: {
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: adminUserId,
      },
    });
  }
}
