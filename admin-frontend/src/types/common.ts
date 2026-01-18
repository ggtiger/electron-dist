export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UploadResponse {
  fileId: string;
  originalName: string;
  size: number;
  sha256: string;
  storagePath: string;
}

export interface DownloadUrlResponse {
  url: string;
  expiresAt: string;
}
