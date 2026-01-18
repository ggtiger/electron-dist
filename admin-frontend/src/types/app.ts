export interface App {
  id: string;
  name: string;
  appKey: string;
  platform: string;
  arch: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppInput {
  name: string;
  appKey: string;
  platform: string;
  arch: string;
  description?: string;
}
