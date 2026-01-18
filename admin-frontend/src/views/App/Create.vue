<template>
  <Layout>
    <template #breadcrumb>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/apps' }">Applications</el-breadcrumb-item>
        <el-breadcrumb-item>Create</el-breadcrumb-item>
      </el-breadcrumb>
    </template>

    <div class="page-header">
      <h2>Create Application</h2>
    </div>

    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="My Electron App" />
        </el-form-item>

        <el-form-item label="App Key" prop="appKey">
          <el-input v-model="form.appKey" placeholder="my_electron_app" />
          <div class="form-tip">Unique identifier for the app (lowercase, underscore allowed)</div>
        </el-form-item>

        <el-form-item label="Platform" prop="platform">
          <el-select v-model="form.platform" placeholder="Select platform">
            <el-option
              v-for="p in PLATFORMS"
              :key="p.value"
              :label="p.label"
              :value="p.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Architecture" prop="arch">
          <el-select v-model="form.arch" placeholder="Select architecture">
            <el-option
              v-for="a in ARCHS"
              :key="a.value"
              :label="a.label"
              :value="a.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Optional description"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            Create
          </el-button>
          <el-button @click="router.back()">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import Layout from '@/components/Layout/index.vue';
import { useAppStore } from '@/store/modules/app';
import { PLATFORMS, ARCHS } from '@/utils/constants';

const router = useRouter();
const appStore = useAppStore();

const formRef = ref<FormInstance>();
const submitting = ref(false);

const form = reactive({
  name: '',
  appKey: '',
  platform: '',
  arch: '',
  description: '',
});

const rules: FormRules = {
  name: [
    { required: true, message: 'Please enter app name', trigger: 'blur' },
    { min: 2, max: 100, message: 'Length should be 2 to 100', trigger: 'blur' },
  ],
  appKey: [
    { required: true, message: 'Please enter app key', trigger: 'blur' },
    { pattern: /^[a-z0-9_]+$/, message: 'Only lowercase letters, numbers and underscore', trigger: 'blur' },
  ],
  platform: [
    { required: true, message: 'Please select platform', trigger: 'change' },
  ],
  arch: [
    { required: true, message: 'Please select architecture', trigger: 'change' },
  ],
};

async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    const app = await appStore.createApp({
      name: form.name,
      appKey: form.appKey,
      platform: form.platform,
      arch: form.arch,
      description: form.description || undefined,
    });

    ElMessage.success('Application created successfully');
    router.push(`/apps/${app.id}`);
  } catch (error) {
    if (error !== false) {
      // Form validation failed
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
  max-width: 600px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}
</style>
