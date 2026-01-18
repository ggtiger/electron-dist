<template>
  <Layout>
    <template #breadcrumb>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>Applications</el-breadcrumb-item>
      </el-breadcrumb>
    </template>

    <div class="page-header">
      <h2>Applications</h2>
      <el-button type="primary" @click="router.push('/apps/create')">
        <el-icon><Plus /></el-icon>
        Create App
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form inline>
        <el-form-item label="Platform">
          <el-select
            v-model="filters.platform"
            placeholder="All"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="p in PLATFORMS"
              :key="p.value"
              :label="p.label"
              :value="p.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Arch">
          <el-select
            v-model="filters.arch"
            placeholder="All"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="a in ARCHS"
              :key="a.value"
              :label="a.label"
              :value="a.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            Refresh
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="appStore.apps" v-loading="appStore.loading" stripe>
        <el-table-column prop="name" label="Name" min-width="150">
          <template #default="{ row }">
            <router-link :to="`/apps/${row.id}`" class="app-link">
              {{ row.name }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="appKey" label="App Key" min-width="120" />
        <el-table-column prop="platform" label="Platform" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.platform }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="arch" label="Arch" width="80">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.arch }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="appStore.pagination.page"
          v-model:page-size="appStore.pagination.pageSize"
          :total="appStore.pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Plus, Refresh } from '@element-plus/icons-vue';
import Layout from '@/components/Layout/index.vue';
import { useAppStore } from '@/store/modules/app';
import { formatDate } from '@/utils/format';
import { PLATFORMS, ARCHS } from '@/utils/constants';
import type { App } from '@/types';

const router = useRouter();
const appStore = useAppStore();

const filters = reactive({
  platform: '',
  arch: '',
});

onMounted(() => {
  appStore.fetchApps();
});

function handleFilterChange() {
  appStore.setFilters({
    platform: filters.platform || undefined,
    arch: filters.arch || undefined,
  });
  appStore.fetchApps();
}

function handleRefresh() {
  appStore.fetchApps();
}

function handlePageChange(page: number) {
  appStore.setPage(page);
  appStore.fetchApps();
}

function handleSizeChange(size: number) {
  appStore.setPageSize(size);
  appStore.fetchApps();
}

async function handleDelete(app: App) {
  try {
    await ElMessageBox.confirm(
      `Are you sure to delete "${app.name}"? This action cannot be undone.`,
      'Delete Application',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );

    await appStore.deleteApp(app.id);
    ElMessage.success('Application deleted successfully');
  } catch {
    // User cancelled
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.app-link {
  color: #409eff;
  text-decoration: none;
}

.app-link:hover {
  text-decoration: underline;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
