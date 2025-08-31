<?php
// get_data.php
// ดึงข้อมูลตาม action ที่ส่งมาใน query string
// action=dashboard        → สรุปข้อมูล KPI/Types/Last7Days + Users + Bin + Feedback
// action=student_history  → ข้อมูลส่วนตัว + ประวัติการคัดแยกของนักเรียน

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'dashboard';

try {
  if ($action === 'dashboard') {
    // ---------- KPI ----------
    $kpiStmt = $pdo->query("SELECT todayCount, aiAccuracy, totalCount FROM dashboard_kpi LIMIT 1");
    $kpi = $kpiStmt->fetch() ?: ['todayCount' => 0, 'aiAccuracy' => 0, 'totalCount' => 0];

    // ---------- Last 7 Days ----------
    $last7Stmt = $pdo->query("SELECT data_value FROM dashboard_last7days ORDER BY data_date ASC");
    $last7 = array_map(fn($r) => (int)$r['data_value'], $last7Stmt->fetchAll());
    if (!$last7) { 
      $last7 = array_fill(0, 7, 0); }

    // ✅ บังคับให้แท่งสุดท้ายของ $last7 เท่ากับ todayCount
    $last7[count($last7) - 1] = (int)$kpi['todayCount'];

    // ---------- Types ----------
    $typeStmt = $pdo->query("SELECT type_name, type_count FROM dashboard_types");
    $types = [];
    foreach ($typeStmt->fetchAll() as $row) {
      $types[$row['type_name']] = (int)$row['type_count'];
    }
    if (!$types) { $types = []; }


    // ---------- Users (ย่อสำหรับแสดงในตาราง) ----------
    $usersStmt = $pdo->query("
        SELECT 
            u.id, 
            u.name, 
            u.role, 
            u.class,
            COALESCE(SUM(w.score), 0) AS score
        FROM users u
        LEFT JOIN waste_history w ON u.id = w.user_id
        GROUP BY u.id, u.name, u.role, u.class
        ORDER BY u.id ASC
    ");
    $users = $usersStmt->fetchAll(PDO::FETCH_ASSOC);

    // ---------- Bins ----------
    $binsStmt = $pdo->query("
        SELECT 
            id, 
            location, 
            plastic_status, 
            recycle_status, 
            general_status, 
            last_updated,
            coords_lat,
            coords_long
        FROM bin_status
        ORDER BY id ASC
    ");
    $bins = $binsStmt->fetchAll(PDO::FETCH_ASSOC);

    // ---------- Feedback ล่าสุด ----------
    $fbStmt = $pdo->query("
        SELECT 
            f.user_id,
            f.bin_id,  -- ต้องมีคอลัมน์ bin_id ใน feedback
            f.message,
            f.timestamp
        FROM feedback f
        ORDER BY f.timestamp DESC
        LIMIT 20
    ");
    $feedback = $fbStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
      'dashboard' => [
        'todayCount' => (int)$kpi['todayCount'],
        'aiAccuracy' => (float)$kpi['aiAccuracy'],
        'totalCount' => (int)$kpi['totalCount'],
        'last7Days'  => $last7,
        'types'      => $types
      ],
      'users'    => $users,
      'bins'     => $bins,
      'feedback' => $feedback
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }

  if ($action === 'student_history') {
    // ต้องมี user_id
    $userId = isset($_GET['user_id']) ? trim($_GET['user_id']) : '';
    if ($userId === '') {
      echo json_encode(['status' => 'error', 'message' => 'กรุณาระบุ user_id']);
      exit;
    }

    // ดึงข้อมูลผู้ใช้
    $uStmt = $pdo->prepare("SELECT id, name, role, class,  avatar FROM users WHERE id = ?");
    $uStmt->execute([$userId]);
    $user = $uStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
      echo json_encode(['status' => 'error', 'message' => 'ไม่พบนักเรียน']);
      exit;
    }

    // คำนวณคะแนนสะสมจาก waste_history
    $scoreStmt = $pdo->prepare("SELECT COALESCE(SUM(score),0) AS total_score FROM waste_history WHERE user_id = ?");
    $scoreStmt->execute([$userId]);
    $scoreData = $scoreStmt->fetch(PDO::FETCH_ASSOC);
    $user['score'] = (int)$scoreData['total_score'];

    // ดึงประวัติการคัดแยก
   
    $hStmt = $pdo->prepare("
        SELECT 
            CONCAT(date, ' ', TIME_FORMAT(time, '%H:%i:%s')) AS timestamp,
            CASE 
              WHEN type = 1 THEN 'พลาสติก'
              WHEN type = 2 THEN 'ขยะทั่วไป'
              WHEN type = 3 THEN 'ขยะรีไซเคิล'
              WHEN type = 4 THEN 'แก้ว'
              WHEN type = 5 THEN 'โลหะ'
              WHEN type = 6 THEN 'เศษอาหาร'
              ELSE CONCAT('- ', type)
            END AS waste_type,
            score
            -- , data AS extra_data -- ถ้าต้องการส่งค่า data ออกไปด้วย ให้ uncomment บรรทัดนี้
        FROM waste_history
        WHERE user_id = ?
        ORDER BY date DESC, time DESC
        LIMIT 20
    ");
    $hStmt->execute([$userId]);
    $history = $hStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
      'status'  => 'success',
      'profile' => $user,
      'history' => $history
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }

  if ($action === 'system_health') {
  echo json_encode([
      'ai' => true,
      'camera' => false,
      'microbit' => true,
      'uptime' => date('Y-m-d H:i:s')
  ]);
  exit;
  }

  // action ไม่ตรง
  echo json_encode(['status' => 'error', 'message' => 'action ไม่ถูกต้อง']);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['status' => 'error', 'message' => 'เกิดข้อผิดพลาดภายในระบบ']);
}
