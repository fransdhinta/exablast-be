import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const { options, ...questionData } = createQuestionDto;

    return this.prisma.question.create({
      data: {
        ...questionData,
        options: {
          create: options,
        },
      },
      include: {
        options: true,
      },
    });
  }

  async findAll() {
    return this.prisma.question.findMany({
      include: {
        options: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
      include: {
        options: true,
      },
    });
  }

  async findByExam(examId: string) {
    return this.prisma.question.findMany({
      where: {
        examId,
      },
      include: {
        options: true,
      },
    });
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const { options, ...questionData } = updateQuestionDto;

    // First update the question
    const updatedQuestion = await this.prisma.question.update({
      where: { id },
      data: questionData,
    });

    // If options are provided, handle them separately
    if (options && options.length > 0) {
      // Delete existing options
      await this.prisma.option.deleteMany({
        where: { questionId: id },
      });

      // Create new options
      await this.prisma.option.createMany({
        data: options.map(option => ({
          ...option,
          questionId: id,
        })),
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // First delete related options
    await this.prisma.option.deleteMany({
      where: { questionId: id },
    });

    // Then delete the question
    return this.prisma.question.delete({
      where: { id },
    });
  }
}