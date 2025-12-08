import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TurnoDocument = Turno & Document;

@Schema({ timestamps: true })
export class Turno {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Empresa', required: true })
  empresa: string;

  @Prop({
    required: true,
    enum: ['examen', 'estudios'],
  })
  tipo: string;

  // =========================
  // EMPLEADO
  // =========================
  @Prop({ required: true })
  empleadoNombre: string;

  @Prop({ required: true })
  empleadoApellido: string;

  @Prop({ required: true })
  empleadoDni: string;

  @Prop({ required: true })
  puesto: string;

  // =========================
  // MOTIVOS
  // =========================

  // MOTIVO SOLO PARA EXAMEN ✅
  @Prop()
  motivo?: string;

  // MOTIVO SOLO PARA ESTUDIO ✅
  @Prop({
    enum: ['complementario', 'pendiente', 'otro'],
  })
  motivoEstudio?: string;

  // =========================
  // CAMPOS PARA EXAMEN
  // =========================
  @Prop()
  perfilExamen?: string;

  @Prop({ type: [String], default: [] })
  estudiosAdicionales?: string[];

  // =========================
  // CAMPOS PARA ESTUDIOS
  // =========================
  @Prop({ type: [String], default: [] })
  listaEstudios?: string[];

  // =========================
  // FECHA / HORA
  // =========================
  @Prop({ required: true })
  fecha: string;

  @Prop({ required: true })
  hora: string;

  // =========================
  // QUIÉN LO SOLICITA
  // =========================
  @Prop({ required: true })
  solicitanteNombre: string;

  @Prop({ required: true })
  solicitanteApellido: string;

  @Prop({ required: true })
  solicitanteCelular: string;

  // =========================
  // ESTADO
  // =========================
  @Prop({
    required: true,
    enum: ['provisional', 'confirmado', 'ausente', 'cancelado'],
    default: 'provisional',
  })
  estado: string;

  // =========================
  // PDF RESULTADO
  // =========================
  @Prop()
  pdfResultado?: string;

  // =========================
  // ESTUDIOS DETALLADOS (SECTOR / ESTADO)
  // =========================
  @Prop({
    type: [
      {
        nombre: { type: String, required: true },
        sector: { type: String, required: true },
        estado: {
          type: String,
          enum: ['pendiente', 'realizado'],
          default: 'pendiente',
        },
      },
    ],
    default: [],
  })
  estudios: {
    nombre: string;
    sector: string;
    estado: 'pendiente' | 'realizado';
  }[];
}

export const TurnoSchema = SchemaFactory.createForClass(Turno);

TurnoSchema.index(
  { empleadoDni: 1, fecha: 1, hora: 1 },
  { unique: true }
);
