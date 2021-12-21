import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { MealService } from './meal.service';
import { Meal } from './schemas/meal.schema';

@Controller('meals')
export class MealController {
  constructor(private mealService: MealService) {}

  @Get()
  async getAllMeals(): Promise<Meal[]> {
    return this.mealService.findAll();
  }

  @Get('restaurant/:id')
  async getMealsByRestaurant(@Param('id') id: string): Promise<Meal[]> {
    return this.mealService.findByRestaurant(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  createMeal(
    @Body() createMealDto: CreateMealDto,
    @CurrentUser() user: User,
  ): Promise<Meal> {
    return this.mealService.create(createMealDto, user);
  }

  @Get(':id')
  async getMeal(@Param('id') id: string): Promise<Meal> {
    return this.mealService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async updateMeal(
    @Body() updateMealDto: UpdateMealDto,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Meal> {
    const meal = await this.mealService.findById(id);

    if (meal.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can not update this meal.');
    }

    return this.mealService.updateById(id, updateMealDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteMeal(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<{ deleted: Boolean }> {
    const meal = await this.mealService.findById(id);

    if (meal.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can not update this meal.');
    }

    return this.mealService.deleteById(id);
  }
}
