
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FormularioDocument = Formulario & Document;

@Schema({ timestamps: true })
export class Formulario {
  @Prop({ required: true })
  tipo: string;

  @Prop({ type: Types.ObjectId, ref: 'Empresa', required: true })
  empresa: string;

  @Prop({ type: Object, required: true })
  datos: any;

  @Prop({ default: 'pendiente' })
  estado: 'pendiente' | 'en_progreso' | 'resuelto';

  @Prop()
  respuestaStaff?: string;
}

export const FormularioSchema = SchemaFactory.createForClass(Formulario);
