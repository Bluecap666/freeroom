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

$from_user = $input['from_user'] ?? '';
$to_user = $input['to_user'] ?? '';
$timestamp = $input['timestamp'] ?? date('c');

if (empty($from_user) || empty($to_user)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'From user and to user are required']);
    exit;
}

// 生成随机密钥用于加密
$key = bin2hex(random_bytes(16)); // 生成32字符的十六进制字符串
$request_id = uniqid('req_');

try {
    $pdo = getDbConnection();
    
    $stmt = $pdo->prepare("
        INSERT INTO encryption_requests (id, from_user, to_user, key_value, status, created_at) 
        VALUES (:id, :from_user, :to_user, :key_value, 'pending', :created_at)
    ");
    
    $result = $stmt->execute([
        ':id' => $request_id,
        ':from_user' => $from_user,
        ':to_user' => $to_user,
        ':key_value' => $key,
        ':created_at' => $timestamp
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'request_id' => $request_id,
            'timestamp' => date('Y-m-d H:i:s'),
            'message' => "加密申请已发送给 {$to_user}"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to insert encryption request'
        ]);
    }
} catch (Exception $e) {
    error_log("发送加密请求错误: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred'
    ]);
}
?>