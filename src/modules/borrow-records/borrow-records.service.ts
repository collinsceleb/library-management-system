import { Injectable } from '@nestjs/common';
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';

@Injectable()
export class BorrowRecordsService {
  create(createBorrowRecordDto: CreateBorrowRecordDto) {
    return 'This action adds a new borrowRecord';
  }

  findAll() {
    return `This action returns all borrowRecords`;
  }

  findOne(id: number) {
    return `This action returns a #${id} borrowRecord`;
  }

  update(id: number, updateBorrowRecordDto: UpdateBorrowRecordDto) {
    return `This action updates a #${id} borrowRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} borrowRecord`;
  }
}
