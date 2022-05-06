export interface Application {
  title: string,
  path: string,
}

export enum ActionType {
  shutdown = 'shutdown',
  restart = 'restart',
  logout = 'logout',
  sleep = 'sleep',
  lock = 'lock',
}
