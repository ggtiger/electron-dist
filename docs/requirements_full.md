# 核心功能需求文档（完整版）

目标
- 定义一个轻量级的应用分发平台，聚焦对全量包、增量包的管理与分发，以及简洁的版本检查接口，支持 Electron 应用的热更新与完整安装包更新。 
- 适用范围：单应用或多应用场景，支持多平台（win32/darwin）和多架构（x64/arm64）。
- 非功能侧重：安全、可扩展、可观测、简洁的 API 设计。

1. 概述
- 受众：后端服务实现者、前端客户端集成者、运维开发者。
- 需求要点：应用元数据、版本管理、文件上传与校验、版本检查 API、分发与存储、安全与监控。

2. 目标与范围
- 目标
  - 提供清晰的应用与版本模型，便于管理全量包与增量包。
  - 提供简洁、可扩展的版本检查 API，帮助客户端快速判断是否需要更新。
  - 上传后自动计算哈希、生成元数据，方便客户端校验与集成。
  - 提供基于对象存储与 CDN 的分发能力，并支持回滚。
- 范围
  - 核心功能分为应用管理、版本管理、文件上传与处理、版本检查 API、存储与分发、安全与运维六大模块。

3. 术语表
- 应用（App）: 需要分发更新的软件实体
- AppVersion: 安装包版本号
- RendererVersion: 热更新版本号
- Installer: 全量包（安装程序）
- Patch/Zip: 增量包（热更新资源包）
- versionCode: 安装包内部递增号
- pre-signed URL: 带签名的临时下载地址
- electron-updater: 常见 Electron 更新工具的元数据格式
- SHA256: 哈希值，用于校验

4. 架构总览
- 模块化结构：应用管理、版本管理、文件上传与处理、版本检查 API、存储与分发、安全与运维。
- 数据流
  - 上传文件（installer/patch） -> 计算 SHA256 -> 记录元数据 -> 生成元数据文件（可选） -> 下载地址（预签名 URL）
  - 客户端请求 /check -> 服务端返回更新信息 -> 客户端执行更新策略
- 技术边界：存储在对象存储，下载通过 CDN/签名 URL；元数据遵循 electron-updater 兼容格式（可选）。

5. 模块详述

5.1 应用管理
- 目标：注册、查询、更新、删除应用及版本信息。
- 功能点：
  - 应用注册：记录名称、标识符、平台、架构、描述等元数据。
  - 应用查询：按平台/架构筛选、分页查询。
  - 应用更新：修改名称、描述等元数据。
  - 应用删除：软删除/硬删除。
- 数据模型要点：应用表字段 id, name, appKey, platform, arch, description, status, createdAt, updatedAt, deletedAt。

5.2 版本管理
- 目标：创建、查询、查看、删除版本，管理版本关系。
- 功能点：
  - 版本发布：设置 appVersion、rendererVersion、versionCode、描述、更新日志；关联安装包/增量包。
  - 版本查询：查看应用的所有版本，排序和筛选。
  - 版本详情：获取单版本完整信息。
  - 版本删除：删除指定版本（需校验使用状态）。
- 数据模型要点：Version 表字段 id, appId, appVersion, rendererVersion, versionCode, description, releaseNotes, installerFileId, patchFileId, createdAt, updatedAt, isActive。

5.3 文件上传与处理
- 目标：提供安全上传入口，上传后处理元数据与校验。
- 功能点：
  - 全量包上传：安装包（.exe/.dmg/.apk），记录大小、上传时间，计算 SHA256。
  - 增量包上传：.zip，计算 SHA256、校验完整性。
  - 文件哈希计算：自动计算上传文件的 SHA256。
  - 元数据生成：生成 electron-updater 兼容的元数据文件，如 latest-mac.yml。
  - 上传进度：支持进度、断点续传、取消。
- 数据模型要点：File 表字段 id, type, originalName, size, sha256, storagePath, versionId, createdAt, updatedAt。

5.4 版本检查 API
- 目标：提供简洁、可扩展的更新指令接口。
- API 设计：
  - Endpoint: GET /check
  - Query: appVersion, rendererVersion, platform, arch
  - 响应：{ updateType: none|hot|installer, version, url, sha256, notes }
- 更新策略：优先热更新，热更新不可用时回滚到安装包更新，支持强制更新。

5.5 存储与分发
- 目标：高效分发大文件，全球可用性与安全性。
- 功能点：
  - 云存储集成：对接对象存储，管理路径。
  - 预签名 URL：短期下载链接。
  - CDN 加速：配置域名，节点分发。
  - 下载统计：按版本/时间统计。
  - 文件生命周期：清理策略。

5.6 安全与运维
- 认证授权、RBAC、API 访问控制、文件完整性、日志与告警。

6. 数据模型/数据字典要点
- 应用表：id, name, appKey, platform, arch, description, status, createdAt, updatedAt, deletedAt
- Version 表：id, appId, appVersion, rendererVersion, versionCode, description, releaseNotes, installerFileId, patchFileId, createdAt, updatedAt, isActive
- File 表：id, type, originalName, size, sha256, storagePath, versionId, createdAt, updatedAt

7. API 设计要点
- 应用相关：POST /apps, GET /apps, DELETE /apps/{id}
- 版本相关：POST /apps/{appId}/versions, GET /apps/{appId}/versions, GET /apps/{appId}/versions/{versionId}, DELETE /apps/{appId}/versions/{versionId}
- 文件上传：POST /uploads/installer, POST /uploads/patch
- 版本检查：GET /check
- 元数据/分发：POST /versions/{versionId}/metadata, GET /files/{fileId}/download-url

8. 验收标准
- 功能点齐全、端到端测试覆盖。
- API 一致、错误码清晰。
- 性能、可用性、可扩展性、安全性符合目标。

9. 变更记录
- 版本 1.0：核心功能定义与原型。

如需，我可以将以上内容落盘为 docs/requirements_full.md 并附上 OpenAPI、SQL、Wireframes 的草稿版本，便于评审与落地。