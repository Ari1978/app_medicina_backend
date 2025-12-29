// src/servicios/auth/servicios-auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { ServicioUser } from '../schemas/servicio-user.schema';
import { signServicioToken } from '../../servicios/servicio.jwt';

@Injectable()
export class ServiciosAuthService {
  constructor(
    @InjectModel(ServicioUser.name)
    private readonly model: Model<ServicioUser>,
  ) {}

  async login(username: string, password: string) {
    const user = await this.model.findOne({ username });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const token = signServicioToken({
  id: user._id,
  role: 'servicios',
});


    return { user, token };
  }
}
