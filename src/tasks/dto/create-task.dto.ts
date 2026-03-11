import { IsString, MinLength, IsNumber, IsOptional } from 'class-validator';

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
  assignId?: number;

  @IsOptional()
  @IsNumber()
  statusId?: number;
}
