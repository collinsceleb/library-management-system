import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LocationData } from 'src/common/interface/location-data/location-data.interface';

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
}
