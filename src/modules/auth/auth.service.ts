import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CheckUserDataDto } from './dto/check-user-data.dto';
import { isEmail } from 'class-validator';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly authRepository: Repository<User>){}

  /**
   * Self-made registration
   * @param createAuthDto 
   * @returns User
   */
  async register(createAuthDto: CreateAuthDto): Promise<User> {
    try {
      if (typeof createAuthDto.email !== 'string') {
        throw new BadRequestException('Email should be string');
      }
      if (!isEmail(createAuthDto.email)) {
        throw new BadRequestException('invalid email format')
      }
      const user = this.authRepository.create({
        lastName: createAuthDto.lastName,
        firstName: createAuthDto.firstName,
        username: createAuthDto.username,
        email: createAuthDto.email,
        password: createAuthDto.password
      });
      await user.hashPassword();
      return await this.authRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async checkUserExists(checkUserDataDto: CheckUserDataDto): Promise<boolean> {
    try {
      const { email, username } = checkUserDataDto;
      const [userByUsername, userByEmail] = await Promise.all([
        this.authRepository.findOne({ where: { username } }),
        this.authRepository.findOne({ where: { email } }),
      ]);
      if (userByUsername) {
        throw new BadRequestException('Username already exists');      
      }
      if (userByEmail) {
        throw new BadRequestException('Email already exists');
      }
      return false;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
