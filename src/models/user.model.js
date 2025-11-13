import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../utils/crypto.js";

const UserSchema = new mongoose.Schema(
  {
    contacto: {
      nombre: { type: String, required: true, trim: true },
      email: { type: String, required: false, trim: true },
      telefono: { type: String, default: "", trim: true },
    },

    cuit: { type: String, required: true, unique: true, trim: true }, // CUIT único
    empresa: { type: String, required: true, trim: true }, // Razón Social

    // ⚙️ Contraseña opcional para creación automática o importación
    password: { type: String, required: false, default: "" },

    role: { type: String, default: "user" },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// -------------------------------------------------------------
// 🔒 Hash de password solo si existe y fue modificado
// -------------------------------------------------------------
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await hashPassword(this.password);
  next();
});

// -------------------------------------------------------------
// 🔑 Método para comparar contraseñas
// -------------------------------------------------------------
UserSchema.methods.comparePassword = function (plainPassword) {
  return comparePassword(plainPassword, this.password);
};

export default mongoose.model("User", UserSchema);
