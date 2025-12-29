import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServicioArchivoDocument = ServicioArchivo & Document;

@Schema({ timestamps: true })
export class ServicioArchivo {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  servicioId: Types.ObjectId;
  // referencia al servicio / turno / estudio

  // 👇 NUEVO — ÁREA DEL ARCHIVO
  @Prop({
    required: true,
    index: true,
    enum: [
      'RAYOS',
      'LABORATORIO',
      'ESPIROMETRIA',
      'CARDIOLOGIA',
      'AUDIOMETRIA',
      'ELECTROCARDIOGRAMA',
      'ELECTROENCEFALOGRAMA',
      'PSICOLOGIA',
      'CLINICA_MEDICA',
    ],
  })
  area: string;

  @Prop({ required: true })
  original: string;
  // path o URL del archivo original

  @Prop()
  preview?: string;
  // path o URL del preview (pdf / imagen)

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ default: 0 })
  size: number;

  @Prop({
    enum: ['pdf', 'image', 'office', 'dicom', 'other'],
    required: true,
  })
  categoria: string;

  @Prop({ default: false })
  eliminado: boolean;
}

export const ServicioArchivoSchema =
  SchemaFactory.createForClass(ServicioArchivo);
