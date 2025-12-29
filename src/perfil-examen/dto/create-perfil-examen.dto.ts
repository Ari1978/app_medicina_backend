import {
  IsArray,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';

export class CreatePerfilExamenDto {
  @IsString()
  @IsNotEmpty()
  puesto: string;

  @IsEnum(['ingreso', 'periodico', 'egreso'])
  tipo: 'ingreso' | 'periodico' | 'egreso';

  @IsMongoId()
  empresaId: string;

  /**
   * Códigos de prácticas asociadas al perfil
   * Ej: ['100','400','503']
   */
  @IsArray()
  @IsString({ each: true })
  practicasPerfil: string[];
}
