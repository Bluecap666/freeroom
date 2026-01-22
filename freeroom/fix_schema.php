<?php
// 修复数据库结构
require_once 'api/db_config.php';

try {
    $pdo = getDbConnection();
    echo "数据库连接成功!\n";
    
    // 检查并添加缺失的字段
    $columnsToAdd = [
        ['messages', 'method', "ALTER TABLE messages ADD COLUMN method VARCHAR(20) DEFAULT 'simple'"],
        ['messages', 'channel', "ALTER TABLE messages ADD COLUMN channel VARCHAR(20) DEFAULT 'public' AFTER timestamp"]
    ];
    
    foreach ($columnsToAdd as [$table, $column, $sql]) {
        try {
            // 检查列是否存在
            $stmt = $pdo->prepare("SELECT {$column} FROM {$table} LIMIT 1");
            $stmt->execute();
            echo "列 {$table}.{$column} 已存在\n";
        } catch (Exception $e) {
            // 列不存在，需要添加
            if (strpos($e->getMessage(), 'Unknown column') !== false) {
                echo "添加列 {$table}.{$column}...\n";
                $pdo->exec($sql);
                echo "列 {$table}.{$column} 添加成功\n";
            } else {
                throw $e; // 其他错误继续抛出
            }
        }
    }
    
    // 为新增的列添加索引
    try {
        $pdo->exec("CREATE INDEX idx_channel_timestamp ON messages (channel, timestamp)");
        echo "索引 idx_channel_timestamp 创建成功\n";
    } catch (Exception $e) {
        // 如果索引已存在，会报错，忽略
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "索引 idx_channel_timestamp 已存在\n";
        } else {
            throw $e;
        }
    }
    
    try {
        $pdo->exec("CREATE INDEX idx_method ON messages (method)");
        echo "索引 idx_method 创建成功\n";
    } catch (Exception $e) {
        // 如果索引已存在，会报错，忽略
        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
            echo "索引 idx_method 已存在\n";
        } else {
            throw $e;
        }
    }
    
    echo "\n数据库结构修复完成！\n";
    
    // 再次显示messages表结构
    echo "\n--- 修复后的 messages 表结构 ---\n";
    $stmt = $pdo->query("DESCRIBE messages");
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . " | " . $col['Null'] . " | " . $col['Key'] . " | " . $col['Default'] . " | " . $col['Extra'] . "\n";
    }
    
} catch (Exception $e) {
    echo "数据库操作失败: " . $e->getMessage() . "\n";
}
?>