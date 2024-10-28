import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publisher } from './entities/publisher.entity';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private publisherRepository: Repository<Publisher>,
  ) {}

  async generateIdentifierCode(
    createPublisherDto: CreatePublisherDto,
  ): Promise<string> {
    const { name, location } = createPublisherDto;
    const formattedName = name.slice(0, 3).toUpperCase();
    const formattedLocation = location
      ? location.slice(0, 3).toUpperCase()
      : 'AAA';
    const randomNumber = Math.floor(100 + Math.random() * 900);
    let identifierCode = `${formattedName}-${formattedLocation}-${randomNumber}`;
    // Check if the identifierCode already exists in the database
    const existingPublisher = await this.publisherRepository.findOne({
      where: { identifierCode },
    });
    while (existingPublisher) {
      // If it exists, generate a new identifierCode
      identifierCode = `${formattedName}${formattedLocation}-${Math.floor(100 + Math.random() * 900)}`;
    }
    return identifierCode;
  }
  /**
   * Create a new publisher
   * @param createPublisherDto
   * @returns savedPublisher
   */
  async createPublisher(
    createPublisherDto: CreatePublisherDto,
  ): Promise<Publisher> {
    try {
      const { name, location } = createPublisherDto;
      const identifierCode =
        await this.generateIdentifierCode(createPublisherDto);
      const publisher = this.publisherRepository.create({
        name,
        location,
        identifierCode,
      });
      const savedPublisher = await this.publisherRepository.save(publisher);
      return savedPublisher;
    } catch (error) {
      console.error('Error creating publisher:', error.message);
      throw new InternalServerErrorException(
        'An error occurred creating publisher. Please check server logs for details.',
        error.message,
      );
    }
  }

  findAll() {
    return `This action returns all publishers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} publisher`;
  }

  update(id: number, updatePublisherDto: UpdatePublisherDto) {
    return `This action updates a #${id} publisher`;
  }

  remove(id: number) {
    return `This action removes a #${id} publisher`;
  }
}
