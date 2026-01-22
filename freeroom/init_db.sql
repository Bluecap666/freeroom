-- 创建数据库
CREATE DATABASE IF NOT EXISTS freeroom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE freeroom;

-- 创建消息表
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT FALSE,
    method VARCHAR(20) DEFAULT 'simple',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    channel VARCHAR(20) DEFAULT 'public',
    INDEX idx_channel_timestamp (channel, timestamp),
    INDEX idx_username (username)
);

-- 创建加密请求表
CREATE TABLE IF NOT EXISTS encryption_requests (
    id VARCHAR(50) PRIMARY KEY,
    from_user VARCHAR(50) NOT NULL,
    to_user VARCHAR(50) NOT NULL,
    key_value VARCHAR(255) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    handled_at DATETIME NULL,
    handled_by VARCHAR(50) NULL,
    INDEX idx_to_user_status (to_user, status),
    INDEX idx_from_user (from_user)
);

-- 创建会话信息表
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    key_value VARCHAR(255) NOT NULL,
    session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建联系人密钥表
CREATE TABLE IF NOT EXISTS contact_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    contact_name VARCHAR(50) NOT NULL,
    key_value VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_contact (username, contact_name)
);