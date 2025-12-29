import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'practicas' })
export class Practica {
  /**
   * Código único de la práctica (ID lógico)
   * Ej: '100', '503'
   */
  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  codigo: string;

  /**
   * Nombre descriptivo
   * Ej: 'Audiometría'
   */
  @Prop({ required: true })
  nombre: string;

  /**
   * Sector al que pertenece
   * Ej: 'Laboratorio', 'Rayos'
   */
  @Prop({ required: true })
  sector: string;

  /**
   * Permite desactivar prácticas sin borrarlas
   */
  @Prop({ default: true })
  activo: boolean;
}

export const PracticaSchema =
  SchemaFactory.createForClass(Practica);
