import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { AskAiDto } from './dto/AskAiDto';


@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  async askQuestion(@Body('prompt') prompt: string) {
    return {
      answer: await this.aiService.askQuestion(prompt),
    };
  }
}