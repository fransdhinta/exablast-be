import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { SaveQuestionsDto } from './dto/save-questions.dto';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Initialize Google Generative AI with your API key
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY') || '',
    );
  }

  async generateQuestions(generateQuestionsDto: GenerateQuestionsDto) {
    const { topic, difficulty, count } = generateQuestionsDto;
    
    try {
      // Create a prompt for Gemini
      const prompt = `Generate ${count} multiple-choice questions about ${topic} at ${difficulty} difficulty level. 
      For each question, provide 4 options with exactly 1 correct answer. 
      Format the response as a JSON array with objects containing: 
      {
        "text": "The question text here?",
        "options": [
          {"text": "Option 1", "isCorrect": false},
          {"text": "Option 2", "isCorrect": true},
          {"text": "Option 3", "isCorrect": false},
          {"text": "Option 4", "isCorrect": false}
        ]
      }`;

      // Access the gemini-2.0-flash-001 model
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      try {
        // Extract JSON from the response using regex
        const jsonMatch = content?.match(/\[[\s\S]*\]/);
        const questionsData = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        
        return {
          success: true,
          count: questionsData.length,
          questions: questionsData,
        };
      } catch (parseError) {
        this.logger.error('Failed to parse AI response', parseError);
        return {
          success: false,
          error: 'Failed to parse AI response',
          rawResponse: content,
        };
      }
    } catch (error) {
      this.logger.error('Google Generative AI error', error);
      return {
        success: false,
        error: 'Failed to generate questions',
      };
    }
  }

  async saveQuestions(saveQuestionsDto: SaveQuestionsDto) {
    const { questions, examId } = saveQuestionsDto;
    
    // Define explicit type for createdQuestions array
    const createdQuestions: Array<{
      id: string;
      text: string;
      examId: string;
      isGenerated: boolean;
      options: Array<{
        id: string;
        text: string;
        isCorrect: boolean;
        questionId: string;
      }>;
    }> = [];
    
    try {
      for (const questionData of questions) {
        const { text, options } = questionData;
        
        const question = await this.prisma.question.create({
          data: {
            text,
            examId,
            isGenerated: true,
            options: {
              create: options,
            },
          },
          include: {
            options: true,
          },
        });
        
        createdQuestions.push(question);
      }
      
      return {
        success: true,
        count: createdQuestions.length,
        questions: createdQuestions,
      };
    } catch (error) {
      this.logger.error('Error saving questions to database', error);
      return {
        success: false,
        error: 'Failed to save questions',
      };
    }
  }
}