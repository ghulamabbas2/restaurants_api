import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import APIFeatures from '../utils/apiFeatures.utils';
import { UserRoles } from '../auth/schemas/user.schema';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './schemas/restaurant.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockRestaurant = {
  user: '61c0ccf11d7bf83d153d7c06',
  menu: [],
  location: {
    type: 'Point',
    coordinates: [-77.376204, 38.492151],
    formattedAddress: '200 Olympic Dr, Stafford, VA 22554-7763, US',
    city: 'Stafford',
    state: 'VA',
    zipcode: '22554-7763',
    country: 'US',
  },
  images: [],
  category: 'Fast Food',
  address: '200 Olympic Dr, Stafford, VS, 22554',
  phoneNo: 9788246116,
  email: 'ghulam@gamil.com',
  description: 'This is just a description',
  name: 'Retaurant 4',
  _id: '61c4aa2ffaa767823d1687ef',
  createdAt: '2021-12-23T16:56:15.127Z',
  updatedAt: '2021-12-23T16:56:15.127Z',
};

const mockUser = {
  _id: '61c0ccf11d7bf83d153d7c06',
  email: 'ghulam1@gmail.com',
  name: 'Ghulam',
  role: UserRoles.USER,
};

const mockRestaurantService = {
  find: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('RestaurantService', () => {
  let service: RestaurantsService;
  let model: Model<Restaurant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getModelToken(Restaurant.name),
          useValue: mockRestaurantService,
        },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
    model = module.get<Model<Restaurant>>(getModelToken(Restaurant.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should get all restaurants', async () => {
      jest.spyOn(model, 'find').mockImplementationOnce(
        () =>
          ({
            limit: () => ({
              skip: jest.fn().mockResolvedValue([mockRestaurant]),
            }),
          } as any),
      );

      const restaurants = await service.findAll({ keyword: 'restaurant' });
      expect(restaurants).toEqual([mockRestaurant]);
    });
  });

  describe('create', () => {
    const newRestaurant = {
      category: 'Fast Food',
      address: '200 Olympic Dr, Stafford, VS, 22554',
      phoneNo: 9788246116,
      email: 'ghulam@gamil.com',
      description: 'This is just a description',
      name: 'Retaurant 4',
    };

    it('should create a new restaurant', async () => {
      jest
        .spyOn(APIFeatures, 'getRestaurantLocation')
        .mockImplementationOnce(() => Promise.resolve(mockRestaurant.location));

      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockRestaurant));

      const result = await service.create(
        newRestaurant as any,
        mockUser as any,
      );
      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('findById', () => {
    it('should get restaurant by Id', async () => {
      jest
        .spyOn(model, 'findById')
        .mockResolvedValueOnce(mockRestaurant as any);

      const result = await service.findById(mockRestaurant._id);
      expect(result).toEqual(mockRestaurant);
    });

    it('should throw wrong moongose id error', async () => {
      await expect(service.findById('wrongid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw restaruant not found error', async () => {
      const mockError = new NotFoundException('Restaurant not found.');
      jest.spyOn(model, 'findById').mockRejectedValue(mockError);

      await expect(service.findById(mockRestaurant._id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateById', () => {
    it('should update the restaurant', async () => {
      const restaurant = { ...mockRestaurant, name: 'Updated name' };
      const updateRestaurant = { name: 'Updated name' };

      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockResolvedValueOnce(restaurant as any);

      const updatedRestaurant = await service.updateById(
        restaurant._id,
        updateRestaurant as any,
      );
      expect(updatedRestaurant.name).toEqual(updateRestaurant.name);
    });
  });

  describe('deleteById', () => {
    it('should delete the restaurant', async () => {
      jest
        .spyOn(model, 'findByIdAndDelete')
        .mockResolvedValueOnce(mockRestaurant as any);

      const result = await service.deleteById(mockRestaurant._id);
      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('uploadImages', () => {
    it('should upload restaurant images on S3 Bucket', async () => {
      const mockImages = [
        {
          ETag: '"f130032ca8fc855c9687e8e14e8f10df"',
          Location:
            'https://restarurant-api-bucket.s3.amazonaws.com/restaurants/image1.jpeg',
          key: 'restaurants/image1.jpeg',
          Key: 'restaurants/image1.jpeg',
          Bucket: 'restarurant-api-bucket',
        },
      ];

      const updatedRestaurant = { ...mockRestaurant, images: mockImages };

      jest.spyOn(APIFeatures, 'upload').mockResolvedValueOnce(mockImages);

      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockResolvedValueOnce(updatedRestaurant as any);

      const files = [
        {
          fieldname: 'files',
          originalname: 'image1.jpeg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer:
            '<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff e2 02 1c 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 02 0c 6c 63 6d 73 02 10 00 00 ... 19078 more bytes>',
          size: 19128,
        },
      ];

      const result = await service.uploadImages(mockRestaurant._id, files);
      expect(result).toEqual(updatedRestaurant);
    });
  });

  describe('deleteImages', () => {
    it('should delete restaurant images from S3 Bucket', async () => {
      const mockImages = [
        {
          ETag: '"f130032ca8fc855c9687e8e14e8f10df"',
          Location:
            'https://restarurant-api-bucket.s3.amazonaws.com/restaurants/image1.jpeg',
          key: 'restaurants/image1.jpeg',
          Key: 'restaurants/image1.jpeg',
          Bucket: 'restarurant-api-bucket',
        },
      ];

      jest.spyOn(APIFeatures, 'deleteImages').mockResolvedValueOnce(true);

      const result = await service.deleteImages(mockImages);
      expect(result).toBe(true);
    });
  });
});
