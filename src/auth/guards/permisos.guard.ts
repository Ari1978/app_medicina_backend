
import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export class PermisoGuard implements CanActivate {
  constructor(private permiso: string) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (user.role === 'superadmin') return true;
    if (user.permisos?.includes(this.permiso)) return true;

    throw new ForbiddenException('No tenés permisos para esta acción');
  }
}
