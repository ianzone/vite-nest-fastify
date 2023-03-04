import { Injectable, Scope } from '@nestjs/common';
import { ReqAuxData } from './interfaces';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
  private data: ReqAuxData;

  setAuxData(data: ReqAuxData) {
    this.data = data;
  }
  getAuxData(): ReqAuxData {
    return this.data;
  }
}
