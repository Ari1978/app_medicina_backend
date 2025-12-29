import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ResultadoPracticaDto {
  // ============================
  // CÓDIGO DE PRÁCTICA / ESTUDIO
  // ============================
  @ApiProperty({
    example: '503',
    description: 'Código de la práctica (referencia al catálogo)',
  })
  @IsString()
  codigo: string; // 🔑 clave única, coincide con catálogo

  // ============================
  // ESTADO
  // ============================
  @ApiProperty({
    enum: ['pendiente', 'realizado'],
    example: 'realizado',
  })
  @IsEnum(['pendiente', 'realizado'])
  estado: 'pendiente' | 'realizado';

  // ============================
  // RESULTADO (OPCIONAL)
  // ============================
  @ApiPropertyOptional({
    example: 'Valores dentro de parámetros normales',
  })
  @IsOptional()
  @IsString()
  resultado?: string;
}

