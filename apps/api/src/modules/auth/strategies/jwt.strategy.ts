import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub || payload.id },
      include: {
        storeAdminAssignment: { include: { store: true } },
        riderProfile: true,
        customerProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is deactivated or session invalid');
    }

    return {
      id: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      fullName: user.fullName,
      store: user.storeAdminAssignment?.store || null,
      riderProfile: user.riderProfile || null,
    };
  }
}
