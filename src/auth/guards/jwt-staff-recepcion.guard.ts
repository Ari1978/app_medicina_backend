
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { JwtStaffGuard } from '../guards/staff-jwt.guard';

@Injectable()
export class JwtStaffRecepcionGuard extends JwtStaffGuard
  implements CanActivate
{
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero validamos JWT normal de staff
    const autorizado = await super.canActivate(context);
    if (!autorizado) return false;

    const request = context.switchToHttp().getRequest();
    const staff = request.user;

    if (!staff?.permisos?.includes('recepcion')) {
      throw new ForbiddenException('No tenés permisos para RECEPCIÓN');
    }

    return true;
  }
}
