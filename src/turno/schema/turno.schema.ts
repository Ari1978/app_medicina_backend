import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Empresa } from 'src/empresa/schemas/empresa.schema';

export type TurnoDocument = Turno & Document;

// ============================
// PRÁCTICA OPERATIVA
// ============================
@Schema({ _id: false })
export class PracticaOperativa {
  @Prop({ required: true })
  codigo: string;

  @Prop({
    enum: ['pendiente', 'realizado'],
    default: 'pendiente',
  })
  estado: 'pendiente' | 'realizado';
}

export const PracticaOperativaSchema =
  SchemaFactory.createForClass(PracticaOperativa);

// ============================
// RESULTADO FINAL (VISIBLE EMPRESA)
// ============================
@Schema({ _id: false })
export class ResultadoFinal {
  @Prop({
    type: [PracticaOperativaSchema],
    required: true,
    default: [],
  })
  practicas: PracticaOperativa[];

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
// PRE INFORME MÉDICO (INTERNO)
// ============================
@Schema({ _id: false })
export class PreInformeMedico {
  @Prop({
    type: [String],
    required: true,
    default: [],
  })
  codigos: string[]; // nomenclador tipo CIE

  @Prop()
  observacion?: string;

  @Prop({ required: true })
  medicoId: string;

  @Prop({ required: true })
  fecha: Date;
}

export const PreInformeMedicoSchema =
  SchemaFactory.createForClass(PreInformeMedico);

// ============================
// TURNO
// ============================
@Schema({ timestamps: true })
export class Turno {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Empresa',
    required: true,
  })
  empresa: string | Empresa;

  @Prop({
    required: true,
    enum: ['examen', 'estudios'],
  })
  tipo: 'examen' | 'estudios';

  @Prop({ required: true })
  empleadoNombre: string;

  @Prop({ required: true })
  empleadoApellido: string;

  @Prop({ required: true })
  empleadoDni: string;

  @Prop({ required: true })
  puesto: string;

  @Prop({ required: true })
  motivo: string;

  /**
   * ID del perfil de examen (si aplica)
   */
  @Prop()
  perfilExamen?: string;

  /**
   * Prácticas asociadas al turno
   * Fuente única de verdad
   */
  @Prop({
    type: [PracticaOperativaSchema],
    default: [],
    required: true,
  })
  listaPracticas: PracticaOperativa[];

  @Prop({ required: true })
  fecha: string;

  @Prop({ required: true })
  hora: string;

  @Prop({ required: true })
  solicitanteNombre: string;

  @Prop({ required: true })
  solicitanteApellido: string;

  @Prop({ required: true })
  solicitanteCelular: string;

  @Prop({
    enum: ['provisional', 'confirmado', 'realizado', 'ausente', 'cancelado'],
    default: 'provisional',
  })
  estado:
    | 'provisional'
    | 'confirmado'
    | 'realizado'
    | 'ausente'
    | 'cancelado';

  /**
   * Archivo final (PDF firmado, etc.)
   */
  @Prop()
  pdfResultado?: string;

  /**
   * PRE INFORME MÉDICO
   * - visible para médico y staff exámenes
   * - NO visible para empresa
   */
  @Prop({
    type: PreInformeMedicoSchema,
    default: undefined,
  })
  preInformeMedico?: PreInformeMedico;

  /**
   * INFORME FINAL
   * - visible para empresa
   */
  @Prop({
    type: ResultadoFinalSchema,
    default: undefined,
  })
  resultadoFinal?: ResultadoFinal;
}

export const TurnoSchema = SchemaFactory.createForClass(Turno);

// ============================
// ÍNDICE ÚNICO
// ============================
TurnoSchema.index(
  { empleadoDni: 1, fecha: 1, hora: 1 },
  { unique: true },
);
