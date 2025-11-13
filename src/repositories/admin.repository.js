import Admin from "../models/admin.model.js";
import Staff from "../models/staffUser.model.js";
import User from "../models/user.model.js";

export const AdminRepository = {
  // Buscar admin o staff por email o CUIT
  async buscarPorEmailOCuit(email, cuit) {
    const admin = await Admin.findOne({ $or: [{ email }, { username: email }, { username: cuit }] });
    if (admin) return admin;
    return await Staff.findOne({ $or: [{ username: email }, { username: cuit }] });
  },

  // Crear Admin o Staff
  async crear(data, tipo = "admin") {
    return tipo === "staff" ? Staff.create(data) : Admin.create(data);
  },

  // Listar todos los Admins y Staff
  async listarAdminsYStaff() {
    const admins = await Admin.find({}, "-password -__v").lean();
    const staff = await Staff.find({}, "-password -__v").lean();
    return [...admins, ...staff].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Buscar usuario normal por CUIT
  async buscarUsuarioPorCuit(cuit) {
    return await User.findOne({ cuit }).select("-password -__v").lean();
  },
};
