import { Injectable, Scope } from '@nestjs/common';
import { Log, ReqAuxData } from './interfaces';

@Injectable({ scope: Scope.REQUEST })
export class RequestService {
  private data: ReqAuxData;
  private log: Log;

  setLogTrace(log: Log) {
    this.log = log;
  }
  getLogTrace() {
    return this.log;
  }
  setAuxData(data: ReqAuxData) {
    this.data = data;
  }
  getAuxData(): ReqAuxData {
    return this.data;
  }
}
