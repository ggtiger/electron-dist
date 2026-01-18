# 数据字典（更细化版本）

- 应用 (apps)
  - id: BIGINT PK
  - name: VARCHAR(255)
  - app_key: VARCHAR(100) UNIQUE
  - platform: VARCHAR(20)
  - arch: VARCHAR(20)
  - description: TEXT
  - status: VARCHAR(20)
  - created_at: DATETIME
  - updated_at: DATETIME
  - deleted_at: DATETIME

- 版本 (versions)
  - id: BIGINT PK
  - app_id: BIGINT FK -> apps(id)
  - app_version: VARCHAR(50)
  - renderer_version: VARCHAR(50)
  - version_code: BIGINT
  - description: TEXT
  - release_notes: TEXT
  - installer_file_id: BIGINT FK -> files(id)
  - patch_file_id: BIGINT FK -> files(id)
  - created_at: DATETIME
  - updated_at: DATETIME
  - is_active: BOOLEAN

- 文件 (files)
  - id: BIGINT PK
  - type: ENUM('installer','patch','meta')
  - original_name: VARCHAR(255)
  - size: BIGINT
  - sha256: VARCHAR(64)
  - storage_path: TEXT
  - version_id: BIGINT FK -> versions(id)
  - created_at: DATETIME
  - updated_at: DATETIME
