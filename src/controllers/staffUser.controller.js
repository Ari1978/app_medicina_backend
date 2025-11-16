// src/controllers/staffUser.controller.js
import { StaffService } from "../services/staffUser.service.js";
import {
  clearAllAuthCookies,
  setAuthCookie,
  COOKIE_STAFF,
  generateTokenForStaff,
} from "../utils/jwt.js";
import { staffResponseDTO } from "../dto/staff.dto.js";

export const StaffController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const staff = await StaffService.login(username?.trim(), password);

      clearAllAuthCookies(res);

      const token = generateTokenForStaff(staff);
      setAuthCookie(res, COOKIE_STAFF, token);

      return res.json({
        message: "OK",
        user: staffResponseDTO(staff),
        token,
      });
    } catch (e) {
      return res.status(401).json({ message: e.message });
    }
  },

  async me(req, res) {
    return res.json({ user: staffResponseDTO(req.user) });
  },

  async logout(_req, res) {
    clearAllAuthCookies(res);
    return res.json({ message: "Sesión cerrada" });
  },
};
