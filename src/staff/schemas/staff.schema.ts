import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'staffusers'   // 🔥 AGREGAR ESTO
})
export class Staff extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'staff' })
  role: string;

  @Prop({ type: [String], default: [] })
  permisos: string[];
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
