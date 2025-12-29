import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditoriaDocument = Auditoria & Document;

@Schema({ timestamps: true })
export class Auditoria {
  @Prop({ required: true })
  evento: string;

  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  rol: string;

  @Prop()
  turnoId?: string;

  @Prop()
  adjuntoId?: string;

  @Prop()
  detalle?: string;
}

export const AuditoriaSchema =
  SchemaFactory.createForClass(Auditoria);
