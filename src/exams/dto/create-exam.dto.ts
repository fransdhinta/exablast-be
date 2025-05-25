import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateExamDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}