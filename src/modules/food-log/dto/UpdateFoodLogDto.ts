import { PartialType } from '@nestjs/swagger';
import { CreateFoodLogDto } from './CreateFoodLogDto';


export class UpdateFoodLogDto  extends PartialType(CreateFoodLogDto){}