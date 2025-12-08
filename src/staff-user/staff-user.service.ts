import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { StaffUser } from './staff-user.schema';

@Injectable()
export class StaffUserService {
  constructor(
    @InjectModel(StaffUser.name)
    private readonly staffModel: Model<StaffUser>,
  ) {}

  async create(username: string, password: string) {
    const exists = await this.staffModel.findOne({ username });
    if (exists) throw new Error('El usuario ya existe');

    const hashed = await bcrypt.hash(password, 10);

    return this.staffModel.create({
      username,
      password: hashed,
      permisos: [],
    });
  }

  getAll() {
    return this.staffModel.find();
  }

  delete(id: string) {
    return this.staffModel.findByIdAndDelete(id);
  }

  async asignarPermisos(id: string, permisos: string[]) {
    return this.staffModel.findByIdAndUpdate(
      id,
      { permisos },
      { new: true },
    );
  }

  async resetPassword(id: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);

    return this.staffModel.findByIdAndUpdate(
      id,
      { password: hashed },
      { new: true },
    );
  }
}
