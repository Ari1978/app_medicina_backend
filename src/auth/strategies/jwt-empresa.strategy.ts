import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtEmpresaStrategy extends PassportStrategy(Strategy, 'empresa-jwt') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('Falta variable JWT_SECRET');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.asmel_empresa_token || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret as string,   // ✔ aseguramos string
    });
  }

  validate(payload: any) {
    return payload; 
  }
}
