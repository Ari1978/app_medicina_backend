import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Empresa extends Document {
  // ---------------------------------------
  // Identificación principal
  // ---------------------------------------
  @Prop({ required: true, unique: true })
  cuit: string;

  @Prop({ required: true })
  razonSocial: string;

  // ---------------------------------------
  // DOMICILIO ESTRUCTURADO ✅ AHORA OPCIONAL
  // ---------------------------------------
  @Prop({
    required: false,
    default: null,
    type: {
      direccion: { type: String },
      localidad: { type: String },
      partido: { type: String },
      provincia: { type: String },
    },
  })
  domicilio?: {
    direccion?: string;
    localidad?: string;
    partido?: string;
    provincia?: string;
  };

  // ---------------------------------------
  // Contactos
  // ---------------------------------------
  @Prop({
    required: false,
    default: null,
    type: {
      nombre: { type: String },
      celular: { type: String },
    },
  })
  contacto1?: {
    nombre?: string;
    celular?: string;
  };

  @Prop({
    type: {
      nombre: String,
      celular: String,
    },
    default: null,
  })
  contacto2?: {
    nombre?: string;
    celular?: string;
  };

  @Prop({
    type: {
      nombre: String,
      celular: String,
    },
    default: null,
  })
  contacto3?: {
    nombre?: string;
    celular?: string;
  };

  // ---------------------------------------
  // Mails
  // ---------------------------------------
  @Prop({ required: false })
  email1?: string;

  @Prop()
  email2?: string;

  @Prop()
  email3?: string;

  // ---------------------------------------
  // ART ✅ AHORA OPCIONAL
  // ---------------------------------------
  @Prop({ required: false })
  art?: string;

  // ---------------------------------------
  // Seguridad
  // ---------------------------------------
 @Prop({ required: true })
password: string;

@Prop({ default: true })
mustChangePassword: boolean;
  // ---------------------------------------
  // Estado del sistema
  // ---------------------------------------
  @Prop({ default: true })
  activo: boolean;

  @Prop({ type: Array, default: [] })
  usuariosAutorizados: any[];

  @Prop({ type: String, default: 'empresa' })
  role: string;
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);
