-- 建立資料庫
CREATE DATABASE IF NOT EXISTS calander
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE calander;

-- =========================
-- name table (使用者)
-- =========================
CREATE TABLE IF NOT EXISTS name (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  color VARCHAR(20),
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- schedule table
-- =========================
CREATE TABLE IF NOT EXISTS schedule (
  id INT(11) NOT NULL AUTO_INCREMENT,
  usern VARCHAR(50),
  schedule_name VARCHAR(255),
  schedule_detail TEXT,
  schedule_date DATE,
  PRIMARY KEY (id),
  INDEX idx_usern (usern)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- user_schedule table
-- =========================
CREATE TABLE IF NOT EXISTS user_schedule (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(50),
  schedule_name VARCHAR(255),
  PRIMARY KEY (id),
  INDEX idx_username (username)
);
