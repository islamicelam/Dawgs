import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { USER_ROLES, UserRole } from '../../auth/roles';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsOptional()
  @IsIn(Object.values(USER_ROLES))
  role?: UserRole;
}