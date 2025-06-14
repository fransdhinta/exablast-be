import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
  
  @IsOptional()
  @IsString()
  currentPassword?: string; // Required when updating password
}