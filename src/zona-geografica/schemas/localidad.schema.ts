import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Localidad extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  provincia: string;

  @Prop({ required: true })
  partido: string;
}

export const LocalidadSchema = SchemaFactory.createForClass(Localidad);
