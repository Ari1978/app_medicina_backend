import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServicioUserDocument = ServicioUser & Document;

@Schema({ timestamps: true })
export class ServicioUser {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ default: 'servicios' })
  role: string;

  // 👇 NUEVO
  @Prop({
    type: [String],
    default: [],
  })
  permisos: string[];
}

export const ServicioUserSchema =
  SchemaFactory.createForClass(ServicioUser);
