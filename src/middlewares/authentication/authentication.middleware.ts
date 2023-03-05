import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { IncomingMessage } from 'http';
import { Configs, Mode } from 'src/configs';
import { RequestService, TenantsService } from 'src/services';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthenticationMiddleware.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
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

      const auxDataCache = (await this.cache.get(jwt)) as any;
      if (auxDataCache) {
        this.reqSvc.setAuxData(auxDataCache);
        return next();
      }

      this.logger.verbose('decode jwt and get tenantId from it');
      this.logger.verbose('get tenant credentials from the tenant service');
      await this.tenants.ormMethods('tenantId');
      this.logger.verbose('verify the jwt against tenant credentials');

      const auxData = {
        user: {
          token: jwt,
          userPoolId: 'string',
          clientId: 'string',
          userId: 'userId',
          groups: new Set(['admin']),
        },
        tenant: {
          thirdPartyKey: 'thirdPartyKey',
        },
      };

      this.cache.set(jwt, auxData);
      this.reqSvc.setAuxData(auxData);
      return next();
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }
}
