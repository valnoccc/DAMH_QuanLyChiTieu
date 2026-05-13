import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật tính năng CORS
  app.enableCors({
    origin: 'http://localhost:5173', // Địa chỉ Frontend của bạn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép gửi token/cookie nếu cần
  });

  await app.listen(3000);
}
bootstrap();