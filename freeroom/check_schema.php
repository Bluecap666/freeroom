<?php
// 检查数据库结构
require_once 'api/db_config.php';

try {
    $pdo = getDbConnection();
    echo "数据库连接成功!\n";
    
    // 检查messages表结构
    echo "\n--- messages 表结构 ---\n";
    $stmt = $pdo->query("DESCRIBE messages");
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . " | " . $col['Null'] . " | " . $col['Key'] . " | " . $col['Default'] . " | " . $col['Extra'] . "\n";
    }
    
    // 检查encryption_requests表结构
    echo "\n--- encryption_requests 表结构 ---\n";
    $stmt = $pdo->query("DESCRIBE encryption_requests");
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . " | " . $col['Null'] . " | " . $col['Key'] . " | " . $col['Default'] . " | " . $col['Extra'] . "\n";
    }
    
    // 检查sessions表结构
    echo "\n--- sessions 表结构 ---\n";
    $stmt = $pdo->query("DESCRIBE sessions");
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . " | " . $col['Null'] . " | " . $col['Key'] . " | " . $col['Default'] . " | " . $col['Extra'] . "\n";
    }
    
    // 检查contact_keys表结构
    echo "\n--- contact_keys 表结构 ---\n";
    $stmt = $pdo->query("DESCRIBE contact_keys");
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . " | " . $col['Null'] . " | " . $col['Key'] . " | " . $col['Default'] . " | " . $col['Extra'] . "\n";
    }
    
} catch (Exception $e) {
    echo "数据库连接失败: " . $e->getMessage() . "\n";
}
?>