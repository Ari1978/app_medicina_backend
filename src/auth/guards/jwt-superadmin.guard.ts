import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtSuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const token = request.cookies?.asmel_superadmin_token;

    if (!token) {
      throw new UnauthorizedException('No autenticado como superadmin');
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new UnauthorizedException('JWT_SECRET no configurado');
    }

    try {
      const payload = jwt.verify(token, secret) as any;

      if (payload.role !== 'superadmin') {
        throw new UnauthorizedException('Rol inválido');
      }

      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
