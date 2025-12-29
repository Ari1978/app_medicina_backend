import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PreInformeDocument = PreInforme & Document;

@Schema({ timestamps: true })
export class PreInforme {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  turnoId: Types.ObjectId;

  // Texto por práctica (RX, laboratorio, etc)
  @Prop({
    type: [
      {
        codigoPractica: String,
        texto: String,
      },
    ],
    default: [],
  })
  textoPorPractica: {
    codigoPractica: string;
    texto: string;
  }[];

  @Prop()
  observacionGeneral?: string;

  @Prop({ required: true })
  creadoPor: string; // usuarioId

  @Prop({
    enum: ['borrador'],
    default: 'borrador',
  })
  estado: 'borrador';
}

export const PreInformeSchema =
  SchemaFactory.createForClass(PreInforme);
