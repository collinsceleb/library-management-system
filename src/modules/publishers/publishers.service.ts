import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publisher } from './entities/publisher.entity';
import { HelperService } from '../../common/utils/helper/helper.service';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    private readonly helperService: HelperService,
  ) {}

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
      const initials = name
        .split(' ')
        .map((word) => word[0].toUpperCase())
        .join('');
      const identifierCode = await this.helperService.generateIdentifierCode(
        initials,
        this.publisherRepository,
        { name },
      );
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

  async fetchAllPublishers(): Promise<Publisher[]> {
    try {
      const publishers = await this.publisherRepository.find();
      return publishers;
    } catch (error) {
      console.error('Error fetching publishers:', error.message);
      throw new InternalServerErrorException(
        'An error occurred fetching publishers. Please check server logs for details.',
        error,
      );
    }
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
