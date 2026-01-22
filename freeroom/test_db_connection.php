<?php
// 测试数据库连接
require_once 'api/db_config.php';

try {
    $pdo = getDbConnection();
    echo "数据库连接成功!\n";
    
    // 检查表是否存在
    $tables = ['messages', 'encryption_requests', 'sessions', 'contact_keys'];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM {$table}");
            echo "表 {$table} 存在\n";
        } catch (Exception $e) {
            echo "表 {$table} 不存在: " . $e->getMessage() . "\n";
        }
    }
    
    // 尝试插入一条测试消息
    $stmt = $pdo->prepare("
        INSERT INTO messages (username, message, encrypted, method, channel) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $result = $stmt->execute(['TestUser', 'This is a test message', 0, 'simple', 'public']);
    
    if ($result) {
        echo "测试消息插入成功\n";
        $testId = $pdo->lastInsertId();
        
        // 读取刚刚插入的消息
        $stmt = $pdo->prepare("SELECT * FROM messages WHERE id = ? ORDER BY timestamp DESC LIMIT 1");
        $stmt->execute([$testId]);
        $message = $stmt->fetch();
        
        if ($message) {
            echo "测试消息读取成功: " . $message['message'] . "\n";
        }
    } else {
        echo "测试消息插入失败\n";
    }
    
} catch (Exception $e) {
    echo "数据库连接失败: " . $e->getMessage() . "\n";
}
?>