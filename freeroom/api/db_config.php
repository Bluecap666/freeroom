<?php
// 数据库配置
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'freeroom');
define('DB_USER', 'freeroom');
define('DB_PASS', 'freeroom');
define('DB_CHARSET', 'utf8mb4');

// 创建PDO连接
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log("数据库连接失败: " . $e->getMessage());
        throw $e;
    }
}
?>