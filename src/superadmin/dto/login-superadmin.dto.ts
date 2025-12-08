
import { IsString } from 'class-validator';

export class LoginSuperAdminDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
