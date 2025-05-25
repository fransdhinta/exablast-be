import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
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
  examId: string; // String UUID in your schema
}