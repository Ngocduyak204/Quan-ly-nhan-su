import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ShiftStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustVolumeSchema, CheckinSchema, CheckoutSchema, ReviewShiftSchema } from './shifts.schema';
import { calculateHaversineDistanceMeters } from './utils/haversine.util';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async checkin(userId: string, dto: CheckinSchema, ip?: string, userAgent?: string) {
    const activeShift = await this.prisma.workShift.findFirst({
      where: {
        userId,
        status: ShiftStatus.WORKING,
      },
    });

    if (activeShift) {
      throw new BadRequestException('Bạn đang có một ca làm việc chưa Check-out');
    }

    const shift = await this.prisma.workShift.create({
      data: {
        userId,
        checkinTime: new Date(),
        checkinLat: dto.lat,
        checkinLng: dto.lng,
        checkinAccuracy: dto.accuracy,
        checkinPhotoUrl: dto.photoUrl,
        status: ShiftStatus.WORKING,
      },
    });

    await this.prisma.deviceLog.create({
      data: {
        userId,
        shiftId: shift.id,
        ipAddress: ip,
        userAgent,
        deviceFingerprint: dto.deviceFingerprint,
        action: 'CHECK_IN',
      },
    });

    return shift;
  }

  async checkout(userId: string, dto: CheckoutSchema, ip?: string, userAgent?: string) {
    const activeShift = await this.prisma.workShift.findFirst({
      where: {
        userId,
        status: ShiftStatus.WORKING,
      },
    });

    if (!activeShift) {
      throw new BadRequestException('Không tìm thấy phiên làm việc đang hoạt động để Check-out');
    }

    const distanceMeters = calculateHaversineDistanceMeters(
      activeShift.checkinLat,
      activeShift.checkinLng,
      dto.lat,
      dto.lng,
    );

    const anomalyReasons: string[] = [];
    let isAnomaly = false;

    if (distanceMeters > 100) {
      isAnomaly = true;
      anomalyReasons.push(`Khoảng cách Check-in ➔ Check-out vượt ngưỡng (${distanceMeters}m > 100m)`);
    }

    if (dto.accuracy > 50 || activeShift.checkinAccuracy > 50) {
      isAnomaly = true;
      anomalyReasons.push(`Độ chính xác GPS kém (Checkin: ${activeShift.checkinAccuracy}m, Checkout: ${dto.accuracy}m)`);
    }

    const currentRate = await this.getEffectiveWageRate(userId);
    const appliedRate = currentRate ? currentRate.pricePerKg : 0;
    const calculatedWage = dto.outputVolumeKg * appliedRate;

    const finalStatus = isAnomaly ? ShiftStatus.PENDING_REVIEW : ShiftStatus.COMPLETED;

    const updatedShift = await this.prisma.workShift.update({
      where: { id: activeShift.id },
      data: {
        checkoutTime: new Date(),
        checkoutLat: dto.lat,
        checkoutLng: dto.lng,
        checkoutAccuracy: dto.accuracy,
        checkoutPhotoUrl: dto.photoUrl,
        outputVolumeKg: dto.outputVolumeKg,
        volumeProofPhotoUrl: dto.volumeProofPhotoUrl,
        appliedWageRate: appliedRate,
        calculatedWage: calculatedWage,
        distanceMeters,
        isAnomaly,
        anomalyReasons,
        status: finalStatus,
      },
    });

    await this.prisma.deviceLog.create({
      data: {
        userId,
        shiftId: activeShift.id,
        ipAddress: ip,
        userAgent,
        deviceFingerprint: dto.deviceFingerprint,
        action: 'CHECK_OUT',
      },
    });

    return updatedShift;
  }

  async getActiveShift(userId: string) {
    return this.prisma.workShift.findFirst({
      where: {
        userId,
        status: ShiftStatus.WORKING,
      },
    });
  }

  async getMyShifts(userId: string) {
    return this.prisma.workShift.findMany({
      where: { userId },
      orderBy: { checkinTime: 'desc' },
    });
  }

  async findAllShifts(status?: ShiftStatus, isAnomaly?: boolean) {
    const where: any = {};
    if (status) where.status = status;
    if (isAnomaly !== undefined) where.isAnomaly = isAnomaly;

    return this.prisma.workShift.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            phone: true,
          },
        },
        shiftAuditLogs: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
      orderBy: { checkinTime: 'desc' },
    });
  }

  async adjustVolume(shiftId: string, adminUserId: string, dto: AdjustVolumeSchema) {
    const shift = await this.prisma.workShift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Không tìm thấy phiên làm việc');
    }

    const oldVolume = shift.outputVolumeKg || 0;
    const appliedRate = shift.appliedWageRate || 0;
    const newCalculatedWage = dto.newVolumeKg * appliedRate;

    const [updatedShift] = await this.prisma.$transaction([
      this.prisma.workShift.update({
        where: { id: shiftId },
        data: {
          outputVolumeKg: dto.newVolumeKg,
          calculatedWage: newCalculatedWage,
        },
      }),
      this.prisma.shiftAuditLog.create({
        data: {
          shiftId,
          changedBy: adminUserId,
          action: 'VOLUME_ADJUSTMENT',
          oldVolume,
          newVolume: dto.newVolumeKg,
          reason: dto.reason,
        },
      }),
    ]);

    return updatedShift;
  }

  async reviewShift(shiftId: string, adminUserId: string, dto: ReviewShiftSchema) {
    const shift = await this.prisma.workShift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Không tìm thấy phiên làm việc');
    }

    const [updatedShift] = await this.prisma.$transaction([
      this.prisma.workShift.update({
        where: { id: shiftId },
        data: {
          status: dto.status,
        },
      }),
      this.prisma.shiftAuditLog.create({
        data: {
          shiftId,
          changedBy: adminUserId,
          action: 'STATUS_REVIEW',
          oldStatus: shift.status,
          newStatus: dto.status,
          reason: dto.reason || 'Admin duyệt phiên làm việc',
        },
      }),
    ]);

    return updatedShift;
  }

  private async getEffectiveWageRate(userId: string) {
    const now = new Date();
    const userRate = await this.prisma.wageRate.findFirst({
      where: {
        userId,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (userRate) return userRate;

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
