import { IsString, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EstudioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  sector: string;
}

export class CreatePerfilExamenDto {
  @IsString()
  @IsNotEmpty()
  puesto: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstudioDto)
  estudios: EstudioDto[];

  @IsString()
  @IsNotEmpty()
  empresaId: string;
}
