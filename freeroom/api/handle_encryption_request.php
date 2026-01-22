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

$request_id = $input['request_id'] ?? '';
$action = $input['action'] ?? ''; // accept or reject
$handled_by = $input['handled_by'] ?? '';

if (empty($request_id) || empty($action) || !in_array($action, ['accept', 'reject'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Request ID and valid action (accept/reject) are required']);
    exit;
}

try {
    $pdo = getDbConnection();
    
    // 开启事务
    $pdo->beginTransaction();
    
    // 更新请求状态
    $stmt = $pdo->prepare("
        UPDATE encryption_requests 
        SET status = :status, handled_by = :handled_by, handled_at = NOW() 
        WHERE id = :request_id
    ");
    
    $result = $stmt->execute([
        ':request_id' => $request_id,
        ':status' => $action === 'accept' ? 'accepted' : 'rejected',
        ':handled_by' => $handled_by
    ]);
    
    if (!$result || $stmt->rowCount() === 0) {
        $pdo->rollback();
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Request not found']);
        exit;
    }
    
    // 如果是接受请求，存储密钥到联系人
    if ($action === 'accept') {
        // 获取原始请求的密钥
        $stmt = $pdo->prepare("
            SELECT from_user, key_value 
            FROM encryption_requests 
            WHERE id = :request_id
        ");
        $stmt->execute([':request_id' => $request_id]);
        $request = $stmt->fetch();
        
        if ($request) {
            // 插入或更新联系人密钥
            $stmt = $pdo->prepare("
                INSERT INTO contact_keys (username, contact_name, key_value) 
                VALUES (:username, :contact_name, :key_value)
                ON DUPLICATE KEY UPDATE 
                key_value = VALUES(key_value), 
                created_at = VALUES(created_at)
            ");
            
            $stmt->execute([
                ':username' => $handled_by,
                ':contact_name' => $request['from_user'],
                ':key_value' => $request['key_value']
            ]);
        }
    }
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => "请求已{$action}",
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    $pdo->rollback();
    error_log("处理加密请求错误: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred'
    ]);
}
?>