import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { AskAiDto } from './dto/AskAiDto';
import { UserInfo } from '../food-log/entities/UserInfo';
import { UserInfoDecorator } from '../../common/decorators/user-info.decorator';


@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  ask(@Body('prompt') prompt: string) {
    return this.aiService.askQuestion(prompt);
  }

  @Post('ask-with-foodlog')
  askWithFoodLog(
    @Body() dto: AskAiDto,
    @UserInfoDecorator() user: UserInfo){
    return this.aiService.askWithContext(dto, user);
  }

  @Post('ping')
  @UseGuards(AuthGuard('jwt'))
  async ping() {
    return this.aiService.askQuestion('Di "pong" y nada más.');
  }

  @Get('me')
  whoAmI(
    @UserInfoDecorator('userId') userId: string,         // solo el id
  ) { return { userId }; }


  @Post('ask-lunch')
  askLunch(
    @UserInfoDecorator() user: UserInfo,
    @Body('prompt') prompt?: string,
  ){
    return this.aiService.askLunchSummary(user, prompt);
  }

}