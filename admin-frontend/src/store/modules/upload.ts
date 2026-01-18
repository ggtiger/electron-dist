import { defineStore } from 'pinia';
import { ref } from 'vue';
import { uploadApi } from '@/api/modules/upload';
import type { UploadResponse } from '@/types';

export interface UploadTask {
  id: string;
  file: File;
  type: 'installer' | 'patch';
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  response?: UploadResponse;
  error?: string;
}

export const useUploadStore = defineStore('upload', () => {
  const tasks = ref<UploadTask[]>([]);

  function addTask(file: File, type: 'installer' | 'patch'): string {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    tasks.value.push({
      id,
      file,
      type,
      progress: 0,
      status: 'pending',
    });
    return id;
  }

  async function startUpload(taskId: string): Promise<UploadResponse | null> {
    const task = tasks.value.find((t) => t.id === taskId);
    if (!task) return null;

    task.status = 'uploading';
    task.progress = 0;

    try {
      const uploadFn = task.type === 'installer' ? uploadApi.uploadInstaller : uploadApi.uploadPatch;
      const response = await uploadFn(task.file, (progress) => {
        task.progress = progress;
      });

      task.status = 'success';
      task.response = response;
      return response;
    } catch (error) {
      task.status = 'error';
      task.error = error instanceof Error ? error.message : 'Upload failed';
      return null;
    }
  }

  function removeTask(taskId: string) {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks.value.splice(index, 1);
    }
  }

  function clearCompleted() {
    tasks.value = tasks.value.filter((t) => t.status !== 'success');
  }

  function reset() {
    tasks.value = [];
  }

  return {
    tasks,
    addTask,
    startUpload,
    removeTask,
    clearCompleted,
    reset,
  };
});
