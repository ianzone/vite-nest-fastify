import { Injectable } from '@nestjs/common';
import { sleep } from 'src/utils';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    await sleep(2000);
    return 'Hello World!';
  }
}
