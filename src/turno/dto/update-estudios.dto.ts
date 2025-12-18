import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstudiosDto {
  @ApiProperty({
    description: 'Lista de estudios a realizar',
    example: ['Audiometría', 'Espirometría', 'Laboratorio'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  listaEstudios: string[];
}
