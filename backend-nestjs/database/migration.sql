-- ================================================================
-- DAMH_QuanLyChiTieu - Migration Script cho TiDB Cloud
-- Database: db_qltaichinh
-- Chạy file này trong TiDB Cloud SQL Editor
-- ================================================================

USE db_qltaichinh;

-- ----------------------------------------------------------------
-- 1. Bảng categories (danh mục chi tiêu)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id`    INT          NOT NULL AUTO_INCREMENT,
  `name`  VARCHAR(100) NOT NULL,
  `icon`  VARCHAR(50)  DEFAULT '💰',
  `color` VARCHAR(20)  DEFAULT '#6366f1',
  `type`  ENUM('expense','income','both') DEFAULT 'expense',
  PRIMARY KEY (`id`)
);

-- Dữ liệu mẫu danh mục
INSERT IGNORE INTO `categories` (`id`, `name`, `icon`, `color`, `type`) VALUES
  (1,  'Ăn uống',    '🍜', '#f97316', 'expense'),
  (2,  'Di chuyển',  '🚗', '#3b82f6', 'expense'),
  (3,  'Mua sắm',    '🛍️', '#ec4899', 'expense'),
  (4,  'Giải trí',   '🎮', '#8b5cf6', 'expense'),
  (5,  'Y tế',       '💊', '#ef4444', 'expense'),
  (6,  'Giáo dục',   '📚', '#10b981', 'expense'),
  (7,  'Hóa đơn',    '📋', '#6366f1', 'expense'),
  (8,  'Khác',       '💸', '#64748b', 'expense'),
  (9,  'Lương',      '💰', '#22c55e', 'income'),
  (10, 'Thưởng',     '🎁', '#eab308', 'income');

-- ----------------------------------------------------------------
-- 2. Bảng transactions (giao dịch chi tiêu)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id`                INT            NOT NULL AUTO_INCREMENT,
  `user_id`           INT            NOT NULL,
  `category_id`       INT                     DEFAULT NULL,
  `title`             VARCHAR(255)   NOT NULL,
  `amount`            DECIMAL(15, 2) NOT NULL,
  `description`       TEXT                    DEFAULT NULL,
  `transaction_date`  DATE           NOT NULL,
  `type`              ENUM('expense','income') DEFAULT 'expense',
  `receipt_image_url` VARCHAR(500)            DEFAULT NULL,
  `created_at`        TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id`          (`user_id`),
  KEY `idx_category_id`      (`category_id`),
  KEY `idx_transaction_date` (`transaction_date`)
);
