import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';

@Injectable()
export class UserIpInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UserIpInterceptor.name);
  constructor(
    // Inject the ClsService into the interceptor to get
    // access to the current shared cls context.
    private readonly cls: ClsService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Extract the client's ip address from the request...
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const userIp = request.socket.remoteAddress;
    // ...and store it to the cls context.
    this.cls.set('ip', userIp);
    this.logger.verbose(userIp);
    return next.handle();
  }
}
