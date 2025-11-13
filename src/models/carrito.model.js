import mongoose from "mongoose";

const TurnoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fecha: { type: String, required: true, trim: true },
    hora: { type: String, required: true, trim: true },
    empleado: {
      nombre: { type: String, required: true, trim: true },
      apellido: { type: String, required: true, trim: true },
      dni: { type: String, required: true, trim: true },
    },
    contacto: {
      nombre: { type: String, required: true, trim: true },
      celular: { type: String, required: true, trim: true },
    },
    puesto: { type: String, required: true, trim: true },
    examenes: [{ type: String, trim: true }],
    provisional: { type: Boolean, default: true },
    confirmado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Turno || mongoose.model("Turno", TurnoSchema);
