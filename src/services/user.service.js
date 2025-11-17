import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/crypto.js";

// -------------------------------------------------------------
// DTO LIMPIO Y REAL DEL USUARIO
// -------------------------------------------------------------
const normalizeUserData = (data) => ({
  cuit: data.cuit?.trim(),
  password: data.password || "",
  contacto: {
    nombre: data.contacto?.nombre?.trim() || "",
    email: data.contacto?.email?.trim() || "",
  },
});

export const UserService = {

  // -------------------------------------------------------------
  // 🧾 REGISTRO AUTOMÁTICO
  // -------------------------------------------------------------
  async register(data) {
    const userData = normalizeUserData(data);

    // Buscar empresa habilitada
    const user = await User.findOne({ cuit: userData.cuit });
    if (!user) throw new Error("CUIT no autorizado");

    // Si no tenía contraseña → registrar normalmente
    if (!user.password || user.password === "") {
      user.password = await hashPassword(userData.password);
      user.contacto = userData.contacto;
      user.activo = true;

      await user.save();

      console.log(`🟢 [REGISTER] Nueva contraseña registrada para ${user.empresa} (${user.cuit})`);
      return user;
    }

    // Si ya tenía contraseña → ¿coincide?
    const valid = await comparePassword(userData.password, user.password);

    if (!valid) {
      user.password = await hashPassword(userData.password);
      await user.save();
      console.log(`🔄 [REGISTER] Contraseña actualizada automáticamente para ${user.empresa}`);
    } else {
      console.log(`ℹ️ [REGISTER] Usuario ${user.empresa} ya tenía la misma contraseña`);
    }

    return user;
  },

  // -------------------------------------------------------------
  // 🔐 LOGIN AUTOMÁTICO (resetea password si no coincide)
  // -------------------------------------------------------------
  async login(cuit, password) {
    console.log("💡 [LOGIN] Intento con CUIT:", cuit);

    const user = await User.findOne({ cuit: cuit.trim(), role: "user" });

    if (!user) {
      console.log("⛔ [LOGIN] Usuario no encontrado");
      throw new Error("CUIT o contraseña inválidos");
    }

    if (user.activo === false) {
      console.log("⛔ [LOGIN] Usuario inactivo");
      throw new Error("Cuenta inactiva. Contacte a ASMEL.");
    }

    // Usuario sin contraseña → registrar primera vez
    if (!user.password) {
      console.log("⚠️ [LOGIN] Usuario sin password → creando hash inicial");
      user.password = await hashPassword(password);
      await user.save();
      return user;
    }

    const ok = await comparePassword(password, user.password);

    if (!ok) {
      console.log("🔄 [LOGIN] Contraseña incorrecta → actualizando hash");
      user.password = await hashPassword(password);
      await user.save();
    } else {
      console.log("✅ [LOGIN] Contraseña válida para:", user.empresa);
    }

    return user;
  },

  // Completar registro de empresa ya autorizada por SuperAdmin
async completarRegistro(id, data) {
  const user = await User.findById(id);
  if (!user) throw new Error("Empresa no encontrada");

  user.email = data.email;
  user.password = data.password; // se hashea en pre-save
  user.contacto = data.contacto || user.contacto;

  await user.save();
  return user;
}


};
