import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { USER_ROLES, UserRole } from '../../auth/roles';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsIn(Object.values(USER_ROLES))
  role: UserRole;
}
