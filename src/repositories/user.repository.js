// src/repositories/user.repository.js
// ---------------------------------------------------
// Repositorio unificado para Empresas / Staff / Admin
// ---------------------------------------------------

import User from "../models/user.model.js";
import Admin from "../models/admin.model.js";
import Staff from "../models/staffUser.model.js";

export const UserRepository = {

  // Crear usuario autorizado
  async crear(datos) {
    const nuevo = new User(datos);
    await nuevo.save();
    return nuevo;
  },

  // Buscar por ID
  async findById(id) {
    return await User.findById(id);
  },

  // Buscar por cuit
  async findByCuit(cuit) {
    if (!cuit) return null;
    return await User.findOne({ cuit });
  },

  // Buscar por email
  async findByEmail(email) {
    if (!email) return null;
    return await User.findOne({ "contacto.email": email });
  },

  // Empresas con rol user
  async listarTodos() {
    return await User.find({ role: "user" })
      .select("_id empresa cuit contacto role activo createdAt")
      .sort({ empresa: 1 });
  },

  async actualizar(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  },

  async eliminar(id) {
    return await User.findByIdAndDelete(id);
  },

  // KPI de SuperAdmin
  async countByRole(role) {
    // Empresas → User
    if (role === "user") return User.countDocuments({ role: "user" });

    // Staff
    if (role === "staff") return Staff.countDocuments();

    // Admins
    if (role === "admin") return Admin.countDocuments();

    return 0;
  },

  // 🔥 LISTA COMPLETA DEL SISTEMA (Empresa + Staff + Admin)
  async findAll() {
    const empresas = await User.find({}, "-password -__v").lean();
    const admins = await Admin.find({}, "-password -__v").lean();
    const staff = await Staff.find({}, "-password -__v").lean();

    return [
      ...empresas.map((u) => ({ ...u, tipo: "empresa" })),
      ...admins.map((u) => ({ ...u, tipo: u.superadmin ? "superadmin" : "admin" })),
      ...staff.map((u) => ({ ...u, tipo: "staff" })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};
