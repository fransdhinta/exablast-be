import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitAttemptDto {
  @IsNotEmpty()
  @IsString()
  attemptId: string;
}