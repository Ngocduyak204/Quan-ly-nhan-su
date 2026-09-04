import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

function extractRefreshToken(request: Request): string | null {
  let token: string | null = null;
  if (request?.cookies && request.cookies['refresh_token']) {
    token = request.cookies['refresh_token'];
  }
  if (!token && request?.headers?.cookie) {
    const cookies = request.headers.cookie.split('; ');
    const found = cookies.find((c) => c.startsWith('refresh_token='));
    if (found) {
      token = decodeURIComponent(found.split('=')[1]);
    }
  }
  if (!token && request?.body?.refreshToken) {
    token = request.body.refreshToken;
  }
  if (!token && request?.headers?.authorization) {
    token = request.headers.authorization.replace('Bearer ', '').trim();
  }
  return token;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => extractRefreshToken(request),
      ]),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') || 'super-secret-refresh-token-key-qlnv-sl-2026',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = extractRefreshToken(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc không tìm thấy');
    }
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      refreshToken,
    };
  }
}

