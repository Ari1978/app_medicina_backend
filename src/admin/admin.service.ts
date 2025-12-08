import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Admin } from './schemas/admin.schema';
import { Staff } from '../staff/schemas/staff.schema';
import { signAdminToken } from './admin.jwt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    @InjectModel(Staff.name) private staffModel: Model<Staff>,
  ) {}

  // ============================================================
  // ✔ OBTENER TODOS LOS ADMINS (sin passwords)
  // ============================================================
  async getAll() {
    return this.adminModel.find().select('-password');
  }

  // ============================================================
  // ✔ CREAR ADMIN
  // ============================================================
  async create(username: string, password: string) {
    const exists = await this.adminModel.findOne({ username });
    if (exists) throw new Error('Ese admin ya existe');

    const hashed = await bcrypt.hash(password, 10);

    const admin = await this.adminModel.create({
      username,
      password: hashed,
      role: 'admin',
    });

    return {
      message: 'Admin creado',
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    };
  }

  // ============================================================
  // ✔ LOGIN
  // ============================================================
  async validateLogin(username: string, password: string) {
    const admin = await this.adminModel.findOne({ username });
    if (!admin) throw new Error('Usuario no encontrado');

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) throw new Error('Credenciales inválidas');

    const token = signAdminToken({
      id: admin._id,
      role: admin.role,
      username: admin.username,
    });

    return { admin, token };
  }

  // ============================================================
  // ✔ ME
  // ============================================================
  async me(id: string) {
    return this.adminModel.findById(id).select('-password');
  }

  async update(id: string, data: { username?: string; password?: string }) {
  const updateData: any = {};

  if (data.username) updateData.username = data.username;
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const admin = await this.adminModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!admin) throw new NotFoundException('Admin no encontrado');

  return {
    message: 'Admin actualizado correctamente',
    admin,
  };
}


  // ============================================================
  // ✔ ELIMINAR ADMIN
  // ============================================================
  async delete(id: string) {
    return this.adminModel.findByIdAndDelete(id);
  }

  // ============================================================
  // ✔ ASIGNAR PERMISOS A STAFF (FINAL Y CORRECTO)
  // ============================================================
  async asignarPermisosAStaff(staffId: string, permisos: string[]) {
    const staff = await this.staffModel.findById(staffId);

    if (!staff) throw new NotFoundException('Staff no encontrado');
    if (staff.role !== 'staff')
      throw new ForbiddenException('Solo se pueden asignar permisos a Staff');

    staff.permisos = permisos;
    return staff.save();
  }

  // ============================================================
  // ✔ EDITAR STAFF
  // ============================================================
  async editarStaff(id: string, data: Partial<Staff>) {
    const staff = await this.staffModel.findByIdAndUpdate(id, data, { new: true });
    if (!staff) throw new NotFoundException('Staff no encontrado');
    return staff;
  }

  // ============================================================
  // ✔ ELIMINAR STAFF
  // ============================================================
  async eliminarStaff(id: string) {
    const staff = await this.staffModel.findByIdAndDelete(id);
    if (!staff) throw new NotFoundException('Staff no encontrado');
    return { message: 'Staff eliminado' };
  }

  // ============================================================
  // ✔ CAMBIAR ESTADO (activo / inactivo)
  // ============================================================
  async cambiarEstadoStaff(id: string, activo: boolean) {
    const staff = await this.staffModel.findByIdAndUpdate(id, { activo }, { new: true });
    if (!staff) throw new NotFoundException('Staff no encontrado');
    return staff;
  }
}
