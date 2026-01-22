<?php
// 数据库连接配置
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'freeroom');
define('DB_USER', 'freeroom');
define('DB_PASS', 'freeroom');
define('DB_CHARSET', 'utf8mb4');

try {
    // 首先连接到MySQL服务器但不指定数据库
    $dsn = "mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    
    // 创建数据库（如果不存在）
    $pdo->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET " . DB_CHARSET . " COLLATE " . DB_CHARSET . "_unicode_ci;");
    echo "数据库创建成功或已存在\n";
    
    // 选择数据库
    $pdo->exec("USE " . DB_NAME);
    
    // 创建消息表
    $sql = "
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
    );";
    $pdo->exec($sql);
    echo "消息表创建成功或已存在\n";
    
    // 创建加密请求表
    $sql = "
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
    );";
    $pdo->exec($sql);
    echo "加密请求表创建成功或已存在\n";
    
    // 创建会话信息表
    $sql = "
    CREATE TABLE IF NOT EXISTS sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        key_value VARCHAR(255) NOT NULL,
        session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );";
    $pdo->exec($sql);
    echo "会话信息表创建成功或已存在\n";
    
    // 创建联系人密钥表
    $sql = "
    CREATE TABLE IF NOT EXISTS contact_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        contact_name VARCHAR(50) NOT NULL,
        key_value VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_contact (username, contact_name)
    );";
    $pdo->exec($sql);
    echo "联系人密钥表创建成功或已存在\n";
    
    echo "\n数据库和表初始化完成！\n";
} catch (PDOException $e) {
    die("数据库初始化失败: " . $e->getMessage() . "\n");
}
?>