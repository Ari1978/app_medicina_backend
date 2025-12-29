import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdjuntoPracticaDocument = AdjuntoPractica & Document;

export enum AdjuntoEstado {
  BORRADOR = 'borrador',
  FINAL = 'final',
}

export enum AdjuntoTipo {
  DICOM = 'dicom',
  PREVIEW = 'preview',
  PDF = 'pdf',
  PDF_FINAL = 'pdf_final',
}

@Schema({ timestamps: true })
export class AdjuntoPractica {
  // ============================
  // RELACIONES
  // ============================
  @Prop({ type: Types.ObjectId, required: true, index: true })
  turnoId: Types.ObjectId;

  @Prop({ required: true })
  codigoPractica: string;

  @Prop({ required: true })
  tipoServicio: string;

  // ============================
  // ARCHIVO
  // ============================
  @Prop({ required: true })
  path: string; // path interno, NO url pública

  @Prop({ required: true })
  mimeType: string;

  @Prop({
    enum: AdjuntoTipo,
    required: true,
    index: true,
  })
  tipo: AdjuntoTipo;

  // ============================
  // VERSIONADO
  // ============================
  @Prop({ default: 1 })
  version: number;

  @Prop({
    enum: AdjuntoEstado,
    default: AdjuntoEstado.BORRADOR,
  })
  estado: AdjuntoEstado;

  // ============================
  // TRAZABILIDAD LEGAL
  // ============================
  @Prop()
  hash?: string; // sha256 del archivo final

  @Prop()
  cerradoAt?: Date;

  @Prop()
  cerradoPor?: string;

  // ============================
  // ORIGEN
  // ============================
  @Prop({
    enum: ['servicio', 'medico', 'staff'],
    required: true,
  })
  origen: 'servicio' | 'medico' | 'staff';

  @Prop({ required: true })
  usuarioId: string;
}

export const AdjuntoPracticaSchema =
  SchemaFactory.createForClass(AdjuntoPractica);
