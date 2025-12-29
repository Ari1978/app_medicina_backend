import {
  IsArray,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePracticasDto {
  // ============================
  // LISTA DE PRÁCTICAS (CÓDIGOS)
  // ============================
  @ApiProperty({
    description: 'Lista de códigos de prácticas a realizar',
    example: ['503', '502', '100'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  listaPracticas: string[];
}
