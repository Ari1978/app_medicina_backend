import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Staff } from './schemas/staff.schema';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name)
    private readonly staffModel: Model<Staff>,
  ) {}

  // ============================================================
  // ---------------------- LOGIN STAFF --------------------------
  // ============================================================
  async login(username: string, password: string) {
    const staff = await this.staffModel.findOne({ username });

    if (!staff) {
      throw new UnauthorizedException('Usuario incorrecto');
    }

    const bcrypt = await import('bcryptjs');
    const ok = await bcrypt.compare(password, staff.password);

    if (!ok) {
      throw new UnauthorizedException('Password incorrecto');
    }

    const payload = {
      id: staff._id.toString(),
      role: staff.role ?? 'staff',
      username: staff.username,
      permisos: Array.isArray(staff.permisos) ? staff.permisos : [],
    };

    const token = this.signStaffToken(payload);

    return {
      message: 'Login staff OK',
      token,
      staff: {
        id: staff._id.toString(),
        username: staff.username,
        role: staff.role ?? "staff",
        permisos: payload.permisos,
      },
    };
  }

  private signStaffToken(payload: any) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
  }
}
