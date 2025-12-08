import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Provincia extends Document {
  @Prop({ required: true, unique: true })
  nombre: string;
}

export const ProvinciaSchema = SchemaFactory.createForClass(Provincia);
