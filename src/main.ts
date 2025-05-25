import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your Nuxt.js origin(s)
      credentials: true, // If you need to send cookies or authentication headers
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
