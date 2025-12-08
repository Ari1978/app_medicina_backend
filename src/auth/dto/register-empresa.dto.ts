import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------
// DTO DOMICILIO ✅
// ---------------------------------------
class DomicilioDto {
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsNotEmpty()
  localidad: string;

  @IsString()
  @IsNotEmpty()
  partido: string;

  @IsString()
  @IsNotEmpty()
  provincia: string;
}

// ---------------------------------------
// DTO CONTACTO
// ---------------------------------------
class ContactoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  celular: string;
}

export class RegisterEmpresaDto {
  // -------------------------
  // Empresa
  // -------------------------

  @IsString()
  @Length(11, 11)
  cuit: string;

  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  // ✅ CAMBIO CLAVE: YA NO ES STRING
  @ValidateNested()
  @Type(() => DomicilioDto)
  domicilio: DomicilioDto;

  // -------------------------
  // Contactos
  // -------------------------

  @ValidateNested()
  @Type(() => ContactoDto)
  contacto1: ContactoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactoDto)
  contacto2?: ContactoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactoDto)
  contacto3?: ContactoDto;

  // -------------------------
  // Mails
  // -------------------------

  @IsEmail()
  email1: string;

  @IsOptional()
  @IsEmail()
  email2?: string;

  @IsOptional()
  @IsEmail()
  email3?: string;

  // -------------------------
  // ART
  // -------------------------

  @IsString()
  @IsNotEmpty()
  art: string;

  // -------------------------
  // Seguridad
  // -------------------------

  @IsString()
  @Length(6, 50)
  password: string;
}
