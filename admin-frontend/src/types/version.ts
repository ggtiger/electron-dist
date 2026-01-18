export interface FileInfo {
  id: string;
  sha256: string | null;
  size: string | null;
  originalName: string | null;
}

export interface Version {
  id: string;
  appId: string;
  appVersion: string;
  rendererVersion: string;
  versionCode: string;
  description: string | null;
  releaseNotes: string | null;
  installerFileId: string | null;
  patchFileId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  installerFile: FileInfo | null;
  patchFile: FileInfo | null;
  app?: {
    id: string;
    name: string;
    appKey: string;
  };
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
