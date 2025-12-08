import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Admin } from '../admin/schemas/admin.schema';

@Injectable()
export class SuperAdminSeed implements OnModuleInit {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<Admin>,
  ) {}

  async onModuleInit() {
    const superAdminUser = process.env.SUPERADMIN_USER;
    const superAdminPass = process.env.SUPERADMIN_PASS;

    if (!superAdminUser || !superAdminPass) {
      console.log('⚠ No se creó SuperAdmin (faltan variables en .env)');
      return;
    }

    const exists = await this.adminModel.findOne({
      username: superAdminUser,
      role: 'superadmin',
    });

    if (exists) {
      console.log('⚡ SuperAdmin ya existe');
      return;
    }

    const hashed = await bcrypt.hash(superAdminPass, 10);

    await this.adminModel.create({
      username: superAdminUser,
      password: hashed,
      role: 'superadmin',
      permisos: ['*'],
    });

    console.log('🔥 SuperAdmin creado correctamente');
  }
}
