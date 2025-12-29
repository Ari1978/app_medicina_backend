// src/servicios/auth/servicios-jwt.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { SERVICIO_COOKIE } from '../../servicios/servicio.jwt';

@Injectable()
export class ServiciosJwtStrategy extends PassportStrategy(
  Strategy,
  'servicio-jwt',
) {
  constructor() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET no está definido');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[SERVICIO_COOKIE],
      ]),
      secretOrKey: secret,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
