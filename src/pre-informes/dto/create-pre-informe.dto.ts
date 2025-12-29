import {
  IsString,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreatePreInformeDto {
  @IsString()
  turnoId: string;

  @IsArray()
  textoPorPractica: {
    codigoPractica: string;
    texto: string;
  }[];

  @IsOptional()
  @IsString()
  observacionGeneral?: string;
}
