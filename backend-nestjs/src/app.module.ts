// File: src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/auth.entity';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { Category } from './categories/entities/category.entity';
import { Expense } from './expenses/entities/expense.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 4000,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Category, Expense],
        synchronize: false,
        ssl: { rejectUnauthorized: true },
      }),
    }),

    AuthModule,
    CategoriesModule,
    ExpensesModule,
    ReceiptsModule,
  ],
})
export class AppModule { }