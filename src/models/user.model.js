import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../utils/crypto.js";

const UserSchema = new mongoose.Schema(
  {
    contacto: {
      nombre: { type: String, required: true, trim: true },
      email: { type: String, required: false, trim: true },
      telefono: { type: String, default: "", trim: true },
    },

    cuit: { type: String, required: true, unique: true, trim: true },

    empresa: { type: String, required: true, trim: true },

    // 🔐 Password opcional (para importación o creación automática)
    password: { type: String, default: "" },

    // Role siempre "user" para empresas
    role: { type: String, default: "user" },

    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

//
// -------------------------------------------------------------
// 🔒 Hash del password SOLO si existe y fue modificado
// -------------------------------------------------------------
//
UserSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

//
// -------------------------------------------------------------
// 🔑 Método de comparación de contraseña
// -------------------------------------------------------------
//
UserSchema.methods.comparePassword = function (plainPassword) {
  if (!this.password) return false; // Empresa importada sin password
  return comparePassword(plainPassword, this.password);
};

export default mongoose.model("User", UserSchema);
