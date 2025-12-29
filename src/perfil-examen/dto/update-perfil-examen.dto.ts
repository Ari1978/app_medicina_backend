import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

// =========================
// ACTUALIZAR PERFIL DE EXAMEN
// =========================
export class UpdatePerfilExamenDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  puesto?: string;

  @IsOptional()
  @IsEnum(['ingreso', 'periodico', 'egreso'])
  tipo?: 'ingreso' | 'periodico' | 'egreso';

  /**
   * Códigos de prácticas asociadas al perfil
   * Ej: ['100','400','503']
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  practicasPerfil?: string[];
}
