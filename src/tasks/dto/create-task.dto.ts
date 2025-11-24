import { IsString, MinLength, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { User } from "src/users/user.entity";

export class CreateTaskDto {
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    title: string;

    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    assign: User;
}