import { UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { JwtStrategy } from './jwt.strategy';
import { User, UserRoles } from './schemas/user.schema';

const mockUser = {
  _id: '61c0ccf11d7bf83d153d7c06',
  email: 'ghulam1@gmail.com',
  name: 'Ghulam',
  role: UserRoles.USER,
};

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let model: Model<User>;

  beforeEach(async () => {
    process.env.JWT_SECRET =
      'KLSDJF30945DJFDSK9345KJDFLKSD90485DSJFLKSDFJ349JFK';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validates and return the user', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockUser as any);

      const result = await jwtStrategy.validate({ id: mockUser._id });

      expect(model.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it('should throw Unauthorized Exception', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(null);

      expect(jwtStrategy.validate({ id: mockUser._id })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
