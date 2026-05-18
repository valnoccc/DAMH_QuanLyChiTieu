import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum CategoryType {
  EXPENSE = 'expense',
  INCOME = 'income',
  BOTH = 'both',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, default: '💰' })
  icon: string;

  @Column({ type: 'varchar', length: 20, default: '#6366f1' })
  color: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.EXPENSE,
  })
  type: CategoryType;
}
