import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class OptionDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;
}

class QuestionDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];
}

export class SaveQuestionsDto {
  @IsNotEmpty()
  @IsString()
  examId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}