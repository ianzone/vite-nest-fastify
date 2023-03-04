import { Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IncomingMessage } from 'http';
import { Configs, Mode } from 'src/configs';
import { RequestService, TenantsService } from 'src/services';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthenticationMiddleware.name);

  constructor(
    private readonly reqSvc: RequestService,
    private readonly tenants: TenantsService,
    private readonly configs: ConfigService<Configs>
  ) {}

  // in fastify middleware, the req object is the raw node request object
  async use(req: IncomingMessage, res: any, next: () => void) {
    this.reqSvc.setLogTrace({
      groupId: 'groupId',
      streamId: 'streamId',
      requestId: 'requestId',
    });

    if (this.configs.get('mode') === Mode.local) return next();

    try {
      const authorization = req.headers.authorization;
      const jwt = authorization?.split('Bearer ')[1];
      if (!jwt) throw new Error('missing authorization');
      this.logger.verbose('decode jwt and get tenantId from it');
      this.logger.verbose('get tenant credentials from the tenant service');
      await this.tenants.ormMethods('tenantId');
      this.logger.verbose('verify the jwt against tenant credentials');

      this.reqSvc.setAuxData({
        user: {
          token: jwt,
          userPoolId: 'string',
          clientId: 'string',
          userId: 'string',
          groups: new Set(['admin']),
        },
        tenant: {
          thirdPartyKey: 'thirdPartyKey',
        },
      });
      return next();
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }
}
