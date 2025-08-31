<?php
// login.php
// ตรวจสอบสิทธิ์ผู้ใช้
// - Admin: ต้องตรวจ id='admin' + password_verify กับ hash ใน DB
// - Student: ตรวจแค่มี id (ไม่ใช้รหัสผ่าน)
// ส่งคืน JSON: status, message, และข้อมูลผู้ใช้เบื้องต้น

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

// รับค่าจาก POST
$id = isset($_POST['id']) ? trim($_POST['id']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if ($id === '') {
  echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกรหัสประจำตัว']);
  exit;
}

try {
  $stmt = $pdo->prepare("SELECT id, password, role, name FROM users WHERE id = ?");
  $stmt->execute([$id]);
  $user = $stmt->fetch();

  if (!$user) {
    echo json_encode(['status' => 'error', 'message' => 'ไม่พบบัญชีผู้ใช้']);
    exit;
  }

  if ($user['role'] === 'admin') {
    if ($password === '') {
        echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกรหัสผ่านสำหรับผู้ดูแลระบบ']);
        exit;
    }
    // ตรวจรหัสตรง ๆ (ไม่ใช้ hash)
    if ($user['password'] !== $password) {
        echo json_encode(['status' => 'error', 'message' => 'รหัสผ่านไม่ถูกต้อง']);
        exit;
    }
    // แอดมินต้องมี password และตรวจด้วย password_verify
    // if ($password === '') {
    //   echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกรหัสผ่านสำหรับผู้ดูแลระบบ']);
    //   exit;
    // }
    // if (!isset($user['password']) || !$user['password']) {
    //   echo json_encode(['status' => 'error', 'message' => 'ยังไม่ได้ตั้งรหัสผ่านสำหรับผู้ดูแลระบบ']);
    //   exit;
    // }
    // if (!password_verify($password, $user['password'])) {
    //   echo json_encode(['status' => 'error', 'message' => 'รหัสผ่านไม่ถูกต้อง']);
    //   exit;
    // }
  } else {
    // นักเรียน: ไม่ต้องใช้ password
    // (ถ้าต้องใช้ในอนาคตสามารถปรับได้)
  }

  echo json_encode([
    'status' => 'success',
    'message' => 'เข้าสู่ระบบสำเร็จ',
    'user' => [
      'id' => $user['id'],
      'name' => $user['name'],
      'role' => $user['role']
    ]
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'เกิดข้อผิดพลาดภายในระบบ']);
}
