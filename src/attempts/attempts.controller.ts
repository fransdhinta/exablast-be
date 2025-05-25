import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  create(@Body() createAttemptDto: CreateAttemptDto, @Request() req) {
    return this.attemptsService.create(createAttemptDto, req.user.id);
  }

  @Post(':id/answers')
  submitAnswer(
    @Param('id') attemptId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    return this.attemptsService.submitAnswer(attemptId, submitAnswerDto);
  }

  @Post('complete')
  completeAttempt(@Body() submitAttemptDto: SubmitAttemptDto, @Request() req) {
    return this.attemptsService.completeAttempt(submitAttemptDto, req.user.id);
  }

  @Get(':id')
  getAttempt(@Param('id') id: string, @Request() req) {
    return this.attemptsService.getAttempt(id, req.user.id);
  }

  @Get()
  getUserAttempts(@Request() req) {
    return this.attemptsService.getUserAttempts(req.user.id);
  }
}