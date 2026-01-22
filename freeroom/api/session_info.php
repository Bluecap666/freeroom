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
$key = $input['key'] ?? '';
$session_start = $input['session_start'] ?? date('c');
$expires_at = $input['expires_at'] ?? '';

if (empty($username) || empty($key)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Username and key are required']);
    exit;
}

try {
    $pdo = getDbConnection();
    
    $stmt = $pdo->prepare("
        INSERT INTO sessions (username, key_value, session_start, expires_at) 
        VALUES (:username, :key_value, :session_start, :expires_at)
        ON DUPLICATE KEY UPDATE 
        key_value = VALUES(key_value),
        session_start = VALUES(session_start),
        expires_at = VALUES(expires_at)
    ");
    
    $result = $stmt->execute([
        ':username' => $username,
        ':key_value' => $key,
        ':session_start' => $session_start,
        ':expires_at' => $expires_at
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => '会话信息已保存',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to save session info'
        ]);
    }
} catch (Exception $e) {
    error_log("保存会话信息错误: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred'
    ]);
}
?>