<template>
  <Layout>
    <template #breadcrumb>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/apps' }">Applications</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/apps/${appId}` }">
          {{ versionStore.currentVersion?.app?.name || 'App' }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>Version {{ versionStore.currentVersion?.appVersion }}</el-breadcrumb-item>
      </el-breadcrumb>
    </template>

    <div v-if="versionStore.currentVersion" v-loading="versionStore.loading">
      <div class="page-header">
        <h2>Version {{ versionStore.currentVersion.appVersion }}</h2>
      </div>

      <el-card class="info-card">
        <template #header>
          <span>Version Info</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="App Version">
            <el-tag>{{ versionStore.currentVersion.appVersion }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Renderer Version">
            <el-tag type="info">{{ versionStore.currentVersion.rendererVersion }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Version Code">
            {{ versionStore.currentVersion.versionCode }}
          </el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag :type="versionStore.currentVersion.isActive ? 'success' : 'danger'" size="small">
              {{ versionStore.currentVersion.isActive ? 'Active' : 'Inactive' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Created">
            {{ formatDate(versionStore.currentVersion.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="Updated">
            {{ formatDate(versionStore.currentVersion.updatedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="Description" :span="2">
            {{ versionStore.currentVersion.description || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="Release Notes" :span="2">
            <pre class="release-notes">{{ versionStore.currentVersion.releaseNotes || '-' }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="file-card">
            <template #header>
              <span>Installer File</span>
            </template>
            <div v-if="versionStore.currentVersion.installerFile" class="file-info">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="File Name">
                  {{ versionStore.currentVersion.installerFile.originalName }}
                </el-descriptions-item>
                <el-descriptions-item label="Size">
                  {{ formatFileSize(versionStore.currentVersion.installerFile.size) }}
                </el-descriptions-item>
                <el-descriptions-item label="SHA256">
                  <el-tooltip :content="versionStore.currentVersion.installerFile.sha256 || ''" placement="top">
                    <code class="sha256">
                      {{ truncateString(versionStore.currentVersion.installerFile.sha256 || '', 20) }}
                    </code>
                  </el-tooltip>
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click="copyToClipboard(versionStore.currentVersion.installerFile.sha256 || '')"
                  >
                    Copy
                  </el-button>
                </el-descriptions-item>
              </el-descriptions>
              <el-button
                type="primary"
                class="download-btn"
                @click="handleDownload(versionStore.currentVersion.installerFileId!)"
              >
                <el-icon><Download /></el-icon>
                Download
              </el-button>
            </div>
            <el-empty v-else description="No installer uploaded" />
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="file-card">
            <template #header>
              <span>Patch File (Hot Update)</span>
            </template>
            <div v-if="versionStore.currentVersion.patchFile" class="file-info">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="File Name">
                  {{ versionStore.currentVersion.patchFile.originalName }}
                </el-descriptions-item>
                <el-descriptions-item label="Size">
                  {{ formatFileSize(versionStore.currentVersion.patchFile.size) }}
                </el-descriptions-item>
                <el-descriptions-item label="SHA256">
                  <el-tooltip :content="versionStore.currentVersion.patchFile.sha256 || ''" placement="top">
                    <code class="sha256">
                      {{ truncateString(versionStore.currentVersion.patchFile.sha256 || '', 20) }}
                    </code>
                  </el-tooltip>
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click="copyToClipboard(versionStore.currentVersion.patchFile.sha256 || '')"
                  >
                    Copy
                  </el-button>
                </el-descriptions-item>
              </el-descriptions>
              <el-button
                type="primary"
                class="download-btn"
                @click="handleDownload(versionStore.currentVersion.patchFileId!)"
              >
                <el-icon><Download /></el-icon>
                Download
              </el-button>
            </div>
            <el-empty v-else description="No patch uploaded" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';
import Layout from '@/components/Layout/index.vue';
import { useVersionStore } from '@/store/modules/version';
import { uploadApi } from '@/api';
import { formatDate, formatFileSize, truncateString } from '@/utils/format';

const route = useRoute();
const versionStore = useVersionStore();

const appId = computed(() => route.params.appId as string);
const versionId = computed(() => route.params.versionId as string);

onMounted(async () => {
  await versionStore.fetchVersionDetail(appId.value, versionId.value);
});

async function handleDownload(fileId: string) {
  try {
    const result = await uploadApi.getDownloadUrl(fileId);
    window.open(result.url, '_blank');
  } catch {
    ElMessage.error('Failed to get download URL');
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('Copied to clipboard');
  }).catch(() => {
    ElMessage.error('Failed to copy');
  });
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.info-card {
  margin-bottom: 20px;
}

.file-card {
  margin-bottom: 20px;
}

.file-info {
  padding: 10px 0;
}

.sha256 {
  font-family: monospace;
  font-size: 12px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.download-btn {
  margin-top: 16px;
  width: 100%;
}

.release-notes {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
}
</style>
