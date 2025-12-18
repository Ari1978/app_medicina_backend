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

  @Prop({ 
  default: 'pendiente',
  enum: ['pendiente', 'en_progreso', 'resuelto', 'presupuestado'],
})
estado: 'pendiente' | 'en_progreso' | 'resuelto' | 'presupuestado';


  @Prop()
  respuestaStaff?: string;

  // ✅ ARCHIVO ADJUNTO (PDF / IMG / WORD)
  @Prop({ default: null })
  archivo?: string;
}

export const FormularioSchema = SchemaFactory.createForClass(Formulario);
