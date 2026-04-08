import { IsString, MinLength, IsNumber, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  assignId?: number;

  @IsOptional()
  @IsNumber()
  statusId?: number;

  @IsOptional()
  @IsString()
  type?: 'TASK' | 'USER_STORY' | 'EPIC';

  @IsOptional()
  linkedTaskIds?: number[];

  @IsOptional()
  subtasks?: { id: string; text: string; done: boolean }[];

  @IsOptional()
  @IsNumber()
  parentEpicId?: number;

  @IsOptional()
  @IsNumber()
  parentStoryId?: number;
}
