import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodLog } from '../food-log/entities/foodLog.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([FoodLog,User])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
