# 架构设计文档片段（前后端分离，前端为 Vue 3 + Vite，后端为 Next.js/Express）

1) 技术栈要点
- 前端：Vue 3 + Vite，Composition API，Pinia 作为状态管理，Axios 进行 API 调用
- 后端：Next.js 13（App 路由）+ Express 中间件，或纯 Next.js API 路由，搭配 PostgreSQL/MySQL，使用 Prisma 作为 ORM（若使用 MySQL 可考虑 TypeORM）
- 存储：MySQL 8.x，对象存储（S3 兼容）
- 认证：JWT + RBAC，API 层按角色授权
- 日志与监控：Winston/Bench/Prometheus（可选）

2) 目录结构建议

后端 (Next.js + Express)
- src/
  - pages/ (若使用 App Router，可用 app/ 替代)
  - server/ (自定义 Express 应用中间件)
  - modules/
    - apps/            # 应用管理相关
    - versions/        # 版本管理相关
    - uploads/         # 文件上传相关
    - check/           # 版本检查相关
    - storage/         # 存储/下载 URL 相关
    - metadata/        # 元数据生成功能
  - models/            # 数据模型（ORM 实体）
  - prisma/ (若使用 Prisma) / ormconfig.js
  - lib/               # 通用工具
  - middleware/        # 认证、鉴权中间件
  - config/            # 配置、环境变量

前端 (Vue 3)
- src/
  - api/               # 封装 API 调用
  - views/             # 页面组件
  - components/        # 公共组件
  - store/             # Pinia 状态管理
  - router/            # 路由
  - App.vue / main.js    

3) 数据模型（MySQL，关系型数据库）
- apps(id, name, app_key, platform, arch, description, status, created_at, updated_at, deleted_at)
- versions(id, app_id, app_version, renderer_version, version_code, description, release_notes, installer_file_id, patch_file_id, created_at, updated_at, is_active)
- files(id, type, original_name, size, sha256, storage_path, version_id, created_at, updated_at)

4) 关键 API 设计要点
- 认证与权限：JWT Token + RBAC，所有敏感接口需认证
- /apps: 创建、查询、删除
- /apps/{appId}/versions: 创建版本、查询版本
- /uploads/installer: 上传全量包
- /uploads/patch: 上传增量包
- /check: 版本检查
- /files/{fileId}/download-url: 获取下载 URL

5) 部署与运维
- 本地开发：Docker-compose 组合 MySQL + Redis + Node 应用
- 生产：Docker 镜像、CI/CD 自动化测试、分布式日志与监控
