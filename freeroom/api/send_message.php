<?php
require_once 'db_config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
    exit;
}

$username = $input['username'] ?? '';
$message = $input['message'] ?? '';
$encrypted = $input['encrypted'] ?? false;
$method = $input['method'] ?? 'simple';
$timestamp = $input['timestamp'] ?? date('c');
$channel = $input['channel'] ?? 'public';

if (empty($username) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Username and message are required']);
    exit;
}

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
    
    $stmt = $pdo->prepare("
        INSERT INTO messages (username, message, encrypted, method, timestamp, channel) 
        VALUES (:username, :message, :encrypted, :method, :timestamp, :channel)
    ");
    
    $result = $stmt->execute([
        ':username' => $username,
        ':message' => $message,
        ':encrypted' => $encrypted ? 1 : 0,
        ':method' => $method,
        ':timestamp' => $timestamp,
        ':channel' => $channel
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message_id' => $pdo->lastInsertId(),
            'timestamp' => date('Y-m-d H:i:s'),
            'data' => [
                'username' => $username,
                'message' => $message,
                'encrypted' => $encrypted,
                'method' => $method,
                'timestamp' => $timestamp,
                'channel' => $channel
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to insert message'
        ]);
    }
} catch (Exception $e) {
    error_log("发送消息错误: " . $e->getMessage());
    error_log("Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred: ' . $e->getMessage()
    ]);
}
?>