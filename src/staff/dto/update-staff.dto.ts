
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
