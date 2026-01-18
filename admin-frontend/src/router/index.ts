import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/apps',
  },
  {
    path: '/apps',
    name: 'AppList',
    component: () => import('@/views/App/List.vue'),
    meta: { title: 'Applications' },
  },
  {
    path: '/apps/create',
    name: 'AppCreate',
    component: () => import('@/views/App/Create.vue'),
    meta: { title: 'Create Application' },
  },
  {
    path: '/apps/:appId',
    name: 'AppDetail',
    component: () => import('@/views/App/Detail.vue'),
    meta: { title: 'Application Detail' },
  },
  {
    path: '/apps/:appId/versions/create',
    name: 'VersionCreate',
    component: () => import('@/views/Version/Create.vue'),
    meta: { title: 'Create Version' },
  },
  {
    path: '/apps/:appId/versions/:versionId',
    name: 'VersionDetail',
    component: () => import('@/views/Version/Detail.vue'),
    meta: { title: 'Version Detail' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'App'} - Distribution Platform`;
  next();
});

export default router;
