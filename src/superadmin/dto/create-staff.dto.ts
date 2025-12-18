import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({
    description: 'Nombre de usuario del staff',
    example: 'staff01',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Contraseña del staff',
    example: 'Staff123!',
  })
  @IsString()
  password: string;
}
