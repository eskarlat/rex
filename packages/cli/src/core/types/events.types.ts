export type EventType = 'project:init' | 'project:destroy' | 'ext:activate' | 'ext:deactivate';

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
