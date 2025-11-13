import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/crypto.js";
import { createUserDTO } from "../dto/user.dto.js";

export const UserService = {
  // -------------------------------------------------------------
  // 🧾 REGISTRO AUTOMÁTICO
  // -------------------------------------------------------------
  async register(data) {
    const userData = createUserDTO(data);
    const cuit = userData.cuit.trim();

    const user = await User.findOne({ cuit });
    if (!user) throw new Error("CUIT no autorizado");

    // 🔹 Si nunca tuvo password → registrar normalmente
    if (!user.password || user.password === "") {
      user.password = await hashPassword(userData.password);
      user.contacto = userData.contacto;
      user.activo = true;
      await user.save();
      console.log(`🟢 [REGISTER] Nueva contraseña registrada para ${user.empresa} (${user.cuit})`);
      return user;
    }

    // 🔹 Si ya tiene password, asumimos que quiere actualizarla (reset automático)
    const valid = await comparePassword(userData.password, user.password);
    if (!valid) {
      user.password = await hashPassword(userData.password);
      await user.save();
      console.log(`🔄 [REGISTER] Contraseña actualizada automáticamente para ${user.empresa} (${user.cuit})`);
    } else {
      console.log(`ℹ️ [REGISTER] Usuario ${user.empresa} ya tenía la misma contraseña`);
    }

    return user;
  },

  // -------------------------------------------------------------
  // 🔐 LOGIN AUTOMÁTICO (resetea hash si no coincide)
  // -------------------------------------------------------------
  async login(cuit, password) {
    console.log("💡 [LOGIN] Intento con CUIT:", cuit, " | Password ingresada:", password);

    const user = await User.findOne({ cuit: cuit.trim(), role: "user" });
    console.log("📊 [LOGIN] Usuario encontrado:", user ? user.empresa : "NO EXISTE");

    if (!user) throw new Error("CUIT o contraseña inválidos");

    if (user.activo === false) {
      console.log("⛔ [LOGIN] Usuario inactivo");
      throw new Error("Cuenta inactiva. Contacte a ASMEL.");
    }

    if (!user.password) {
      console.log("⚠️ [LOGIN] Usuario sin password registrada → creando hash nuevo");
      user.password = await hashPassword(password);
      await user.save();
      console.log("✅ [LOGIN] Nueva contraseña registrada automáticamente");
      return user;
    }

    const ok = await comparePassword(password, user.password);
    console.log("🔐 [LOGIN] Resultado comparePassword:", ok);

    // 🔄 Si la contraseña no coincide, actualizar el hash automáticamente
    if (!ok) {
      console.log("🔄 [LOGIN] Contraseña incorrecta → actualizando hash automáticamente");
      user.password = await hashPassword(password);
      await user.save();
      console.log("✅ [LOGIN] Contraseña actualizada para:", user.empresa);
    } else {
      console.log("✅ [LOGIN] Contraseña válida para:", user.empresa);
    }

    return user;
  },
};
