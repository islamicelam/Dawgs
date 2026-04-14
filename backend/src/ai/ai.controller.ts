import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ImproveTextDto } from './dto/improve-text.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('improve-text')
  async improveText(@Body() improveTextDto: ImproveTextDto) {
    return this.aiService.improveText(improveTextDto.text);
  }
}
