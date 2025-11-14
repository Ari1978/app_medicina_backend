// src/models/turno.model.js
import mongoose from "mongoose";

const TurnoSchema = new mongoose.Schema(
  {
    /* =========================================================
       👤 Usuario dueño del turno
    ========================================================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* =========================================================
       🏢 Empresa (generalmente igual a user)
    ========================================================= */
    empresaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* =========================================================
       👥 Trazabilidad: quién lo creó
    ========================================================= */
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "creadoPorTipo",
      required: true,
    },
    creadoPorTipo: {
      type: String,
      enum: ["User", "Staff", "Admin"],
      required: true,
    },

    /* =========================================================
       📅 Datos del turno
    ========================================================= */
    fecha: {
      type: String,
      required: true,
      trim: true,
    }, // YYYY-MM-DD

    hora: {
      type: String,
      required: true,
      trim: true,
    }, // HH:mm

    provisional: { type: Boolean, default: true },
    confirmado: { type: Boolean, default: false },

    /* =========================================================
       👷 Datos del empleado
    ========================================================= */
    empleado: {
      nombre: { type: String, required: true, trim: true },
      apellido: { type: String, required: true, trim: true },
      dni: { type: String, required: true, trim: true },
    },

    /* =========================================================
       ☎️ Contacto de empresa
    ========================================================= */
    contacto: {
      nombre: { type: String, required: true, trim: true },
      celular: { type: String, required: true, trim: true },
    },

    /* =========================================================
       🧩 Datos del puesto y exámenes
    ========================================================= */
    puesto: { type: String, required: true, trim: true },

    examenes: [
      {
        type: String,
        trim: true,
      },
    ],

    /* =========================================================
       📋 Motivo del turno — solo obligatorio si está confirmado
    ========================================================= */
    motivo: {
      type: String,
      enum: ["05", "06", "07", "22", "31", "57"],
      trim: true,
      validate: {
        validator: function (val) {
          // Solo obligatorio cuando está confirmado
          if (this.estado === "confirmado" && !val) return false;
          return true;
        },
        message: "El motivo es obligatorio cuando el turno está confirmado.",
      },
      description:
        "05: Ingreso | 06: Egreso | 07: Periodico | 22: Estudios | 31: Complementario | 57: Pendiente",
    },

    /* =========================================================
       🔄 Estado del turno
    ========================================================= */
    estado: {
      type: String,
      enum: ["provisional", "confirmado", "cancelado"],
      default: "provisional",
    },
  },
  { timestamps: true }
);

/* =========================================================
   📌 Indexes para performance (RECOMENDADO para tu app)
========================================================= */
TurnoSchema.index({ empresaId: 1, estado: 1, fecha: 1 });
TurnoSchema.index({ fecha: 1, estado: 1 });
TurnoSchema.index({ estado: 1 });
TurnoSchema.index({ provisional: 1 });
TurnoSchema.index({ confirmado: 1 });

export default mongoose.models.Turno || mongoose.model("Turno", TurnoSchema);
