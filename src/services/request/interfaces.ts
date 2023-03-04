interface User {
  token: string;
  userPoolId: string;
  clientId: string;
  userId: string;
  groups: Set<string>;
}

interface Tenant {
  thirdPartyKey: string;
}

interface Log {
  groupId: string;
  streamId: string;
  requestId: string;
}

export interface ReqAuxData {
  user: User;
  tenant: Tenant;
  log: Log;
}
