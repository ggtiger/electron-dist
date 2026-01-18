# 数据库设计（MySQL）

-- 应用表
CREATE TABLE `apps` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `app_key` VARCHAR(100) NOT NULL UNIQUE,
  `platform` VARCHAR(20) NOT NULL,
  `arch` VARCHAR(20) NOT NULL,
  `description` TEXT,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 版本表
CREATE TABLE `versions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `app_id` BIGINT NOT NULL,
  `app_version` VARCHAR(50) NOT NULL,
  `renderer_version` VARCHAR(50) NOT NULL,
  `version_code` BIGINT NOT NULL,
  `description` TEXT,
  `release_notes` TEXT,
  `installer_file_id` BIGINT,
  `patch_file_id` BIGINT,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_versions_app ON versions(app_id);
CREATE INDEX idx_versions_code ON versions(version_code);

-- 文件表
CREATE TABLE `files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('installer','patch','meta') NOT NULL,
  `original_name` VARCHAR(255),
  `size` BIGINT,
  `sha256` VARCHAR(64),
  `storage_path` TEXT,
  `version_id` BIGINT,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`version_id`) REFERENCES `versions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_files_version ON files(version_id);
