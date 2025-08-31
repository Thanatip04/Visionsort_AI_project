<?php
// feedback.php
// รับ POST: user_id, message → บันทึกลงตาราง feedback พร้อม timestamp

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

$userId  = isset($_POST['user_id']) ? trim($_POST['user_id']) : null;
$binId   = isset($_POST['bin_id']) ? trim($_POST['bin_id']) : null;
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

if ($message === ''|| $binId === '') {
  echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกข้อความ'], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $stmt = $pdo->prepare("INSERT INTO feedback (user_id, bin_id, message, timestamp) VALUES (?, ?, ?, NOW())");
  $stmt->execute([$userId ?: null, $binId, $message]);

  echo json_encode(['status' => 'success', 'message' => 'ส่งฟีดแบ็กสำเร็จ'], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'เกิดข้อผิดพลาดภายในระบบ'], JSON_UNESCAPED_UNICODE);
}
