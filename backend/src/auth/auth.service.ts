import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordSchema, ForgotPasswordSchema, LoginSchema, RegisterSchema, UpdateProfileSchema } from './auth.schema';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterSchema) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new BadRequestException('Tên đăng nhập đã tồn tại');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        address: dto.address,
        role: dto.role || 'WORKER',
      },
    });

    const tokens = await this.getTokens(user.id, user.username, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    const { passwordHash: _, hashedRefreshToken: __, ...userProfile } = user;

    return {
      user: userProfile,
      tokens,
    };
  }

  async login(dto: LoginSchema) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    const tokens = await this.getTokens(user.id, user.username, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    const { passwordHash: _, hashedRefreshToken: __, ...userProfile } = user;

    return {
      user: userProfile,
      tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRefreshToken: null,
        lastLogoutAt: new Date(),
      },
    });
    return { message: 'Đăng xuất thành công, toàn bộ Access Token và Refresh Token đã bị thu hồi' };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.hashedRefreshToken || user.status !== 'ACTIVE') {
      throw new ForbiddenException('Truy cập bị từ chối');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Refresh Token không chính xác hoặc đã bị thu hồi');
    }

    const tokens = await this.getTokens(user.id, user.username, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async changePassword(userId: string, dto: ChangePasswordSchema) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const passwordMatches = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        hashedRefreshToken: null,
        lastLogoutAt: new Date(),
      },
    });

    return { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' };
  }

  async updateProfile(userId: string, dto: UpdateProfileSchema) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async forgotPassword(dto: ForgotPasswordSchema) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user) {
      throw new NotFoundException('Tên đăng nhập không tồn tại trên hệ thống');
    }

    return {
      message: 'Yêu cầu của bạn đã được gửi. Vui lòng liên hệ Quản trị viên (Admin) để xác minh và nhận lại mật khẩu mới.',
      supportContact: '0901234567',
    };
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hash },
    });
  }

  async getTokens(userId: string, username: string, role: string) {
    const jwtPayload = {
      sub: userId,
      username,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET') || 'super-secret-access-token-key-qlnv-sl-2026',
        expiresIn: (this.config.get<string>('JWT_ACCESS_EXPIRATION') || '1d') as any,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'super-secret-refresh-token-key-qlnv-sl-2026',
        expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
