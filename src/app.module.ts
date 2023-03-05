import {
  CacheInterceptor,
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthenticationMiddleware } from 'src/middlewares';
import { RoutesModule } from 'src/routes';
import { ServicesModule } from 'src/services';
import { AppController } from './app.controller';
import { AppFilter } from './app.filter';
import { AppService } from './app.service';
import configs from './configs';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 29, // seconds, max apigateway timeout
      max: 1000, // max items in cache
    }),
    ServicesModule,
    RoutesModule,
    ConfigModule.forRoot({
      load: [configs],
      isGlobal: true,
      cache: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AppFilter,
    },
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).exclude('/').forRoutes('*');
  }
}
