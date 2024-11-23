import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LocationData } from 'src/common/interface/location-data/location-data.interface';
import { Repository } from 'typeorm';

@Injectable()
export class HelperService {
  constructor(private readonly configService: ConfigService) {}
  async getLocation(ipAddress: string) {
    try {
      const ipstackApiKey = this.configService.get<string>('IPSTACK_API_KEY');
      const response = await axios.get(
        `http://api.ipstack.com/${ipAddress}?access_key=${ipstackApiKey}`,
      );
      const {
        city,
        region_name,
        country_name,
        latitude,
        longitude,
      }: LocationData = response.data;
      return {
        city,
        region: region_name,
        country: country_name,
        latitude,
        longitude,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to retrieve location information',
        error,
      );
    }
  }

  /**
   * Generates a unique identifier code by combining the initials of a name,
   * a location segment, and a random 3-digit number.
   * @param initials - The name from which initials will be extracted.
   * @param location - A location string used to generate part of the code.
   * @returns A unique identifier code.
   */
  async generateIdentifierCode(
    initials: string,
    repository: Repository<any>,
    entityData: {
      firstName?: string;
      lastName?: string;
      name?: string;
      nationality?: string;
      birthDate?: Date;
    },
  ): Promise<string> {
    let identifierCode: string;
    const existingEntity = await repository.findOne({
      where: entityData,
    });
    console.log('existingEntity', existingEntity);

    if (existingEntity?.identifierCode) {
      return existingEntity.identifierCode;
    }
    let isUnique = false;
    do {
      const randomNumber = Math.floor(100 + Math.random() * 900);
      identifierCode = `${initials}-${randomNumber}`;
      const existingCode = await repository.exists({
        where: { identifierCode },
      });
      console.log('existingCode', existingCode);

      isUnique = !existingCode;
    } while (!isUnique);
    return identifierCode;
  }
}
