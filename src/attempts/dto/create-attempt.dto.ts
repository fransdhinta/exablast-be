import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAttemptDto {
  @IsNotEmpty()
  @IsString()
  examId: string;
}