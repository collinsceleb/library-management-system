import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as generatePassword from 'generate-password';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { Role } from '../roles/entities/role.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}
  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; tempPassword: string }> {
    try {
      const { username, password, email, lastName, firstName, role } =
        createUserDto;
      await this.authService.checkUserExists({ email: email, username: username });
      const tempPassword = generatePassword.generate({
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
      });
      const user = this.userRepository.create({
        lastName: lastName,
        firstName: firstName,
        username: username,
        email: email,
        password: tempPassword,
        role: role as unknown as Role,
        isAdminsCreation: true,
      });
      await user.hashPassword();
      const savedUser = await this.userRepository.save(user);
      return { user: savedUser, tempPassword };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException(
        'An error occurred while creating user. Please check server logs for details.',
        error,
      );
    }
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto): Promise<User> {
    try {
      const { email, newPassword } = updatePasswordDto;
      const user = await this.userRepository.findOne({
        where: {
          email: email,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.password = newPassword;
      user.isPasswordChanged = true;
      await user.hashPassword();
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      console.error('Error updating password:', error);
      throw new InternalServerErrorException(
        'An error occurred while updating password. Please check server logs for details.',
        error,
      );
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
