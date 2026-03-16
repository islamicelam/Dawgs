import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { STATUS_CATEGORIES, StatusCategory } from '../status-category';

export class CreateStatusDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEnum(STATUS_CATEGORIES)
  @IsNotEmpty()
  category: StatusCategory;
}
