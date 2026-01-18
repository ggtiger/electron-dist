<template>
  <div class="file-uploader">
    <el-upload
      ref="uploadRef"
      drag
      :auto-upload="false"
      :show-file-list="false"
      :accept="acceptExtensions"
      :on-change="handleFileChange"
      :disabled="disabled || uploading"
    >
      <div v-if="!selectedFile" class="upload-placeholder">
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <div class="upload-text">
          Drop file here or <em>click to upload</em>
        </div>
        <div class="upload-tip">{{ tip }}</div>
      </div>
      <div v-else class="selected-file">
        <div class="file-info">
          <el-icon><Document /></el-icon>
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
        </div>
        <el-progress
          v-if="uploading"
          :percentage="progress"
          :status="progressStatus"
        />
        <div v-if="uploadResult" class="upload-result">
          <el-tag type="success">Uploaded</el-tag>
          <span class="sha256">SHA256: {{ truncateString(uploadResult.sha256, 16) }}</span>
        </div>
        <el-button
          v-if="!uploading && !uploadResult"
          type="danger"
          size="small"
          @click.stop="clearFile"
        >
          Remove
        </el-button>
      </div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { UploadFilled, Document } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus';
import { uploadApi } from '@/api';
import type { UploadResponse } from '@/types';
import { formatFileSize, truncateString } from '@/utils/format';

const props = defineProps<{
  type: 'installer' | 'patch';
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'success', response: UploadResponse): void;
  (e: 'error', error: string): void;
}>();

const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const progress = ref(0);
const uploadResult = ref<UploadResponse | null>(null);

const acceptExtensions = computed(() => {
  if (props.type === 'installer') {
    return '.exe,.dmg,.msi,.pkg,.deb,.rpm,.AppImage';
  }
  return '.zip,.asar';
});

const tip = computed(() => {
  if (props.type === 'installer') {
    return 'Supports .exe, .dmg, .msi, .pkg, .deb, .rpm, .AppImage (max 2GB)';
  }
  return 'Supports .zip, .asar (max 500MB)';
});

const progressStatus = computed(() => {
  if (progress.value === 100) return 'success';
  return undefined;
});

function handleFileChange(uploadFile: UploadFile) {
  if (uploadFile.raw) {
    selectedFile.value = uploadFile.raw;
  }
}

function clearFile() {
  selectedFile.value = null;
  uploadResult.value = null;
  progress.value = 0;
}

async function startUpload(): Promise<UploadResponse | null> {
  if (!selectedFile.value) return null;

  uploading.value = true;
  progress.value = 0;

  try {
    const uploadFn = props.type === 'installer' 
      ? uploadApi.uploadInstaller 
      : uploadApi.uploadPatch;
    
    const result = await uploadFn(selectedFile.value, (p) => {
      progress.value = p;
    });

    uploadResult.value = result;
    emit('success', result);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    emit('error', message);
    return null;
  } finally {
    uploading.value = false;
  }
}

function reset() {
  selectedFile.value = null;
  uploadResult.value = null;
  progress.value = 0;
  uploading.value = false;
}

defineExpose({
  startUpload,
  reset,
  hasFile: computed(() => !!selectedFile.value),
  uploadResult,
});
</script>

<style scoped>
.file-uploader {
  width: 100%;
}

.upload-placeholder {
  padding: 40px 20px;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.upload-text {
  color: #606266;
  margin-bottom: 8px;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
}

.selected-file {
  padding: 20px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.file-name {
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.upload-result {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.sha256 {
  color: #909399;
  font-size: 12px;
  font-family: monospace;
}
</style>
