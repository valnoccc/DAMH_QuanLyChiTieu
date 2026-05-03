import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // 1. Để đọc được các biến từ file .env (nếu có)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Cấu hình kết nối MySQL (WampServer)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_finance_db',
      entities: [],
      synchronize: true,
    }),
  ],
})
export class AppModule { }