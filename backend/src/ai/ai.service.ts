import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly gemini: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.gemini = new GoogleGenerativeAI(apiKey);
  }

  async improveText(text: string): Promise<string> {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(
      `Улучши текст описания задачи. Сделай его чётким и профессиональным. Верни только улучшенный текст без объяснений.\n\n${text}`,
    );

    return result.response.text();
  }
}
