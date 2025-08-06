import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {

  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  async ask(
    @Body('prompt') prompt: string
  ){
    const answer = await this.aiService.askQuestion(prompt);
    return { answer }

  }


}
