import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtEmpresaGuard extends AuthGuard('empresa-jwt') {
  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    // ✅ 1. PRIORIDAD: COOKIE
    if (req.cookies?.asmel_empresa_token) {
      req.headers.authorization = `Bearer ${req.cookies.asmel_empresa_token}`;
    }

    // ✅ 2. RESPALDO: Authorization Header si existe
    if (!req.headers.authorization && req.headers.cookie) {
      const match = req.headers.cookie.match(/asmel_empresa_token=([^;]+)/);
      if (match) {
        req.headers.authorization = `Bearer ${match[1]}`;
      }
    }

    return req;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new UnauthorizedException('Empresa no autenticada');
    }
    return user;
  }
}
