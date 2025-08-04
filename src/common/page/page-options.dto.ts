import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";


export class PageOptionsDto {


  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  filter?: string = '';


}