import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AvailabilityDocument = Availability & Document;

@Schema({ timestamps: true })
export class Availability {
  @Prop({ required: true })
  fecha: string; // formato YYYY-MM-DD

  @Prop({ type: Object, default: {} })
  cupos: Record<string, number>;

  @Prop({ type: [String], default: [] })
  bloqueados: string[];
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);

// ✅ ESTO VA AFUERA DE LA CLASE (OBLIGATORIO)
AvailabilitySchema.index({ fecha: 1 }, { unique: true });
