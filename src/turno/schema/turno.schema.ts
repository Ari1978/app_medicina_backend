import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Empresa } from 'src/empresa/schemas/empresa.schema';

export type TurnoDocument = Turno & Document;

// ============================
// SUBDOCUMENTO: ESTUDIO OPERATIVO
// ============================
@Schema({ _id: false })
export class EstudioOperativo {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  sector: string;

  @Prop({
    enum: ['pendiente', 'realizado'],
    default: 'pendiente',
  })
  estado: 'pendiente' | 'realizado';
}

export const EstudioOperativoSchema =
  SchemaFactory.createForClass(EstudioOperativo);

// ============================
// SUBDOCUMENTO: RESULTADO ESTUDIO
// ============================
@Schema({ _id: false })
export class ResultadoEstudio {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  sector: string;

  @Prop({
    enum: ['realizado'],
    required: true,
  })
  estado: 'realizado';

  @Prop({ required: true })
  resumen: string;
}

export const ResultadoEstudioSchema =
  SchemaFactory.createForClass(ResultadoEstudio);

// ============================
// SUBDOCUMENTO: RESULTADO FINAL
// ============================
@Schema({ _id: false })
export class ResultadoFinal {
  @Prop({
    type: [ResultadoEstudioSchema],
    required: true,
  })
  estudios: ResultadoEstudio[];

  @Prop({
    enum: ['A', 'B', 'C'],
    required: true,
  })
  aptitud: 'A' | 'B' | 'C';

  @Prop()
  observacionGeneral?: string;
}

export const ResultadoFinalSchema =
  SchemaFactory.createForClass(ResultadoFinal);

// ============================
// TURNO
// ============================
@Schema({ timestamps: true })
export class Turno {
  // =========================
  // EMPRESA
  // =========================
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
  })
  empresa: string | Empresa;

  // =========================
  // TIPO
  // =========================
  @Prop({
    required: true,
    enum: ['examen', 'estudios'],
  })
  tipo: 'examen' | 'estudios';

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
  // MOTIVO
  // =========================
  @Prop({ required: true })
  motivo: string;

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
  // SOLICITANTE
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
    enum: ['provisional', 'confirmado', 'realizado', 'ausente', 'cancelado'],
    default: 'provisional',
  })
  estado: 'provisional' | 'confirmado' | 'realizado' | 'ausente' | 'cancelado';

  // =========================
  // PDF RESULTADO
  // =========================
  @Prop()
  pdfResultado?: string;

  // =========================
  // ESTUDIOS OPERATIVOS
  // =========================
  @Prop({
    type: [EstudioOperativoSchema],
    default: [],
  })
  estudios: EstudioOperativo[];

  // =========================
  // RESULTADO FINAL MÉDICO
  // =========================
  @Prop({
    type: ResultadoFinalSchema,
    default: undefined,
  })
  resultadoFinal?: ResultadoFinal;
}

export const TurnoSchema = SchemaFactory.createForClass(Turno);

// =========================
// ÍNDICE ÚNICO
// =========================
TurnoSchema.index(
  { empleadoDni: 1, fecha: 1, hora: 1 },
  { unique: true },
);
