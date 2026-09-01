import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.body?.refreshToken || request?.headers?.authorization?.replace('Bearer ', '');
        },
      ]),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') || 'super-secret-refresh-token-key-qlnv-sl-2026',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req?.body?.refreshToken || req?.headers?.authorization?.replace('Bearer ', '');
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      refreshToken,
    };
  }
}
