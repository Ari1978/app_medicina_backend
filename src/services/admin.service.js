// src/services/admin.service.js
import bcrypt from "bcryptjs";
import Admin from "../models/admin.model.js";
import Staff from "../models/staffUser.model.js";
import User from "../models/user.model.js";

export const AdminService = {

  /* ======================================================
     🔐 LOGIN ADMIN / SUPERADMIN
  ====================================================== */
  async login(username, password) {
    const admin = await Admin.findOne({ username, activo: true });
    if (!admin) throw new Error("Usuario o contraseña inválidos");

    const ok = await admin.comparePassword(password);
    if (!ok) throw new Error("Usuario o contraseña inválidos");

    admin.role = admin.superadmin ? "superadmin" : "admin";
    return admin;
  },

  /* ======================================================
     👑 CREAR ADMIN (Solo SuperAdmin)
  ====================================================== */
  async crearAdmin(data, actor) {
    if (!actor || !actor.superadmin) {
      throw new Error("Solo el SuperAdmin puede crear administradores");
    }

    return await Admin.create({
      username: data.username.trim(),
      password: data.password,
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      superadmin: !!data.superadmin,
      activo: true,
    });
  },

  /* ======================================================
     🧑‍💼 CREAR STAFF (Admin + SuperAdmin)
  ====================================================== */
  async crearStaff(data, actor) {
    if (!actor || !["admin", "superadmin"].includes(actor.role)) {
      throw new Error("Solo Admin/SuperAdmin pueden crear Staff");
    }

    const exists = await Staff.findOne({ username: data.username.trim() });
    if (exists) throw new Error("El username ya está en uso");

    return await Staff.create({
      username: data.username.trim(),
      password: data.password,
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      role: "staff",
      permisos: Array.isArray(data.permisos) ? data.permisos : [],
      activo: true,
      creadoPor: { userId: actor._id, role: actor.role },
    });
  },

  /* ======================================================
     🏢 CREAR EMPRESA (User)
  ====================================================== */
  async crearEmpresa(data) {
    const existe = await User.findOne({ cuit: data.cuit });
    if (existe) throw new Error("Ya existe una empresa con ese CUIT");

    const hashed = await bcrypt.hash(data.password, 10);

    const nueva = await User.create({
      empresa: data.empresa.trim(),
      cuit: data.cuit.trim(),
      contacto: {
        nombre: data.contactoNombre.trim(),
        email: data.contactoEmail.trim(),
      },
      password: hashed,
      role: "user",
      activo: true,
    });

    return {
      _id: nueva._id,
      empresa: nueva.empresa,
      cuit: nueva.cuit,
      contacto: nueva.contacto,
      role: nueva.role,
    };
  },

  /* ======================================================
     📋 LISTAR ADMINS + STAFF
  ====================================================== */
  async listarAdminsYStaff() {
    const admins = await Admin.find({}, "-password -__v").lean();
    const staff = await Staff.find({}, "-password -__v").lean();

    return [...admins, ...staff].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  /* ======================================================
     🔎 BUSCAR USUARIO POR CUIT
  ====================================================== */
  async buscarUsuarioPorCuit(cuit) {
    if (!cuit || !cuit.trim()) return null;
    return await User.findOne(
      { cuit: cuit.trim(), role: "user" },
      "-password -__v"
    ).lean();
  },

  /* ======================================================
     📊 RESUMEN SUPERADMIN
  ====================================================== */
  async resumenSuperadmin() {
    const empresas = await User.countDocuments({ role: "user" });
    const staff = await Staff.countDocuments();
    const admins = await Admin.countDocuments();

    return { empresas, staff, admins };
  },

  /* ======================================================
     👥 LISTAR TODOS LOS USUARIOS
  ====================================================== */
  async listarUsuariosSistema() {
    return await User.find({}, "-password -__v").lean();
  },

  /* ======================================================
     📥 IMPORTAR USUARIOS DESDE EXCEL
  ====================================================== */
  async importarUsuarios(lista) {
    if (!Array.isArray(lista)) throw new Error("Formato inválido");

    let creados = 0;
    let existentes = 0;

    for (const u of lista) {
      if (!u.cuit || !u.empresa) {
        existentes++;
        continue;
      }

      const exists = await User.findOne({ cuit: u.cuit });
      if (exists) {
        existentes++;
        continue;
      }

      await User.create({
        empresa: u.empresa,
        cuit: u.cuit,
        contacto: { nombre: u.empresa, email: "" },
        password: "temporal123",
      });

      creados++;
    }

    return { creados, existentes };
  },
};
