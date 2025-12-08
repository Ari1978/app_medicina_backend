import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSedeDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  provincia: string;

  @IsString()
  @IsNotEmpty()
  partido: string;

  @IsString()
  @IsNotEmpty()
  localidad: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsString()
  @IsNotEmpty()
  telefono1: string;

  @IsOptional()
  @IsString()
  telefono2?: string;

  @IsString()
  @IsNotEmpty()
  horarios: string;
}
