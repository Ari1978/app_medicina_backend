import { IsString, MinLength } from 'class-validator';

export class CreateServicioUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
