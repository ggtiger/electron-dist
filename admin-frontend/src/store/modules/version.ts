import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { versionApi } from '@/api/modules/version';
import type { Version, CreateVersionInput, PaginatedData } from '@/types';

export const useVersionStore = defineStore('version', () => {
  const versions = ref<Version[]>([]);
  const currentVersion = ref<Version | null>(null);
  const loading = ref(false);
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  async function fetchVersions(appId: string, page?: number) {
    loading.value = true;
    try {
      const result: PaginatedData<Version> = await versionApi.getList(appId, {
        page: page || pagination.page,
        pageSize: pagination.pageSize,
      });
      versions.value = result.items;
      pagination.total = result.total;
      pagination.totalPages = result.totalPages;
      pagination.page = result.page;
      pagination.pageSize = result.pageSize;
    } finally {
      loading.value = false;
    }
  }

  async function fetchVersionDetail(appId: string, versionId: string) {
    loading.value = true;
    try {
      currentVersion.value = await versionApi.getDetail(appId, versionId);
    } finally {
      loading.value = false;
    }
  }

  async function createVersion(appId: string, data: CreateVersionInput) {
    const version = await versionApi.create(appId, data);
    return version;
  }

  async function deleteVersion(appId: string, versionId: string) {
    await versionApi.delete(appId, versionId);
    await fetchVersions(appId);
  }

  function setPage(page: number) {
    pagination.page = page;
  }

  function reset() {
    versions.value = [];
    currentVersion.value = null;
    pagination.page = 1;
    pagination.total = 0;
    pagination.totalPages = 0;
  }

  return {
    versions,
    currentVersion,
    loading,
    pagination,
    fetchVersions,
    fetchVersionDetail,
    createVersion,
    deleteVersion,
    setPage,
    reset,
  };
});
