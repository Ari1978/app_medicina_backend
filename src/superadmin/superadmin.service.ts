import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';

import { Admin } from '../admin/schemas/admin.schema';
import { StaffUser } from '../staff-user/staff-user.schema';
import { EmpresaPrecargada } from '../empresa/schemas/empresaPrecargada.schema';
import { Empresa } from '../empresa/schemas/empresa.schema';
import { Localidad } from '../zona-geografica/schemas/localidad.schema';
import { PerfilExamen } from '../perfil-examen/schemas/perfil-examen.schema';

import { EmpresaService } from '../empresa/empresa.service';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly jwt: JwtService,
    private readonly empresaService: EmpresaService,

    @InjectModel(Admin.name)
    private readonly adminModel: Model<Admin>,

    @InjectModel(StaffUser.name)
    private readonly staffModel: Model<StaffUser>,

    @InjectModel(EmpresaPrecargada.name)
    private readonly empresaPrecargadaModel: Model<EmpresaPrecargada>,

    @InjectModel(Empresa.name)
    private readonly empresaFinalModel: Model<Empresa>,

    @InjectModel(Localidad.name)
    private readonly localidadModel: Model<Localidad>,

    @InjectModel(PerfilExamen.name)
    private readonly perfilExamenModel: Model<PerfilExamen>,
  ) {}

  // ============================================================
  // ✅ LOGIN SUPERADMIN
  // ============================================================
  async login(username: string, password: string) {
    const superAdmin = await this.adminModel.findOne({
      username,
      role: 'superadmin',
    });

    if (!superAdmin) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(password, superAdmin.password);
    if (!ok) throw new UnauthorizedException('Contraseña incorrecta');

    const token = this.jwt.sign({
      id: superAdmin._id,
      role: 'superadmin',
    });

    return { superAdmin, token };
  }

  // ============================================================
  // ✅ ADMIN CRUD
  // ============================================================
  async crearAdmin(username: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.adminModel.create({
      username,
      password: hashed,
      role: 'admin',
      permisos: [],
    });
  }

  listarAdmins() {
    return this.adminModel.find({ role: 'admin' });
  }

  async editarAdmin(id: string, data: { username?: string; password?: string }) {
    const updateData: any = {};
    if (data.username) updateData.username = data.username;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    const admin = await this.adminModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!admin) throw new NotFoundException('Admin no encontrado');
    return { message: 'Admin actualizado correctamente', admin };
  }

  async resetAdminPassword(id: string, password: string) {
    const admin = await this.adminModel.findById(id);
    if (!admin) throw new NotFoundException('Admin no encontrado');

    admin.password = await bcrypt.hash(password, 10);
    await admin.save();

    return { message: 'Contraseña reseteada correctamente' };
  }

  async eliminarAdmin(id: string) {
    const deleted = await this.adminModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Admin no encontrado');
    return { message: 'Admin eliminado' };
  }

  permisosAdmin(id: string, permisos: string[]) {
    return this.adminModel.findByIdAndUpdate(id, { permisos }, { new: true });
  }

  // ============================================================
  // ✅ STAFF CRUD
  // ============================================================
  async crearStaff(username: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.staffModel.create({
      username,
      password: hashed,
      permisos: [],
    });
  }

  listarStaff() {
    return this.staffModel.find();
  }

  async editarStaff(id: string, data: { username?: string; password?: string }) {
    const updateData: any = {};
    if (data.username) updateData.username = data.username;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    const staff = await this.staffModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!staff) throw new NotFoundException('Staff no encontrado');
    return { message: 'Staff actualizado correctamente', staff };
  }

  async resetStaffPassword(id: string, password: string) {
    const staff = await this.staffModel.findById(id);
    if (!staff) throw new NotFoundException('Staff no encontrado');

    staff.password = await bcrypt.hash(password, 10);
    await staff.save();

    return { message: 'Contraseña reseteada correctamente' };
  }

  async eliminarStaff(id: string) {
    const deleted = await this.staffModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Staff no encontrado');
    return { message: 'Staff eliminado' };
  }

  permisosStaff(id: string, permisos: string[]) {
    return this.staffModel.findByIdAndUpdate(id, { permisos }, { new: true });
  }

  // ============================================================
  // ✅ EMPRESAS PRECARGADAS
  // ============================================================
  crearEmpresaPrecargada(data: { cuit: string; razonSocial: string }) {
    return this.empresaPrecargadaModel.create({
      cuit: data.cuit,
      razonSocial: data.razonSocial,
      habilitado: true,
    });
  }

  listarEmpresasPrecargadas() {
    return this.empresaPrecargadaModel.find();
  }

  // ============================================================
  // ✅ EMPRESAS FINALES
  // ============================================================
  listarEmpresasFinales() {
    return this.empresaFinalModel.find();
  }

  async editarEmpresaFinal(id: string, data: any) {
    const empresa = await this.empresaFinalModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return { message: 'Empresa actualizada', empresa };
  }

  async resetPasswordEmpresaFinal(id: string, password: string) {
    const empresa = await this.empresaFinalModel.findById(id);
    if (!empresa) throw new NotFoundException('Empresa no encontrada');

    empresa.password = await bcrypt.hash(password, 10);
    await empresa.save();

    return { message: 'Contraseña reseteada correctamente' };
  }

  async eliminarEmpresaFinal(id: string) {
    const empresa = await this.empresaFinalModel.findByIdAndDelete(id);
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return { message: 'Empresa eliminada' };
  }

  // ============================================================
  // ✅ IMPORTAR EMPRESAS EXCEL
  // ============================================================
 async importarEmpresas(file: Express.Multer.File) {
  if (!file) throw new BadRequestException('Archivo requerido');

  console.log('📦 Archivo recibido:', file.originalname);

  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  console.log('📊 Filas leídas del Excel:', rows.length);
  console.log('🧾 Primer fila:', rows[0]);

  let insertadas = 0;
  let omitidas = 0;

  for (const row of rows as any[]) {
  console.log('➡️ Procesando fila:', row);

  // ✅ CORRECCIÓN REAL DE NOMBRES
  const cuit = String(row['cuit '] || row.cuit || '').trim();
  const razonSocial = String(row.razonSocial || '').trim();
  const email1 = String(row.email || row.email1 || '').trim();

  console.log('🔎 Datos parseados CORRECTOS:', { cuit, razonSocial, email1 });

  if (!cuit || !razonSocial || !email1) {
    console.warn('⚠️ Fila omitida por campos vacíos');
    omitidas++;
    continue;
  }

  const existe = await this.empresaService.findByCuit(cuit);

  if (existe) {
    console.warn('⛔ CUIT ya existe en BD:', cuit);
    omitidas++;
    continue;
  }

  console.log('✅ Insertando empresa:', cuit);

  await this.empresaService.createFromImport({
    cuit,
    razonSocial,
    email1,
  });

  insertadas++;
}


  console.log('✅ RESULTADO FINAL:', {
    insertadas,
    omitidas,
    total: rows.length,
  });

  return {
    message: 'Importación finalizada correctamente',
    insertadas,
    omitidas,
    total: rows.length,
  };
}


  // ============================================================
  // ✅ PERFILES DE EXAMEN POR EMPRESA (SUPERADMIN)
  // ============================================================
  crearPerfilExamen(data: {
    empresaId: string;
    puesto: string;
    estudios: { nombre: string; sector: string }[];
  }) {
    return this.perfilExamenModel.create({
      empresa: data.empresaId,
      nombre: data.puesto,
      estudios: data.estudios,
    });
  }

  listarPerfilesEmpresa(empresaId: string) {
    return this.perfilExamenModel.find({ empresa: empresaId });
  }

  async editarPerfilExamen(id: string, data: any) {
    const perfil = await this.perfilExamenModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!perfil) throw new NotFoundException('Perfil no encontrado');
    return perfil;
  }

  async eliminarPerfilExamen(id: string) {
    const perfil = await this.perfilExamenModel.findByIdAndDelete(id);
    if (!perfil) throw new NotFoundException('Perfil no encontrado');
    return { message: 'Perfil eliminado' };
  }

  // ============================================================
  // ✅ STATS
  // ============================================================
  async getStats() {
    const empresas = await this.empresaFinalModel.countDocuments();
    const empresasActivas = await this.empresaFinalModel.countDocuments({ activo: true });
    const empresasInactivas = empresas - empresasActivas;

    const admins = await this.adminModel.countDocuments({ role: 'admin' });
    const staff = await this.staffModel.countDocuments();
    const localidades = await this.localidadModel.countDocuments();

    return {
      empresasTotal: empresas,
      empresasActivas,
      empresasInactivas,
      admins,
      staff,
      localidades,
    };
  }
}
