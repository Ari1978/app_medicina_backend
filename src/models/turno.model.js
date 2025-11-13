import mongoose from "mongoose";

const TurnoSchema = new mongoose.Schema(
  {
    // 👤 Usuario dueño del turno
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 🏢 Empresa (normalmente igual al user)
    empresaId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 👥 Trazabilidad del autor (user / staff / admin)
    creadoPor: { type: mongoose.Schema.Types.ObjectId, refPath: "creadoPorTipo", required: true },
    creadoPorTipo: { type: String, enum: ["User", "Staff", "Admin"], required: true },

    // 📅 Datos del turno
    fecha: { type: String, required: true, trim: true }, // YYYY-MM-DD
    hora: { type: String, required: true, trim: true },  // HH:mm
    provisional: { type: Boolean, default: true },
    confirmado: { type: Boolean, default: false },

    // 👷 Datos del empleado
    empleado: {
      nombre: { type: String, required: true, trim: true },
      apellido: { type: String, required: true, trim: true },
      dni: { type: String, required: true, trim: true },
    },

    // ☎️ Datos de contacto
    contacto: {
      nombre: { type: String, required: true, trim: true },
      celular: { type: String, required: true, trim: true },
    },

    // 🧩 Datos del puesto y examen
    puesto: { type: String, required: true, trim: true },
    examenes: [{ type: String, trim: true }],

    // 📋 Motivo del turno (solo requerido si está confirmado)
    motivo: {
      type: String,
      enum: ["05", "06", "07", "22", "31", "57"],
      trim: true,
      validate: {
        validator: function (val) {
          // si el turno está confirmado, el motivo es obligatorio
          if (this.confirmado && !val) return false;
          return true;
        },
        message: "El campo 'motivo' es obligatorio cuando el turno está confirmado.",
      },
      description:
        "05: Ingreso | 06: Egreso | 07: Periodico | 22: Estudios | 31: Complementario | 57: Pendiente",
    },

    // 🔄 Estado de auditoría
    estado: {
      type: String,
      enum: ["provisional", "confirmado", "cancelado"],
      default: "provisional",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Turno || mongoose.model("Turno", TurnoSchema);
