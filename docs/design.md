# 开发设计文档

## 架构概述
轻量级的应用分发平台，专注于Electron应用的更新管理，包括全量包和增量包的分发。

## 核心模块详细设计

### 应用与版本管理模块
- **应用定义**：每个应用有唯一标识符，包含平台和架构信息。
- **包类型**：
  - 全量包：完整安装程序，用于首次安装或重大更新。
  - 增量包：压缩包，仅包含静态资源，用于热更新。
- **版本体系**：
  - appVersion：安装包版本
  - rendererVersion：热更新版本

### 文件上传与处理模块
- 提供RESTful API用于文件上传。
- 上传后自动计算SHA256哈希。
- 可选生成元数据文件兼容electron-updater。

### 版本检查API
- **端点**：GET /check
- **参数**：appVersion, rendererVersion, platform, arch
- **响应**：JSON对象包含updateType, version, url, sha256

### 存储与分发模块
- 使用云存储服务存储大文件。
- 支持预签名URL下载。
- 集成CDN加速。
- 支持客户端回滚机制。