import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Query } from 'express-serve-static-core';
import * as mongoose from 'mongoose';
import APIFeatures from '../utils/apiFeatures.utils';
import { Restaurant } from './schemas/restaurant.schema';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: mongoose.Model<Restaurant>,
  ) {}

  // Get all Restaurants  =>  GET  /restaurants
  async findAll(query: Query): Promise<Restaurant[]> {
    const resPerPage = 2;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = query.keyword
      ? {
          name: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    const restaurants = await this.restaurantModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);

    return restaurants;
  }

  // Create new Restaurant  =>  POST  /restaurants
  async create(restaurant: Restaurant): Promise<Restaurant> {
    const location = await APIFeatures.getRestaurantLocation(
      restaurant.address,
    );

    const data = Object.assign(restaurant, { location });

    const res = await this.restaurantModel.create(data);
    return res;
  }

  // Get a restaurant by ID  =>  GET  /restaurants/:id
  async findById(id: string): Promise<Restaurant> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new BadRequestException(
        'Wrong mongoose ID Error. Please enter correct ID.',
      );
    }

    const restaurant = await this.restaurantModel.findById(id);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    return restaurant;
  }

  // Update a resturant by ID  =>  PUT  /restaurants/:id
  async updateById(id: string, restaurant: Restaurant): Promise<Restaurant> {
    return await this.restaurantModel.findByIdAndUpdate(id, restaurant, {
      new: true,
      runValidators: true,
    });
  }

  // Delete a restaurant by ID  =>  DELETE  /restaurants/:id
  async deleteById(id: string): Promise<Restaurant> {
    return await this.restaurantModel.findByIdAndDelete(id);
  }
}
