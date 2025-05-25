import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ExamsModule } from './exams/exams.module';
import { QuestionsModule } from './questions/questions.module';
import { AiModule } from './ai/ai.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AttemptsModule } from './attempts/attempts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ExamsModule,
    QuestionsModule,
    AiModule,
    DashboardModule,
    AttemptsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}