import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Configs, Mode } from 'src/configs';
import { RequestService } from 'src/services';
import { Group, GROUPS_KEY } from './groups.decorator';

@Injectable()
export class GroupsGuard implements CanActivate {
  private readonly logger = new Logger(GroupsGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly reqSvc: RequestService,
    private readonly configs: ConfigService<Configs>
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.configs.get('mode') === Mode.local) return true;

    const groupsSetInController = this.reflector.get<Group[]>(GROUPS_KEY, context.getHandler());
    this.logger.verbose({ groupsSetInController });

    if (groupsSetInController?.length) {
      const req = this.reqSvc.getAuxData();
      const user = req.user;
      const tenant = req.tenant;
      console.log(user);
      this.logger.verbose({ user, tenant });
      const groups = user.groups;
      if (groups.size) {
        for (const group of groupsSetInController) {
          if (groups.has(group)) return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }
}
