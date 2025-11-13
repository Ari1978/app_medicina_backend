import mongoose from "mongoose";

const HistorialEstadoSchema = new mongoose.Schema(
  {
    estado: { type: String, enum: ["pendiente","en_proceso","finalizado","cancelado"], required: true },
    fecha: { type: Date, default: Date.now },
    autor: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "autorTipo" },
    autorTipo: { type: String, required: true, enum: ["User","Staff","Admin"] },
    nota: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const SaludMentalSchema = new mongoose.Schema(
  {
    creadoPor: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "creadoPorTipo" },
    creadoPorTipo: { type: String, required: true, enum: ["User","Staff","Admin"] },
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    nombreEmpresa: { type: String, required: true, trim: true },
    nombreContacto: { type: String, required: true, trim: true },
    celular: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    motivoConsulta: { type: String, required: true, trim: true },
    tipoServicio: { type: String, enum: ["Psicología","Psiquiatría","Ambos"], required: true },
    notas: { type: String, default: "", trim: true },
    estado: { type: String, enum: ["pendiente","en_proceso","finalizado","cancelado"], default: "pendiente" },
    historialEstados: { type: [HistorialEstadoSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("SaludMental", SaludMentalSchema);
