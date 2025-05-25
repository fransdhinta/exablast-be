import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-questions')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  generateQuestions(@Body() generateQuestionsDto: GenerateQuestionsDto) {
    return this.aiService.generateQuestions(generateQuestionsDto);
  }
}