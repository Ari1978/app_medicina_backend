// src/services/admin.service.js
import Admin from "../models/admin.model.js";
import Staff from "../models/staffUser.model.js";
import User from "../models/user.model.js"; // usuarios normales

export const AdminService = {
  // ---------------- LOGIN ----------------
  async login(username, password) {
    const admin = await Admin.findOne({ username, activo: true });
    if (!admin) throw new Error("Usuario o contraseña inválidos");
    const ok = await admin.comparePassword(password);
    if (!ok) throw new Error("Usuario o contraseña inválidos");
    admin.role = admin.superadmin ? "superadmin" : "admin";
    return admin;
  },

  // ---------------- CREAR ADMIN ----------------
  async crearAdmin(data, actor) {
    if (!actor || !actor.superadmin) {
      throw new Error("Solo el SuperAdmin puede crear administradores");
    }
    return await Admin.create({
      username: data.username.trim(),
      password: data.password, // pre-save hashea
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      superadmin: !!data.superadmin,
      activo: true,
    });
  },

  // ---------------- CREAR STAFF ----------------
  async crearStaff(data, actor) {
    if (!actor || !["admin", "superadmin"].includes(actor.role)) {
      throw new Error("Solo Admin/SuperAdmin pueden crear Staff");
    }

    const exists = await Staff.findOne({ username: data.username.trim() });
    if (exists) throw new Error("El username ya está en uso");

    const nuevo = await Staff.create({
      username: data.username.trim(),
      password: data.password, // pre-save hashea
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      role: "staff",
      permisos: Array.isArray(data.permisos) ? data.permisos : [],
      activo: true,
      creadoPor: { userId: actor._id, role: actor.role }, // auditoría
    });

    return nuevo;
  },

  // ---------------- LISTAR ADMINS + STAFF ----------------
  async listarAdminsYStaff() {
    const admins = await Admin.find({}, "-password -__v").lean();
    const staff = await Staff.find({}, "-password -__v").lean();
    // Ordenar por fecha de creación descendente
    return [...admins, ...staff].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // ---------------- BUSCAR USUARIO POR CUIT ----------------
  async buscarUsuarioPorCuit(cuit) {
    if (!cuit || !cuit.trim()) return null;
    const user = await User.findOne({ cuit: cuit.trim(), role: "user" }, "-password -__v").lean();
    return user || null;
  },
};
