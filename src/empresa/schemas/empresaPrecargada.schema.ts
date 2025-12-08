import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EmpresaPrecargada extends Document {
  @Prop({ required: true, unique: true })
  cuit: string;

  @Prop({ required: true })
  razonSocial: string;

  @Prop({ default: true })
  habilitada: boolean;
}

export const EmpresaPrecargadaSchema = SchemaFactory.createForClass(EmpresaPrecargada);
