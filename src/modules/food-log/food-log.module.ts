import { Module } from '@nestjs/common';
import { FoodLogService } from './food-log.service';
import { FoodLogController } from './food-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodLog } from './entities/foodLog.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([FoodLog, User])],
  providers: [FoodLogService],
  controllers: [FoodLogController],
  exports:[FoodLogService]
})
export class FoodLogModule {}
