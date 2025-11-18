// src/services/admin.service.js
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository.js";

export const AdminService = {

  /* =========================================================
     🔐 LOGIN ADMIN / SUPERADMIN
  ========================================================= */
  async login(username, password) {
    const admin = await UserRepository.findByUsername(username);

    if (!admin) throw new Error("Credenciales incorrectas");

    const match = await bcrypt.compare(password, admin.password);
    if (!match) throw new Error("Credenciales incorrectas");

    return admin; // el controller aplica DTO
  },

  /* =========================================================
     🛠️ CREAR ADMIN
  ========================================================= */
  async crearAdmin(data, creador) {
    const { username, password, nombre, apellido, superadmin } = data;

    const existe = await UserRepository.findByUsername(username);
    if (existe) throw new Error("El usuario ya existe");

    const hash = await bcrypt.hash(password, 10);

    return await UserRepository.crear({
      username,
      password: hash,
      nombre,
      apellido,
      role: "admin",
      superadmin: superadmin === true,
      creadoPor: creador._id,
    });
  },

  /* =========================================================
     🧑‍💼 CREAR STAFF
  ========================================================= */
  async crearStaff(data, creador) {
    const { username, password, nombre, apellido, permisos } = data;

    const existe = await UserRepository.findByUsername(username);
    if (existe) throw new Error("El usuario ya existe");

    const hash = await bcrypt.hash(password, 10);

    return await UserRepository.crear({
      username,
      password: hash,
      nombre,
      apellido,
      role: "staff",
      permisos: Array.isArray(permisos) ? permisos : [],
      creadoPor: creador._id,
    });
  },

  /* =========================================================
     🏢 CREAR EMPRESA (ROLE USER)
  ========================================================= */
  async crearEmpresa(data) {
    const { empresa, cuit, contactoNombre, contactoEmail, password } = data;

    const existe = await UserRepository.findByCuit(cuit);
    if (existe) throw new Error("La empresa ya existe");

    const hash = await bcrypt.hash(password, 10);

    return await UserRepository.crear({
      empresa,
      cuit,
      contacto: { nombre: contactoNombre, email: contactoEmail },
      password: hash,
      role: "user",
      perfilesExamen: [], // <--- LISTA DE PERFILES VACÍA AL CREAR
    });
  },

  /* =========================================================
     📋 LISTAR ADMINS + STAFF
  ========================================================= */
  async listarAdminsYStaff() {
    return await UserRepository.findAdminsAndStaff();
  },
};
