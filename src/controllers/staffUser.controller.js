import { StaffService } from "../services/staffUser.service.js";
import { clearAllAuthCookies, setAuthCookie, signToken, COOKIE_STAFF } from "../utils/jwt.js";

export const StaffController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const staff = await StaffService.login(username?.trim(), password);

      clearAllAuthCookies(res);
      const token = signToken({
        _id: staff._id,
        nombre: staff.nombre,
        apellido: staff.apellido,
        username: staff.username,
        role: staff.role,
        permisos: staff.permisos || [],
      });
      setAuthCookie(res, COOKIE_STAFF, token);

      return res.json({
        message: "OK",
        user: { _id: staff._id, nombre: staff.nombre, apellido: staff.apellido, username: staff.username, role: staff.role, permisos: staff.permisos || [] },
        token,
      });
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
  },

  async me(req, res) {
    return res.json({ user: req.user });
  },

  async logout(req, res) {
    clearAllAuthCookies(res);
    return res.json({ message: "Sesión cerrada" });
  },
};
