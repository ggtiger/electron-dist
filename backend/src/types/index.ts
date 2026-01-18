export interface CreateAppInput {
  name: string;
  appKey: string;
  platform: string;
  arch: string;
  description?: string;
}

export interface AppFilter {
  platform?: string;
  arch?: string;
  status?: string;
}

export interface CreateVersionInput {
  appVersion: string;
  rendererVersion: string;
  versionCode?: number;
  description?: string;
  releaseNotes?: string;
  installerFileId?: string;
  patchFileId?: string;
}

export interface CheckUpdateQuery {
  appKey: string;
  appVersion: string;
  rendererVersion: string;
  platform: string;
  arch: string;
}

export interface CheckUpdateResponse {
  updateType: 'none' | 'hot' | 'installer';
  version?: string;
  rendererVersion?: string;
  url?: string;
  sha256?: string;
  size?: number;
  notes?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export const PLATFORMS = ['win32', 'darwin', 'linux'] as const;
export const ARCHS = ['x64', 'arm64'] as const;

export type Platform = (typeof PLATFORMS)[number];
export type Arch = (typeof ARCHS)[number];
