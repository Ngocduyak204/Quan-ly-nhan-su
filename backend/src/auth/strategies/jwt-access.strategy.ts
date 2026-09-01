import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserStatus } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') || 'super-secret-access-token-key-qlnv-sl-2026',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tài khoản đã bị khóa hoặc không tồn tại');
    }

    // Kiểm tra thu hồi Access Token lập tức nếu token phát hành trước/trong thời điểm Logout
    if (user.lastLogoutAt && payload.iat) {
      const tokenIssuedAtMs = payload.iat * 1000;
      const lastLogoutAtMs = user.lastLogoutAt.getTime();
      if (tokenIssuedAtMs <= lastLogoutAtMs) {
        throw new UnauthorizedException('Access Token đã bị thu hồi do người dùng đã đăng xuất');
      }
    }

    const { passwordHash, hashedRefreshToken, ...result } = user;
    return result;
  }
}
