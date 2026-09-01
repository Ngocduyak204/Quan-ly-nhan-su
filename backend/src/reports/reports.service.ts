import { Injectable } from '@nestjs/common';
import { ShiftStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(startDate?: string, endDate?: string) {
    const where: any = {
      status: { in: [ShiftStatus.COMPLETED, ShiftStatus.APPROVED] },
    };

    if (startDate || endDate) {
      where.checkinTime = {};
      if (startDate) where.checkinTime.gte = new Date(startDate);
      if (endDate) where.checkinTime.lte = new Date(endDate);
    }

    const shifts = await this.prisma.workShift.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, fullName: true } },
      },
    });

    // Gom nhóm theo từng nhân công
    const workerMap = new Map<string, { userId: string; username: string; fullName: string; totalVolumeKg: number; totalWage: number; shiftCount: number }>();

    let totalVolumeAll = 0;
    let totalWageAll = 0;

    for (const shift of shifts) {
      const vol = shift.outputVolumeKg || 0;
      const wage = shift.calculatedWage || 0;

      totalVolumeAll += vol;
      totalWageAll += wage;

      if (!workerMap.has(shift.userId)) {
        workerMap.set(shift.userId, {
          userId: shift.userId,
          username: shift.user.username,
          fullName: shift.user.fullName,
          totalVolumeKg: 0,
          totalWage: 0,
          shiftCount: 0,
        });
      }

      const item = workerMap.get(shift.userId)!;
      item.totalVolumeKg += vol;
      item.totalWage += wage;
      item.shiftCount += 1;
    }

    return {
      summary: {
        totalWorkers: workerMap.size,
        totalShifts: shifts.length,
        totalVolumeKg: totalVolumeAll,
        totalWage: totalWageAll,
      },
      workers: Array.from(workerMap.values()),
    };
  }
}
