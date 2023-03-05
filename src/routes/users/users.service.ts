import { Injectable } from '@nestjs/common';
import { sleep } from 'src/utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  create(body: CreateUserDto) {
    return `This action adds a new user ${JSON.stringify(body, null, 2)}`;
  }

  async findAll() {
    await sleep(2000);
    return `This action returns all users`;
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
