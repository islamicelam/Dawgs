import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  isNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { User } from 'src/users/users.entity';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
