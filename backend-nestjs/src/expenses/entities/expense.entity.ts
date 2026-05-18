import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/auth.entity';
import { Category } from '../../categories/entities/category.entity';

export enum ExpenseType {
  EXPENSE = 'expense',
  INCOME = 'income',
}

@Entity('transactions')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, { nullable: true, eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'transaction_date', type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: ExpenseType,
    default: ExpenseType.EXPENSE,
  })
  type: ExpenseType;

  @Column({ name: 'receipt_image_url', type: 'varchar', length: 500, nullable: true })
  receiptImageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
