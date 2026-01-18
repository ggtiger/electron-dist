<template>
  <Layout>
    <template #breadcrumb>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/apps' }">Applications</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/apps/${appId}` }">
          {{ appStore.currentApp?.name || 'App' }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>Create Version</el-breadcrumb-item>
      </el-breadcrumb>
    </template>

    <div class="page-header">
      <h2>Create Version</h2>
    </div>

    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="App Version" prop="appVersion">
          <el-input v-model="form.appVersion" placeholder="1.0.0" />
          <div class="form-tip">Semantic version format (e.g., 1.0.0)</div>
        </el-form-item>

        <el-form-item label="Renderer Version" prop="rendererVersion">
          <el-input v-model="form.rendererVersion" placeholder="1.0.0" />
          <div class="form-tip">Hot update version number</div>
        </el-form-item>

        <el-form-item label="Version Code" prop="versionCode">
          <el-input-number v-model="form.versionCode" :min="1" />
          <div class="form-tip">Auto-incremented if not specified</div>
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="Optional description"
          />
        </el-form-item>

        <el-form-item label="Release Notes" prop="releaseNotes">
          <el-input
            v-model="form.releaseNotes"
            type="textarea"
            :rows="4"
            placeholder="What's new in this version..."
          />
        </el-form-item>

        <el-divider>File Uploads</el-divider>

        <el-form-item label="Installer">
          <FileUploader
            ref="installerUploaderRef"
            type="installer"
            @success="handleInstallerSuccess"
          />
        </el-form-item>

        <el-form-item label="Patch (Hot Update)">
          <FileUploader
            ref="patchUploaderRef"
            type="patch"
            @success="handlePatchSuccess"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            Create Version
          </el-button>
          <el-button @click="router.back()">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import Layout from '@/components/Layout/index.vue';
import FileUploader from '@/components/FileUploader/index.vue';
import { useAppStore } from '@/store/modules/app';
import { useVersionStore } from '@/store/modules/version';
import type { UploadResponse } from '@/types';

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const versionStore = useVersionStore();

const appId = computed(() => route.params.appId as string);

const formRef = ref<FormInstance>();
const installerUploaderRef = ref<InstanceType<typeof FileUploader>>();
const patchUploaderRef = ref<InstanceType<typeof FileUploader>>();
const submitting = ref(false);

const form = reactive({
  appVersion: '',
  rendererVersion: '',
  versionCode: undefined as number | undefined,
  description: '',
  releaseNotes: '',
  installerFileId: '',
  patchFileId: '',
});

const rules: FormRules = {
  appVersion: [
    { required: true, message: 'Please enter app version', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+/, message: 'Invalid version format', trigger: 'blur' },
  ],
  rendererVersion: [
    { required: true, message: 'Please enter renderer version', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+/, message: 'Invalid version format', trigger: 'blur' },
  ],
};

onMounted(async () => {
  if (!appStore.currentApp || appStore.currentApp.id !== appId.value) {
    await appStore.fetchAppDetail(appId.value);
  }
});

function handleInstallerSuccess(response: UploadResponse) {
  form.installerFileId = response.fileId;
}

function handlePatchSuccess(response: UploadResponse) {
  form.patchFileId = response.fileId;
}

async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    // Upload files first if selected but not uploaded
    if (installerUploaderRef.value?.hasFile && !form.installerFileId) {
      const result = await installerUploaderRef.value.startUpload();
      if (result) {
        form.installerFileId = result.fileId;
      }
    }

    if (patchUploaderRef.value?.hasFile && !form.patchFileId) {
      const result = await patchUploaderRef.value.startUpload();
      if (result) {
        form.patchFileId = result.fileId;
      }
    }

    // Create version
    await versionStore.createVersion(appId.value, {
      appVersion: form.appVersion,
      rendererVersion: form.rendererVersion,
      versionCode: form.versionCode,
      description: form.description || undefined,
      releaseNotes: form.releaseNotes || undefined,
      installerFileId: form.installerFileId || undefined,
      patchFileId: form.patchFileId || undefined,
    });

    ElMessage.success('Version created successfully');
    router.push(`/apps/${appId.value}`);
  } catch (error) {
    if (error !== false) {
      // Handle error
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.form-card {
  max-width: 700px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}
</style>
