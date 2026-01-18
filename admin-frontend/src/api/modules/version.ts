import http from '../http';
import type { Version, CreateVersionInput, ApiResponse, PaginatedData } from '@/types';

export interface VersionListParams {
  page?: number;
  pageSize?: number;
}

export const versionApi = {
  // Get version list for an app
  async getList(appId: string, params: VersionListParams = {}): Promise<PaginatedData<Version>> {
    const response = await http.get<ApiResponse<PaginatedData<Version>>>(
      `/apps/${appId}/versions`,
      { params }
    );
    return response.data.data!;
  },

  // Get version detail
  async getDetail(appId: string, versionId: string): Promise<Version> {
    const response = await http.get<ApiResponse<Version>>(
      `/apps/${appId}/versions/${versionId}`
    );
    return response.data.data!;
  },

  // Create version
  async create(appId: string, data: CreateVersionInput): Promise<Version> {
    const response = await http.post<ApiResponse<Version>>(
      `/apps/${appId}/versions`,
      data
    );
    return response.data.data!;
  },

  // Delete version
  async delete(appId: string, versionId: string): Promise<void> {
    await http.delete(`/apps/${appId}/versions/${versionId}`);
  },
};
