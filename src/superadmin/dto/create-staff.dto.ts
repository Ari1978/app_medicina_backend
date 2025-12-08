
import { IsString } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
