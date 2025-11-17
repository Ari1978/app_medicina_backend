import Admin from "../models/admin.model.js";
import Staff from "../models/staffUser.model.js";
import User from "../models/user.model.js";

export const AdminRepository = {
  // Buscar admin o staff para login
  async buscarPorUsername(username) {
    const admin = await Admin.findOne({ username, activo: true });
    if (admin) return { ...admin._doc, role: admin.superadmin ? "superadmin" : "admin" };

    const staff = await Staff.findOne({ username, activo: true });
    if (staff) return { ...staff._doc, role: "staff" };

    return null;
  },

  // Crear Admin
  async crearAdmin(data) {
    return await Admin.create(data);
  },

  // Crear Staff
  async crearStaff(data) {
    return await Staff.create(data);
  },

  // Listar Admins + Staff
  async listarAdminsYStaff() {
    const admins = await Admin.find({}, "-password -__v").lean();
    const staff = await Staff.find({}, "-password -__v").lean();
    return [...admins, ...staff].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Usuarios normales
  async listarUsuarios() {
    return await User.find({}, "-password -__v").lean();
  },

  async countByRoleUser() {
    return User.countDocuments({ role: "user" });
  },

  async countStaff() {
    return Staff.countDocuments();
  },

  async countAdmins() {
    return Admin.countDocuments();
  },

  async importarUsuario(data) {
    return await User.create(data);
  },

  async existsByCuit(cuit) {
    return await User.findOne({ cuit });
  },
};
