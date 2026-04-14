import { IsNotEmpty, IsString } from 'class-validator';

export class ImproveTextDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
