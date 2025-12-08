import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtEmpresaGuard extends AuthGuard('empresa-jwt') {}
