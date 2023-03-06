import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter, ContextIdFactory, ModuleRef } from '@nestjs/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RequestService } from './services';

// https://docs.nestjs.com/exception-filters#exception-filters
@Catch()
export class AppFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AppFilter.name);
  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }
  async catch(exception: Error, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<FastifyRequest>();
    const res = host.switchToHttp().getResponse<FastifyReply>();
    const contextId = ContextIdFactory.getByRequest(req);
    const reqService = await this.moduleRef.resolve(RequestService, contextId);
    const ctx = {
      Method: req.method,
      Path: req.url,
      Params: req.params,
      Query: req.query,
      Headers: req.headers,
      Body: req.body,
      ReqAuxData: reqService.getAuxData(),
    };

    let statusCode = 500;
    let message = '';
    if (exception instanceof HttpException) {
      this.logger.warn(ctx, exception.stack);
      statusCode = exception.getStatus();
      // @ts-ignore
      message = exception.getResponse()?.message;
    } else {
      // unexpected errors that need to trigger alerts
      this.logger.error(ctx, exception.stack);
      message = exception.message;
    }

    res.status(statusCode).send({ ...reqService.getLogTrace(), message });
  }
}
