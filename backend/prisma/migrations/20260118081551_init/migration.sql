-- CreateTable
CREATE TABLE `apps` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `app_key` VARCHAR(100) NOT NULL,
    `platform` VARCHAR(20) NOT NULL,
    `arch` VARCHAR(20) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `apps_app_key_key`(`app_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `versions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `app_id` BIGINT NOT NULL,
    `app_version` VARCHAR(50) NOT NULL,
    `renderer_version` VARCHAR(50) NOT NULL,
    `version_code` BIGINT NOT NULL,
    `description` TEXT NULL,
    `release_notes` TEXT NULL,
    `installer_file_id` BIGINT NULL,
    `patch_file_id` BIGINT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `versions_app_id_idx`(`app_id`),
    INDEX `versions_version_code_idx`(`version_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` ENUM('installer', 'patch', 'meta') NOT NULL,
    `original_name` VARCHAR(255) NULL,
    `size` BIGINT NULL,
    `sha256` VARCHAR(64) NULL,
    `storage_path` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `files_sha256_idx`(`sha256`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `versions` ADD CONSTRAINT `versions_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `versions` ADD CONSTRAINT `versions_installer_file_id_fkey` FOREIGN KEY (`installer_file_id`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `versions` ADD CONSTRAINT `versions_patch_file_id_fkey` FOREIGN KEY (`patch_file_id`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
