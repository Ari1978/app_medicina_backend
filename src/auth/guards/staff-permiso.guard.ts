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
    const permiso = this.reflector.get<string>(
      STAFF_PERMISO_KEY,
      context.getHandler(),
    );

    // Si el endpoint no pide permiso → pasa
    if (!permiso) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('ROLE:', user?.role);
  console.log('PERMISOS:', user?.permisos);
  console.log('PERMISO REQUERIDO:', permiso);

    if (!user) {
      throw new ForbiddenException('No autenticado');
    }

    // 👉 MÉDICO: pasa siempre
    if (user.role === 'medico') {
      return true;
    }

    // 👉 STAFF: validar permiso
    if (
      user.role === 'staff' &&
      Array.isArray(user.permisos) &&
      user.permisos.includes(permiso)
    ) {
      return true;
    }

    throw new ForbiddenException(
      `No tenés permiso para realizar esta acción`,
    );
  }
}
