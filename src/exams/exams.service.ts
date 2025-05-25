import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async create(createExamDto: CreateExamDto) {
    // Check if createdById is provided
    if (!createExamDto.createdById) {
      throw new BadRequestException('Creator ID is required');
    }

    return this.prisma.exam.create({
      data: {
        title: createExamDto.title,
        duration: createExamDto.duration,
        createdById: createExamDto.createdById, // Now TypeScript knows it's not undefined
        description: createExamDto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.exam.findMany({
      include: {
        questions: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }

  async update(id: string, updateExamDto: UpdateExamDto) {
    return this.prisma.exam.update({
      where: { id },
      data: updateExamDto,
    });
  }

  async remove(id: string) {
    // First check if exam exists
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    // Use a transaction to ensure all related entities are deleted
    return this.prisma.$transaction(async (tx) => {
      // 1. Get all questions for this exam
      const questions = await tx.question.findMany({
        where: { examId: id },
        select: { id: true },
      });
      const questionIds = questions.map(q => q.id);

      // 2. Get all attempts for this exam
      const attempts = await tx.attempt.findMany({
        where: { examId: id },
        select: { id: true },
      });
      const attemptIds = attempts.map(a => a.id);

      // 3. Delete answers related to these attempts
      if (attemptIds.length > 0) {
        await tx.answer.deleteMany({
          where: {
            attemptId: { in: attemptIds }
          },
        });
      }

      // 4. Delete options related to these questions
      if (questionIds.length > 0) {
        await tx.option.deleteMany({
          where: {
            questionId: { in: questionIds }
          },
        });
      }

      // 5. Delete attempts
      if (attemptIds.length > 0) {
        await tx.attempt.deleteMany({
          where: {
            id: { in: attemptIds }
          },
        });
      }

      // 6. Delete questions
      if (questionIds.length > 0) {
        await tx.question.deleteMany({
          where: {
            id: { in: questionIds }
          },
        });
      }

      // 7. Finally delete the exam
      return tx.exam.delete({
        where: { id },
      });
    });
  }
}