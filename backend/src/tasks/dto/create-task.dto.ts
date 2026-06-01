import {
  IsString,
  MinLength,
  IsNumber,
  IsOptional,
  IsIn,
  IsISO8601,
} from 'class-validator';
import { TaskPriority } from '../tasks.entity';

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

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: TaskPriority;

  @IsOptional()
  @IsISO8601()
  dueDate?: string | null;
}
