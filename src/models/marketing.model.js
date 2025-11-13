// src/models/marketing.model.js
// -------------------------------------------------------------
// Modelo multi-rol (User, Staff, Admin) con auditoría completa.
// Incluye presupuestos, historial y comentarios internos.
// -------------------------------------------------------------

import mongoose from "mongoose";

// Comentarios internos con referencia a autor real y rol
const ComentarioSchema = new mongoose.Schema(
  {
    mensaje: { type: String, required: true, trim: true },

    autor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "autorTipo", // ✅ corregido
    },
    autorTipo: {
      type: String,
      required: true,
      enum: ["User", "Staff", "Admin"],
    },

    fecha: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Historial de estados para auditoría
const HistorialEstadoSchema = new mongoose.Schema(
  {
    estado: {
      type: String,
      enum: ["pendiente", "presupuestado", "aceptado", "rechazado", "cerrado"],
      required: true,
    },

    fecha: { type: Date, default: Date.now },

    autor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "autorTipo", // ✅ corregido
    },
    autorTipo: {
      type: String,
      required: true,
      enum: ["User", "Staff", "Admin"],
    },
  },
  { _id: false }
);

// Cotización
const PresupuestoSchema = new mongoose.Schema(
  {
    monto: { type: Number, default: 0 },
    detalle: { type: String, default: "", trim: true },
    enviadoAlCliente: { type: Boolean, default: false },
    fechaEnvio: { type: Date, default: null },
  },
  { _id: false }
);

const MarketingSchema = new mongoose.Schema(
  {
    // Quién crea la solicitud (user, staff o admin)
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "creadoPorTipo",
    },
    creadoPorTipo: {
      type: String,
      required: true,
      enum: ["User", "Staff", "Admin"],
    },

    // Cliente/empresa involucrada (opcional)
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    motivoConsulta: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "", trim: true },

    estado: {
      type: String,
      enum: ["pendiente", "presupuestado", "aceptado", "rechazado", "cerrado"],
      default: "pendiente",
    },

    presupuesto: { type: PresupuestoSchema, default: () => ({}) },

    comentariosInternos: { type: [ComentarioSchema], default: [] },

    historialEstados: { type: [HistorialEstadoSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Marketing", MarketingSchema);
