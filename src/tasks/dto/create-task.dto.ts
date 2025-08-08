import { IsString, MinLength, IsNotEmpty } from "class-validator";

export class CreateTaskDto {
    @IsString()
    @MinLength(3)
    @IsNotEmpty()
    title: string;
}