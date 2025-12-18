import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStaffDto {
  @ApiPropertyOptional({
    description: 'Nombre de usuario del staff',
    example: 'staff02',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña del staff',
    example: 'NuevaPass123!',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: 'Indica si el usuario staff está activo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
