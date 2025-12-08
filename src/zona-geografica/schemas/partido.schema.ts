import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Partido extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  provincia: string;
}

export const PartidoSchema = SchemaFactory.createForClass(Partido);
