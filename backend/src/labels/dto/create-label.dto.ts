import { IsString, Matches } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a hex color (#RRGGBB)',
  })
  color: string;
}
