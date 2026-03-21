// eslint-disable-next-line sonarjs/redundant-type-aliases -- kept as semantic alias for type safety across event bus consumers
export type EventType = string;

export interface ProjectInitPayload {
  type: 'project:init';
  projectName: string;
  projectPath: string;
}

export interface ProjectDestroyPayload {
  type: 'project:destroy';
  projectPath: string;
}

export interface ExtActivatePayload {
  type: 'ext:activate';
  extensionName: string;
  version: string;
  projectPath: string;
}

export interface ExtDeactivatePayload {
  type: 'ext:deactivate';
  extensionName: string;
  projectPath: string;
}

export type EventPayload =
  | ProjectInitPayload
  | ProjectDestroyPayload
  | ExtActivatePayload
  | ExtDeactivatePayload;
