import { Injectable, BadRequestException } from '@nestjs/common';
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
    return this.prisma.exam.delete({
      where: { id },
    });
  }
}