import { IsString, MinLength, IsNumber, IsOptional } from 'class-validator';
import { User } from 'src/users/users.entity';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(3)
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  assign?: User;
}
