// src/seed/seedSuperAdmin.js
import Admin from "../models/admin.model.js";

/**
 * Crea un SUPERADMIN si no existe.
 * Usa SUPERADMIN_USERNAME y SUPERADMIN_PASSWORD del .env
 * Solo permite 1 SuperAdmin en toda la app.
 */
export const seedSuperAdmin = async () => {
  try {
    // ¿Ya existe un SuperAdmin en colección ADMIN?
    const existing = await Admin.findOne({ superadmin: true });
    if (existing) {
      console.log("✅ SuperAdmin ya existente");
      return;
    }

    const {
      SUPERADMIN_USERNAME,
      SUPERADMIN_PASSWORD,
      SUPERADMIN_NOMBRE,
      SUPERADMIN_APELLIDO
    } = process.env;

    if (!SUPERADMIN_USERNAME || !SUPERADMIN_PASSWORD) {
      console.log("⚠️ Variables faltantes para crear SuperAdmin");
      return;
    }

    await Admin.create({
      username: SUPERADMIN_USERNAME.trim(),
      password: SUPERADMIN_PASSWORD, // será hasheado en pre("save")
      nombre: SUPERADMIN_NOMBRE || "Super",
      apellido: SUPERADMIN_APELLIDO || "Admin",
      superadmin: true,
      role: "superadmin",
      activo: true,
    });

    console.log("🛡️ SuperAdmin creado automáticamente ✅");
  } catch (err) {
    console.error("❌ Error creando SuperAdmin:", err.message || err);
  }
};
