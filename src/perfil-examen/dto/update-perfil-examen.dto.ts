import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EstudioUpdateDto {
  @IsString()
  nombre: string;

  @IsString()
  sector: string;
}

export class UpdatePerfilExamenDto {
  // ✅ AHORA COINCIDE CON EL SCHEMA
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstudioUpdateDto)
  estudios?: EstudioUpdateDto[];
}
