import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { STAFF_PERMISO_KEY } from '../decorators/staff-permiso.decorator';

@Injectable()
export class StaffPermisoGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1) Leer permiso requerido desde el decorador
    const permisoRequerido = this.reflector.getAllAndOverride<string>(
      STAFF_PERMISO_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permisoRequerido) return true;

    // 2) Obtener usuario del request
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('No autenticado');
    }

    // 3) Validar que sea STAFF
    if (user.role !== 'staff') {
      throw new ForbiddenException('Solo staff puede acceder');
    }

    // 4) Verificar que tenga el permiso dentro de su array
    if (!user.permisos || !user.permisos.includes(permisoRequerido)) {
      throw new ForbiddenException(
        `No tenés permiso para acceder a: ${permisoRequerido}`,
      );
    }

    return true;
  }
}
