
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Nombre de usuario del admin',
    example: 'admin01',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Contraseña del admin',
    example: 'Admin123!',
  })
  @IsString()
  password: string;
}
