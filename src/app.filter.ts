import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter, ContextIdFactory, ModuleRef } from '@nestjs/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';
import { RequestService } from './services';

// https://docs.nestjs.com/exception-filters#exception-filters
@Catch()
export class AppFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AppFilter.name);
  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }
  async catch(exception: Error, host: ArgumentsHost) {
    const obj = host.switchToHttp();
    const req = obj.getRequest<FastifyRequest>();
    const res = obj.getResponse<FastifyReply | ServerResponse>();
    const contextId = ContextIdFactory.getByRequest(req);
    const reqService = await this.moduleRef.resolve(RequestService, contextId, {
      strict: false,
    });
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
    if (res instanceof ServerResponse) {
      // in case of thrown from middlewares
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({ ...reqService.getLogTrace(), message }));
      res.end();
    } else {
      res.status(statusCode).send({ ...reqService.getLogTrace(), message });
    }
  }
}
