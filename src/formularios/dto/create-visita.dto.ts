import { IsString, IsOptional } from 'class-validator';

export class CreateVisitaDto {
  @IsString()
  empleadoApellido: string;

  @IsString()
  empleadoNombre: string;

  @IsString()
  empleadoDni: string;

  @IsOptional()
  @IsString()
  puesto?: string;

  @IsString()
  direccion: string;

  @IsString()
  localidad: string;

  @IsString()
  zona: string; // <-- NUEVO CAMPO

  @IsString()
  motivo: string;

  @IsString()
  solicitanteNombre: string;

  @IsString()
  solicitanteCelular: string;
}
