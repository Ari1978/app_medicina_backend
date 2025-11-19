// src/models/user.model.js
import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../utils/crypto.js";

const PerfilExamenSchema = new mongoose.Schema(
  {
    nombrePerfil: { type: String, required: true, trim: true },
    estudios: [{ type: String, trim: true }],
    descripcion: { type: String, default: "", trim: true },
    activo: { type: Boolean, default: true },
  },
  {
    timestamps: false,
    _id: true,
  }
);

const UserSchema = new mongoose.Schema(
  {
    contacto: {
      nombre: { type: String, default: "", trim: true },
      email: { type: String, trim: true, default: null },
      telefono: { type: String, default: "", trim: true },
    },

    cuit: { type: String, required: true, unique: true, trim: true },

    empresa: { type: String, required: true, trim: true },

    password: { type: String, default: "" },

    role: { type: String, default: "user" },

    activo: { type: Boolean, default: true },

    perfilesExamen: {
      type: [PerfilExamenSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash de password si fue modificado
UserSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});

// Comparar password
UserSchema.methods.comparePassword = function (plainPassword) {
  if (!this.password) return false;
  return comparePassword(plainPassword, this.password);
};

export default mongoose.model("User", UserSchema);
