import {
  CacheInterceptor,
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { AuthenticationMiddleware } from 'src/middlewares';
import { RoutesModule } from 'src/routes';
import { ServicesModule } from 'src/services';
import { AppController } from './app.controller';
import { AppFilter } from './app.filter';
import { AppService } from './app.service';
import configs from './configs';

@Module({
  imports: [
    // Register the ClsModule, the ClsMiddleware is mounted in createApp.ts
    ClsModule.forRoot({
      global: true,
    }), // LINK src/createApp.ts#mount-ClsMiddleware
    CacheModule.register({
      isGlobal: true,
      ttl: 30000, // milliseconds, max apigateway timeout
      max: 10000, // max items in cache
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
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: UserIpInterceptor,
    // },
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
    consumer.apply(AuthenticationMiddleware).exclude('/').forRoutes('(.*)');
  }
}
