// src/repositories/user.repository.js
import UserModel from "../models/user.model.js";
import AdminModel from "../models/admin.model.js";
import StaffModel from "../models/staffUser.model.js";

export const UserRepository = {
  /* =========================================================
     🔍 Buscar ADMIN o STAFF por username (para Login)
  ========================================================= */
  async findByUsername(username) {
    const admin = await AdminModel.findOne({ username });
    if (admin)
      return { ...admin._doc, role: admin.superadmin ? "superadmin" : "admin" };

    const staff = await StaffModel.findOne({ username });
    if (staff) return { ...staff._doc, role: "staff" };

    return null;
  },

  /* =========================================================
     🔍 Buscar EMPRESA (User) por CUIT
  ========================================================= */
  async findByCuit(cuit) {
    return await UserModel.findOne({ cuit });
  },

  /* =========================================================
     🔍 Buscar POR ID (empresa/admin/staff)
  ========================================================= */
  async findById(id) {
    return (
      (await UserModel.findById(id)) ||
      (await AdminModel.findById(id)) ||
      (await StaffModel.findById(id))
    );
  },

  /* =========================================================
     📋 Listar TODOS los usuarios del sistema
  ========================================================= */
  async findAll() {
    const empresas = await UserModel.find().lean();
    const admins = await AdminModel.find().lean();
    const staff = await StaffModel.find().lean();

    return [
      ...empresas.map((e) => ({ ...e, tipo: "empresa" })),
      ...admins.map((a) => ({ ...a, tipo: "admin" })),
      ...staff.map((s) => ({ ...s, tipo: "staff" })),
    ];
  },

  /* =========================================================
     🔢 Contar por rol
  ========================================================= */
  async countByRole(role) {
    if (role === "user") return UserModel.countDocuments();
    if (role === "admin") return AdminModel.countDocuments();
    if (role === "staff") return StaffModel.countDocuments();
    return 0;
  },

  /* =========================================================
     📋 Listar Admin + Staff para panel
  ========================================================= */
  async findAdminsAndStaff() {
    const admins = await AdminModel.find({}, "-password").lean();
    const staff = await StaffModel.find({}, "-password").lean();
    return [...admins, ...staff];
  },

  /* =========================================================
     ➕ Crear Usuario según rol
  ========================================================= */
  async crear(data) {
    if (data.role === "admin") return await AdminModel.create(data);
    if (data.role === "staff") return await StaffModel.create(data);
    return await UserModel.create(data); // empresas ya registradas
  },

  /* =========================================================
     🔄 Actualizar cualquier usuario
  ========================================================= */
  async update(id, data) {
    return (
      (await UserModel.findByIdAndUpdate(id, data, { new: true })) ||
      (await AdminModel.findByIdAndUpdate(id, data, { new: true })) ||
      (await StaffModel.findByIdAndUpdate(id, data, { new: true }))
    );
  },
};
