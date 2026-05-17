import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, IsPositive } from 'class-validator';
import { ExpenseType } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  storeName: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsEnum(ExpenseType)
  type?: ExpenseType;

  @IsOptional()
  @IsString()
  receiptImageUrl?: string;
}
