import http from '../http';
import type { ApiResponse, UploadResponse, DownloadUrlResponse } from '@/types';

export type FileType = 'installer' | 'patch';

export const uploadApi = {
  // Upload installer file
  async uploadInstaller(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.post<ApiResponse<UploadResponse>>(
      '/uploads/installer',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    return response.data.data!;
  },

  // Upload patch file
  async uploadPatch(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.post<ApiResponse<UploadResponse>>(
      '/uploads/patch',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );
    return response.data.data!;
  },

  // Get download URL
  async getDownloadUrl(fileId: string): Promise<DownloadUrlResponse> {
    const response = await http.get<ApiResponse<DownloadUrlResponse>>(
      `/files/${fileId}/download-url`
    );
    return response.data.data!;
  },
};
