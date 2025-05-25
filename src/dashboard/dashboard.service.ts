import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: string): Promise<DashboardStatsDto> {
    // Get count of exams created by the user
    const examCount = await this.prisma.exam.count({
      where: {
        createdById: userId,
      },
    });

    // Get IDs of all exams created by the user
    const userExams = await this.prisma.exam.findMany({
      where: {
        createdById: userId,
      },
      select: {
        id: true,
      },
    });

    const userExamIds = userExams.map(exam => exam.id);

    // Get count of all questions in those exams
    const questionCount = await this.prisma.question.count({
      where: {
        examId: {
          in: userExamIds,
        },
      },
    });

    // Get count of AI-generated questions in those exams
    const aiGeneratedQuestionCount = await this.prisma.question.count({
      where: {
        examId: {
          in: userExamIds,
        },
        isGenerated: true,
      },
    });

    return {
      examCount,
      questionCount,
      aiGeneratedQuestionCount,
    };
  }
}