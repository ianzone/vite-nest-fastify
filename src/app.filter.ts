import { ArgumentsHost, Catch, HttpException, Injectable, Logger, Scope } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RequestService } from './services';

// https://docs.nestjs.com/exception-filters#exception-filters
@Injectable({ scope: Scope.REQUEST })
@Catch()
export class AppFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AppFilter.name);
  constructor(private readonly reqService: RequestService) {
    super();
  }
  catch(exception: Error, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<FastifyRequest>();
    const res = host.switchToHttp().getResponse<FastifyReply>();
    const { log, ...aux } = this.reqService.getAuxData();
    const ctx = {
      Method: req.method,
      Path: req.url,
      Params: req.params,
      Query: req.query,
      Headers: req.headers,
      Body: req.body,
      ReqAuxData: aux,
    };

    let statusCode = 500;
    let message = '';
    if (exception instanceof HttpException) {
      this.logger.warn(ctx, exception.stack);
      statusCode = exception.getStatus();
      message = exception.message;
    } else {
      // unexpected errors that need to trigger alerts
      this.logger.error(ctx, exception.stack);
      message = exception.message;
    }

    res.status(statusCode).send({ ...log, message });
  }
}
