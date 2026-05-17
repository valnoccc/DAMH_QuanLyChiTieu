import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseType } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async create(userId: number, dto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...dto,
      userId,
      type: dto.type || ExpenseType.EXPENSE,
    });
    return this.expenseRepository.save(expense);
  }

  async findAll(userId: number, month?: number, year?: number): Promise<Expense[]> {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .where('expense.user_id = :userId', { userId })
      .orderBy('expense.transaction_date', 'DESC');

    if (month && year) {
      query.andWhere('MONTH(expense.transaction_date) = :month', { month });
      query.andWhere('YEAR(expense.transaction_date) = :year', { year });
    } else if (year) {
      query.andWhere('YEAR(expense.transaction_date) = :year', { year });
    }

    return query.getMany();
  }

  async findOne(userId: number, id: number): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    });
    if (!expense) throw new NotFoundException('Không tìm thấy giao dịch');
    return expense;
  }

  async update(userId: number, id: number, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(userId, id);
    Object.assign(expense, dto);
    return this.expenseRepository.save(expense);
  }

  async remove(userId: number, id: number): Promise<void> {
    const expense = await this.findOne(userId, id);
    await this.expenseRepository.remove(expense);
  }

  async getSummary(userId: number, month: number, year: number) {
    // Tổng chi tiêu tháng
    const totalExpense = await this.expenseRepository
      .createQueryBuilder('e')
      .select('SUM(e.amount)', 'total')
      .where('e.user_id = :userId AND e.type = :type', { userId, type: ExpenseType.EXPENSE })
      .andWhere('MONTH(e.transaction_date) = :month AND YEAR(e.transaction_date) = :year', { month, year })
      .getRawOne();

    // Tổng thu nhập tháng
    const totalIncome = await this.expenseRepository
      .createQueryBuilder('e')
      .select('SUM(e.amount)', 'total')
      .where('e.user_id = :userId AND e.type = :type', { userId, type: ExpenseType.INCOME })
      .andWhere('MONTH(e.transaction_date) = :month AND YEAR(e.transaction_date) = :year', { month, year })
      .getRawOne();

    // Chi tiêu theo danh mục trong tháng
    const byCategory = await this.expenseRepository
      .createQueryBuilder('e')
      .leftJoin('e.category', 'c')
      .select(['c.name AS name', 'c.icon AS icon', 'c.color AS color', 'SUM(e.amount) AS total'])
      .where('e.user_id = :userId AND e.type = :type', { userId, type: ExpenseType.EXPENSE })
      .andWhere('MONTH(e.transaction_date) = :month AND YEAR(e.transaction_date) = :year', { month, year })
      .groupBy('c.id')
      .getRawMany();

    // Chi tiêu 6 tháng gần nhất
    const last6Months = await this.expenseRepository
      .createQueryBuilder('e')
      .select([
        'YEAR(e.transaction_date) AS year',
        'MONTH(e.transaction_date) AS month',
        'SUM(e.amount) AS total',
      ])
      .where('e.user_id = :userId AND e.type = :type', { userId, type: ExpenseType.EXPENSE })
      .andWhere('e.transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)')
      .groupBy('YEAR(e.transaction_date), MONTH(e.transaction_date)')
      .orderBy('year, month')
      .getRawMany();

    // Số giao dịch trong tháng
    const count = await this.expenseRepository
      .createQueryBuilder('e')
      .where('e.user_id = :userId', { userId })
      .andWhere('MONTH(e.transaction_date) = :month AND YEAR(e.transaction_date) = :year', { month, year })
      .getCount();

    return {
      totalExpense: parseFloat(totalExpense?.total || '0'),
      totalIncome: parseFloat(totalIncome?.total || '0'),
      transactionCount: count,
      byCategory,
      last6Months,
    };
  }
}
