// src/servicios/auth/servicios-jwt.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ServiciosJwtGuard extends AuthGuard('servicio-jwt') {}
