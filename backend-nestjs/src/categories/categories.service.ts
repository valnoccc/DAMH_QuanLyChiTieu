import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(type?: string): Promise<Category[]> {
    if (type) {
      return this.categoryRepository.find({
        where: [{ type: type as CategoryType }, { type: CategoryType.BOTH }],
      });
    }
    return this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    return this.categoryRepository.findOne({ where: { id } });
  }
}
