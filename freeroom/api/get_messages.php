<?php
require_once 'db_config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// 获取频道参数，默认为公共频道
$channel = $_GET['channel'] ?? 'public';
$lastTimestamp = $_GET['last_timestamp'] ?? '';

try {
    $pdo = getDbConnection();
    
    // 验证表是否存在
    $stmt = $pdo->query("SHOW TABLES LIKE 'messages'");
    if (!$stmt->rowCount()) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Messages table does not exist'
        ]);
        exit;
    }
    
    $params = [];
    $sql = "SELECT id, username, message, encrypted, method, 
                   DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') as timestamp, 
                   channel 
            FROM messages ";
    
    // 根据频道参数和时间戳构建查询
    if (!empty($lastTimestamp)) {
        // 如果提供了时间戳，则获取该时间戳之后的消息
        $sql .= "WHERE channel = ? AND timestamp > ? ORDER BY timestamp ASC LIMIT 50";
        $params = [$channel, $lastTimestamp];
    } else {
        // 否则获取最近的20条消息
        $sql .= "WHERE channel = ? ORDER BY timestamp DESC LIMIT 20";
        $params = [$channel];
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $messages = $stmt->fetchAll();
    
    // 如果不是按时间倒序排列，这里就不需要翻转数组
    if (empty($lastTimestamp)) {
        // 如果是获取最新的消息，翻转数组以获得正确的时间顺序
        $messages = array_reverse($messages);
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'messages' => $messages,
            'total_count' => count($messages),
            'channel' => $channel
        ]
    ]);
} catch (Exception $e) {
    error_log("获取消息错误: " . $e->getMessage());
    error_log("Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred: ' . $e->getMessage(),
        'data' => null
    ]);
}
?>