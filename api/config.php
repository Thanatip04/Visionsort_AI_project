<?php
// config.php
// ตั้งค่าการเชื่อมต่อฐานข้อมูลด้วย PDO (รองรับ UTF-8 และ error handling)
// ใช้ include_once ในไฟล์อื่น ๆ

$DB_HOST = 'localhost';
$DB_NAME = 'visionsort_db2';
$DB_USER = 'root';
$DB_PASS = ''; // XAMPP ส่วนใหญ่ค่าว่าง

try {
  $pdo = new PDO(
    "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
    $DB_USER,
    $DB_PASS,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,        // โยน Exception เมื่อเกิด Error
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,   // คืน associative array
      PDO::ATTR_EMULATE_PREPARES => false                 // ใช้ native prepares ของ MySQL
    ]
  );
} catch (PDOException $e) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['status' => 'error', 'message' => 'เชื่อมต่อฐานข้อมูลล้มเหลว']);
  exit;
}
