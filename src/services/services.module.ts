import { Global, Module } from '@nestjs/common';
import { MyDBService } from './databases';
import { RequestService } from './request';
import { TenantsService } from './tenants';

@Global()
@Module({
  providers: [MyDBService, TenantsService, RequestService],
  exports: [TenantsService, RequestService],
})
export class ServicesModule {}
