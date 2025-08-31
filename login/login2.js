// login_script.js
// อธิบาย:
// - ซ่อน/แสดงช่องรหัสผ่านอัตโนมัติเมื่อพิมพ์ id='admin'
// - ส่งข้อมูลไปยัง API login.php
// - ถ้าเป็น admin → ไปหน้า admin.html, ถ้าเป็น student → ไปหน้า student.html

document.addEventListener('DOMContentLoaded', () => {
  const idInput = document.getElementById('user-id');
  const pwWrap  = document.getElementById('password-wrap');
  const pwInput = document.getElementById('password');
  const form    = document.getElementById('login-form');
  const errorEl = document.getElementById('error');

  // แสดงช่องรหัสผ่านเมื่อพิมพ์ admin
  idInput.addEventListener('input', () => {
    if (idInput.value.trim().toLowerCase() === 'admin') {
      pwWrap.style.display = 'block';
    } else {
      pwWrap.style.display = 'none';
      pwInput.value = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    const id = idInput.value.trim();
    const password = pwInput.value;

    try {
      const formData = new FormData();
      formData.append('id', id);
      if (id.toLowerCase() === 'admin') formData.append('password', password);

      const res = await fetch('../api/login.php', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.status !== 'success') {
        errorEl.textContent = data.message || 'เข้าสู่ระบบไม่สำเร็จ';
        errorEl.style.display = 'block';
        return;
      }

      // เก็บ user ไว้ใน localStorage
      localStorage.setItem('vs_user', JSON.stringify(data.user));

      // เปลี่ยนหน้า
      if (data.user.role === 'admin') {
        window.location.href = '../admin/admin.html';
      } else {
        // ส่งต่อไปหน้า student
        window.location.href = `../student/student.html`;
      }
    } catch (err) {
      errorEl.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      errorEl.style.display = 'block';
    }
  });
});
