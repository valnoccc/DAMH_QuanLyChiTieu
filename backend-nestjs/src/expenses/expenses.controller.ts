import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, UseGuards, Query, ParseIntPipe,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.expensesService.findAll(
      user.userId,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('stats/summary')
  getSummary(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const now = new Date();
    return this.expensesService.getSummary(
      user.userId,
      month ? parseInt(month) : now.getMonth() + 1,
      year ? parseInt(year) : now.getFullYear(),
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.expensesService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.expensesService.remove(user.userId, id);
  }
}
