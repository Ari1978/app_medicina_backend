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

  // ✅ NUEVOS CAMPOS GEO (REEMPLAZAN ZONA)
  @IsString()
  provincia: string;

  @IsString()
  partido: string;

  @IsString()
  localidad: string;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsString()
  solicitanteNombre: string;

  @IsString()
  solicitanteCelular: string;
}
