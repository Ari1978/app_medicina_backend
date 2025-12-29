import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { ServicioUser, ServicioUserDocument } from './schemas/servicio-user.schema';
import { CreateServicioUserDto } from './dto/create-servicio-user.dto';

@Injectable()
export class ServicioUserService {
  constructor(
    @InjectModel(ServicioUser.name)
    private model: Model<ServicioUserDocument>,
  ) {}

  async crear(dto: CreateServicioUserDto) {
    const exists = await this.model.findOne({ username: dto.username });
    if (exists) {
      throw new BadRequestException('El usuario ya existe');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    return this.model.create({
      username: dto.username,
      password: hash,
    });
  }

  async listar() {
    return this.model.find().select('-password');
  }

  async actualizarPermisos(id: string, permisos: string[]) {
  return this.model
    .findByIdAndUpdate(
      id,
      { permisos },
      { new: true },
    )
    .select('-password');
}

}
