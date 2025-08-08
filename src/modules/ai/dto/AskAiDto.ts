import { IsBoolean, IsDateString, IsOptional, IsString, MinLength } from 'class-validator';


export class AskAiDto{

  @IsString()
  @MinLength(5)
  prompt: string;

  // Incluir contexto de comidas
  @IsOptional()
  @IsBoolean()
  includeToday?: boolean = true;

  // Rango opcional
  @IsOptional()
  @IsDateString()
  from?: string; // YYYY-MM-DD

  @IsOptional()
  @IsDateString()
  to?: string; // YYYY-MM-DD


}