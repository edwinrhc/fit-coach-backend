import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';


export class CreateFoodLogDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsString()
  notes?: string;

}