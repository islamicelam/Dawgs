import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { User } from 'src/users/user.entity';

export class UpdateTaskDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsOptional()
  assignee?: User;

  @IsBoolean()
  @IsOptional()
  isDone?: boolean;
}
