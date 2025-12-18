import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class ResultadoEstudioDto {
  @ApiProperty({ example: 'Audiometría' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Laboratorio' })
  @IsString()
  sector: string;

  @ApiProperty({ enum: ['realizado'] })
  @IsEnum(['realizado'])
  estado: 'realizado';

  @ApiProperty({ example: 'Valores dentro de parámetros normales' })
  @IsString()
  resumen: string;
}
