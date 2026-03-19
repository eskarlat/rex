export interface UpdateInfo {
  name: string;
  installedVersion: string;
  availableVersion: string;
  engineCompatible: boolean;
  engineIssues: string[];
  registryName: string;
}

export interface UpdateCache {
  checkedAt: string;
  updates: UpdateInfo[];
}
