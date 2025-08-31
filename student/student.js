document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadStudentData();
  loadHistory();
  loadBinOptions(); // โหลดรายการรหัสถังขยะ

  document.getElementById('feedback-btn').addEventListener('click', sendFeedback);
  document.getElementById('logout-btn').addEventListener('click', logout);
});

function checkAuth() {
  const raw = localStorage.getItem('vs_user');
  if (!raw) return (window.location.href = '../login/login2.html');
  const user = JSON.parse(raw);
  if (user.role !== 'student') return (window.location.href = '../login/login2.html');
}

function loadStudentData() {
  const user = JSON.parse(localStorage.getItem('vs_user') || '{}');
  document.getElementById('stu-id').textContent = user.id || '-';
  document.getElementById('stu-name').textContent = user.name || '-';
  document.getElementById('stu-class').textContent = user.class || '-';
  document.getElementById('stu-score').textContent = user.score ?? 0;

  // ถ้ามี avatar เฉพาะบุคคล
  const avatarEl = document.getElementById('avatar');
  if (user.avatar) {
    avatarEl.src = `../uploads/avatars/${user.avatar}`;
  }
}

async function loadHistory() {
  const user = JSON.parse(localStorage.getItem('vs_user') || '{}');
  try {
    const res = await fetch(`../api/get_data.php?action=student_history&user_id=${encodeURIComponent(user.id)}`);
    const data = await res.json();
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = '';

    // อัปเดตโปรไฟล์จากฐานข้อมูล (แทน localStorage ถ้าต้องการความสดใหม่)
    if (data.status === 'success' && data.profile) {
      document.getElementById('stu-id').textContent = data.profile.id || '-';
      document.getElementById('stu-name').textContent = data.profile.name || '-';
      document.getElementById('stu-class').textContent = data.profile.class || '-';
      document.getElementById('stu-score').textContent = data.profile.score ?? 0;

      const avatarEl = document.getElementById('avatar');
      if (data.profile.avatar) {
        avatarEl.src = `../uploads/avatars/${data.profile.avatar}`;
      } else {
      avatarEl.src = '../profile/default.jpg'; // รูป default ถ้าไม่มี
      }
    }

    //แปลงเป็น วัน เดือน ปี ไทย
    function formatThaiDate(dateString) {
      const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const dateObj = new Date(dateString);
      const day = dateObj.getDate();
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear() + 543; // แปลงเป็น พ.ศ.
      const time = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `${day} ${month} ${year} ${time}`;
    }

    if (data.status === 'success' && Array.isArray(data.history) && data.history.length > 0) {
      data.history.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatThaiDate(row.timestamp)}</td>
          <td>${row.waste_type}</td>
          <td>${row.score}</td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--muted)">ไม่มีข้อมูล</td></tr>`;
    }
  } catch (err) {
    console.error('โหลดประวัติไม่สำเร็จ', err);
  }
}

async function loadBinOptions() {
  try {
    const res = await fetch('../api/get_data.php?action=dashboard');
    const data = await res.json();
    const select = document.getElementById('bin-id');
    (data.bins || []).forEach(bin => {
      const opt = document.createElement('option');
      opt.value = bin.id;
      opt.textContent = `${bin.id} - ${bin.location}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('โหลดรหัสถังขยะไม่สำเร็จ', err);
  }
}

async function sendFeedback() {
  const user = JSON.parse(localStorage.getItem('vs_user') || '{}');
  const msg = document.getElementById('feedback-msg').value.trim();
  const binId = document.getElementById('bin-id').value;
  const statusEl = document.getElementById('feedback-status');

  if (!msg|| !binId) {
    statusEl.textContent = 'กรุณากรอกข้อความ';
    statusEl.style.color = 'red';
    return;
  }

  try {
    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('bin_id', binId);
    formData.append('message', msg);

    const res = await fetch('../api/feedback.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.status === 'success') {
      statusEl.textContent = 'ส่งแจ้งปัญหาเรียบร้อยแล้ว';
      statusEl.style.color = 'green';
      document.getElementById('feedback-msg').value = '';
    } else {
      statusEl.textContent = data.message || 'ส่งแจ้งปัญหาล้มเหลว';
      statusEl.style.color = 'red';
    }
  } catch (err) {
    statusEl.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
    statusEl.style.color = 'red';
  }
}

function logout() {
  localStorage.removeItem('vs_user');
  window.location.href = '../login/login2.html';
}
