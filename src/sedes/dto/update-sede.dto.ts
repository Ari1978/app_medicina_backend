import { IsString, IsOptional } from 'class-validator';

export class UpdateSedeDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  partido?: string;

  @IsOptional()
  @IsString()
  localidad?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono1?: string;

  @IsOptional()
  @IsString()
  telefono2?: string;

  @IsOptional()
  @IsString()
  horarios?: string;
}
