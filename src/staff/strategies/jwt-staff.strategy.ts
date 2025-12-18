import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStaffStrategy extends PassportStrategy(Strategy, 'staff-jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.asmel_staff_token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'fallback_key',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      permisos: payload.permisos || [], // ✅ CLAVE ABSOLUTA
    };
  }
}
