import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Injectable()
export class AttemptsService {
  constructor(private prisma: PrismaService) {}

  async create(createAttemptDto: CreateAttemptDto, userId: string) {
    // Check if the exam exists
    const exam = await this.prisma.exam.findUnique({
      where: { id: createAttemptDto.examId },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${createAttemptDto.examId} not found`);
    }

    // Check if user has an existing incomplete attempt for this exam
    const existingAttempt = await this.prisma.attempt.findFirst({
      where: {
        userId,
        examId: createAttemptDto.examId,
        endedAt: null,
      },
    });

    if (existingAttempt) {
      return existingAttempt;
    }

    // Create a new attempt
    const attempt = await this.prisma.attempt.create({
      data: {
        examId: createAttemptDto.examId,
        userId,
        // startedAt is set automatically by the default value
      },
      include: {
        exam: true,
      },
    });

    return attempt;
  }

  async submitAnswer(attemptId: string, submitAnswerDto: SubmitAnswerDto) {
    // Check if attempt exists and is not completed
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    if (attempt.endedAt) {
      throw new BadRequestException('Cannot submit answer for a completed attempt');
    }

    // Check if question belongs to the exam
    const question = await this.prisma.question.findFirst({
      where: {
        id: submitAnswerDto.questionId,
        examId: attempt.examId,
      },
    });

    if (!question) {
      throw new BadRequestException('Question does not belong to this exam');
    }

    // Check if option belongs to the question
    const option = await this.prisma.option.findFirst({
      where: {
        id: submitAnswerDto.selectedOptionId,
        questionId: submitAnswerDto.questionId,
      },
    });

    if (!option) {
      throw new BadRequestException('Option does not belong to this question');
    }

    // Check if answer already exists for this question
    const existingAnswer = await this.prisma.answer.findFirst({
      where: {
        attemptId,
        selectedOption: {
          question: {
            id: submitAnswerDto.questionId,
          },
        },
      },
    });

    if (existingAnswer) {
      // Update the existing answer
      return this.prisma.answer.update({
        where: { id: existingAnswer.id },
        data: {
          selectedOptionId: submitAnswerDto.selectedOptionId,
        },
        include: {
          selectedOption: true,
        },
      });
    }

    // Create new answer
    return this.prisma.answer.create({
      data: {
        attemptId,
        selectedOptionId: submitAnswerDto.selectedOptionId,
      },
      include: {
        selectedOption: true,
      },
    });
  }

  async completeAttempt(submitAttemptDto: SubmitAttemptDto, userId: string) {
    const attemptId = submitAttemptDto.attemptId;
    
    // Get the attempt
    const attempt = await this.prisma.attempt.findFirst({
      where: { 
        id: attemptId,
        userId, // Ensure this attempt belongs to the user
      },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
        answers: {
          include: {
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    if (attempt.endedAt) {
      throw new BadRequestException('This attempt is already completed');
    }

    // Calculate grade
    const totalQuestions = attempt.exam.questions.length;
    let correctAnswers = 0;

    // Create a map of question ID to correct option ID
    const correctOptionsMap = new Map();
    attempt.exam.questions.forEach(question => {
      const correctOption = question.options.find(option => option.isCorrect);
      if (correctOption) {
        correctOptionsMap.set(question.id, correctOption.id);
      }
    });

    // Check each answer
    attempt.answers.forEach(answer => {
      const questionId = answer.selectedOption.questionId;
      const correctOptionId = correctOptionsMap.get(questionId);
      
      if (answer.selectedOptionId === correctOptionId) {
        correctAnswers++;
      }
    });

    // Calculate score as percentage
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Update the attempt with end time and score
    return this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        endedAt: new Date(),
        score,
      },
      include: {
        exam: {
          select: {
            title: true,
          },
        },
        answers: {
          include: {
            selectedOption: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    });
  }

  async getAttempt(attemptId: string, userId: string) {
    const attempt = await this.prisma.attempt.findFirst({
      where: { 
        id: attemptId,
        userId, // Ensure this attempt belongs to the user
      },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
        answers: {
          include: {
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    return attempt;
  }

  async getUserAttempts(userId: string) {
    return this.prisma.attempt.findMany({
      where: { userId },
      include: {
        exam: {
          select: {
            title: true,
            description: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }
}