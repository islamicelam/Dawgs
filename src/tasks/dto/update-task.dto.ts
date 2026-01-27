import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { User } from 'src/users/users.entity';

export class UpdateTaskDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(3)
  @IsOptional()
  description?: string;

  @IsOptional()
  assign?: User;

  @IsBoolean()
  @IsOptional()
  isDone?: boolean;
}
