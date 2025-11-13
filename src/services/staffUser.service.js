// src/services/staffUser.service.js
import Staff from "../models/staffUser.model.js";
import bcrypt from "bcrypt";

export const StaffService = {
  async login(username, password) {
    const staff = await Staff.findOne({ username, activo: true });
    if (!staff) throw new Error("Usuario o contraseña inválidos");

    const ok = await staff.comparePassword(password);
    if (!ok) throw new Error("Usuario o contraseña inválidos");

    return staff; // devolverá el staff completo (con permisos)
  },

  async crearStaff(data, userCreator) {
    const { username, password, nombre, apellido, permisos } = data;

    // ✅ Seguridad: verificar rol del creador
    if (!userCreator || !["admin", "superadmin"].includes(userCreator.role)) {
      throw new Error("No autorizado para crear staff");
    }

    const existente = await Staff.findOne({ username });
    if (existente) throw new Error("El username ya está en uso");

    // ✅ Hashear contraseña
    const hashed = await bcrypt.hash(password, 10);

    const nuevo = await Staff.create({
      username,
      password: hashed,
      nombre,
      apellido,
      role: "staff",
      permisos: Array.isArray(permisos) ? permisos : [],
      activo: true,
    });

    return nuevo;
  },
};
