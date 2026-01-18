<template>
  <Layout>
    <template #breadcrumb>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/apps' }">Applications</el-breadcrumb-item>
        <el-breadcrumb-item>{{ appStore.currentApp?.name || 'Detail' }}</el-breadcrumb-item>
      </el-breadcrumb>
    </template>

    <div v-if="appStore.currentApp" v-loading="appStore.loading">
      <div class="page-header">
        <h2>{{ appStore.currentApp.name }}</h2>
        <el-button type="primary" @click="router.push(`/apps/${appId}/versions/create`)">
          <el-icon><Plus /></el-icon>
          Create Version
        </el-button>
      </div>

      <el-card class="info-card">
        <template #header>
          <span>Application Info</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Name">{{ appStore.currentApp.name }}</el-descriptions-item>
          <el-descriptions-item label="App Key">
            <el-tag>{{ appStore.currentApp.appKey }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Platform">
            <el-tag size="small">{{ appStore.currentApp.platform }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Architecture">
            <el-tag size="small" type="info">{{ appStore.currentApp.arch }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag :type="appStore.currentApp.status === 'active' ? 'success' : 'danger'" size="small">
              {{ appStore.currentApp.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Created">
            {{ formatDate(appStore.currentApp.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="Description" :span="2">
            {{ appStore.currentApp.description || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="versions-card">
        <template #header>
          <div class="card-header">
            <span>Versions</span>
            <el-button size="small" @click="handleRefreshVersions">
              <el-icon><Refresh /></el-icon>
              Refresh
            </el-button>
          </div>
        </template>

        <el-table :data="versionStore.versions" v-loading="versionStore.loading" stripe>
          <el-table-column prop="appVersion" label="App Version" width="120">
            <template #default="{ row }">
              <router-link :to="`/apps/${appId}/versions/${row.id}`" class="version-link">
                {{ row.appVersion }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="rendererVersion" label="Renderer Version" width="140" />
          <el-table-column prop="versionCode" label="Code" width="80" />
          <el-table-column label="Installer" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.installerFile" type="success" size="small">Yes</el-tag>
              <el-tag v-else type="info" size="small">No</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Patch" width="80">
            <template #default="{ row }">
              <el-tag v-if="row.patchFile" type="success" size="small">Yes</el-tag>
              <el-tag v-else type="info" size="small">No</el-tag>
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
                @click="handleDeleteVersion(row)"
              >
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="versionStore.pagination.page"
            :total="versionStore.pagination.total"
            :page-size="versionStore.pagination.pageSize"
            layout="total, prev, pager, next"
            @current-change="handleVersionPageChange"
          />
        </div>
      </el-card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Plus, Refresh } from '@element-plus/icons-vue';
import Layout from '@/components/Layout/index.vue';
import { useAppStore } from '@/store/modules/app';
import { useVersionStore } from '@/store/modules/version';
import { formatDate } from '@/utils/format';
import type { Version } from '@/types';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const versionStore = useVersionStore();

const appId = computed(() => route.params.appId as string);

onMounted(async () => {
  await appStore.fetchAppDetail(appId.value);
  await versionStore.fetchVersions(appId.value);
});

function handleRefreshVersions() {
  versionStore.fetchVersions(appId.value);
}

function handleVersionPageChange(page: number) {
  versionStore.setPage(page);
  versionStore.fetchVersions(appId.value);
}

async function handleDeleteVersion(version: Version) {
  try {
    await ElMessageBox.confirm(
      `Are you sure to delete version "${version.appVersion}"?`,
      'Delete Version',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );

    await versionStore.deleteVersion(appId.value, version.id);
    ElMessage.success('Version deleted successfully');
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

.info-card {
  margin-bottom: 20px;
}

.versions-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-link {
  color: #409eff;
  text-decoration: none;
}

.version-link:hover {
  text-decoration: underline;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
