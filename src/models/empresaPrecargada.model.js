// src/models/empresaPrecargada.model.js
import mongoose from "mongoose";

const EmpresaPrecargadaSchema = new mongoose.Schema(
  {
    empresa: { type: String, required: true, trim: true }, // Razón social
    cuit: { type: String, required: true, unique: true, trim: true },
    habilitado: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("EmpresaPrecargada", EmpresaPrecargadaSchema);
