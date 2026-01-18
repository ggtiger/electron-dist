import http from '../http';
import type { App, CreateAppInput, ApiResponse, PaginatedData } from '@/types';

export interface AppListParams {
  platform?: string;
  arch?: string;
  page?: number;
  pageSize?: number;
}

export const appApi = {
  // Get app list
  async getList(params: AppListParams = {}): Promise<PaginatedData<App>> {
    const response = await http.get<ApiResponse<PaginatedData<App>>>('/apps', { params });
    return response.data.data!;
  },

  // Get app detail
  async getDetail(appId: string): Promise<App> {
    const response = await http.get<ApiResponse<App>>(`/apps/${appId}`);
    return response.data.data!;
  },

  // Create app
  async create(data: CreateAppInput): Promise<App> {
    const response = await http.post<ApiResponse<App>>('/apps', data);
    return response.data.data!;
  },

  // Delete app
  async delete(appId: string): Promise<void> {
    await http.delete(`/apps/${appId}`);
  },
};
