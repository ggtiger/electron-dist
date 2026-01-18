import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { appApi, type AppListParams } from '@/api/modules/app';
import type { App, CreateAppInput, PaginatedData } from '@/types';

export const useAppStore = defineStore('app', () => {
  const apps = ref<App[]>([]);
  const currentApp = ref<App | null>(null);
  const loading = ref(false);
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const filters = reactive<{ platform?: string; arch?: string }>({});

  async function fetchApps(params?: AppListParams) {
    loading.value = true;
    try {
      const result: PaginatedData<App> = await appApi.getList({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...params,
      });
      apps.value = result.items;
      pagination.total = result.total;
      pagination.totalPages = result.totalPages;
      pagination.page = result.page;
      pagination.pageSize = result.pageSize;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAppDetail(appId: string) {
    loading.value = true;
    try {
      currentApp.value = await appApi.getDetail(appId);
    } finally {
      loading.value = false;
    }
  }

  async function createApp(data: CreateAppInput) {
    const app = await appApi.create(data);
    return app;
  }

  async function deleteApp(appId: string) {
    await appApi.delete(appId);
    await fetchApps();
  }

  function setFilters(newFilters: { platform?: string; arch?: string }) {
    filters.platform = newFilters.platform;
    filters.arch = newFilters.arch;
    pagination.page = 1;
  }

  function setPage(page: number) {
    pagination.page = page;
  }

  function setPageSize(pageSize: number) {
    pagination.pageSize = pageSize;
    pagination.page = 1;
  }

  return {
    apps,
    currentApp,
    loading,
    pagination,
    filters,
    fetchApps,
    fetchAppDetail,
    createApp,
    deleteApp,
    setFilters,
    setPage,
    setPageSize,
  };
});
