import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class GenerateQuestionsDto {
  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsNotEmpty()
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(20)
  count: number;

  @IsNotEmpty()
  @IsString()
  examId: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}