// src/models/usuarioAutorizado.model.js
import mongoose from "mongoose";

const UsuarioAutorizadoSchema = new mongoose.Schema(
  {
    empresa: { type: String, required: true, trim: true },
    cuit: { type: String, required: true, trim: true, unique: true },
    contacto: {
      nombre: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      telefono: { type: String, default: "", trim: true },
    },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("UsuarioAutorizado", UsuarioAutorizadoSchema);
