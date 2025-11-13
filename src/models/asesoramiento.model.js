import mongoose from "mongoose";

const AsesoramientoSchema = new mongoose.Schema(
  {
    empresa: { type: String, required: true, trim: true },
    cuit: { type: String, required: true, trim: true },

    contacto: {
      nombre: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      telefono: { type: String, required: true, trim: true },
    },

    servicio: { type: String, required: true, trim: true },
    mensaje: { type: String, required: true, trim: true },

    estado: {
      type: String,
      enum: ["pendiente", "en_proceso", "respondido", "cerrado"],
      default: "pendiente",
    },

    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "creadoPorTipo",
    },

    creadoPorTipo: {
      type: String,
      required: true,
      enum: ["user", "staff", "admin", "superadmin"],
    },

    // 🕓 Historial de cambios de estado
    historialEstados: [
      {
        estado: { type: String, required: true },
        fecha: { type: Date, default: Date.now },
        autor: { type: mongoose.Schema.Types.ObjectId, refPath: "historialEstados.autorTipo" },
        autorTipo: { type: String, enum: ["user", "staff", "admin", "superadmin"] },
        nota: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Asesoramiento", AsesoramientoSchema);
