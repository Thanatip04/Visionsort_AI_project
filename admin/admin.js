// admin_script.js
// อธิบาย:
// - checkAuth(): ตรวจ role ใน localStorage (ต้องเป็น admin เท่านั้น)
// - fetchDashboardData(): ดึงข้อมูลจาก API action=dashboard
// - updateKPIs(), renderCharts(), populateTables(): อัปเดต UI
// - setupNavbar(): สลับ section ตามเมนู
// - logout(): เคลียร์และกลับหน้า Login

let chart7d, chartTypes;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupNavbar();
  initAdminName();
  fetchDashboardData();

  // ปุ่ม logout อาจอยู่ในเมนู (nav) แทนบน topbar
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});

function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'เมื่อสักครู่';
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
  if (diffDay === 1) return 'เมื่อวาน';
  return past.toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}


function checkAuth() {
  const raw = localStorage.getItem('vs_user');
  if (!raw) { window.location.href = '../login/login2.html'; return; }
  const user = JSON.parse(raw);
  if (user.role !== 'admin') { window.location.href = '../login/login2.html'; }
}

function initAdminName() {
  const user = JSON.parse(localStorage.getItem('vs_user') || '{}');
  const profileIcon = document.querySelector('.profile-icon');
  const nameEl = document.getElementById('admin-name');

  if (user.name) {
    nameEl.textContent = `สวัสดี, ${user.name}`;
    profileIcon && profileIcon.classList.remove('hidden');
  } else {
    nameEl.textContent = 'ผู้ดูแลระบบ';
    profileIcon && profileIcon.classList.add('hidden');
  }
}


async function fetchSystemHealth() {
  try {
    const res = await fetch('../api/get_data.php?action=system_health');
    const data = await res.json();

    updateStatus('status-ai', data.ai);
    updateStatus('status-camera', data.camera);
    updateStatus('status-microbit', data.microbit);
    document.getElementById('uptime').textContent = data.uptime ? timeAgo(data.uptime) : '-';
  } catch (err) {
    console.error('โหลดสถานะระบบไม่สำเร็จ', err);
  }
}
function updateStatus(id, isOnline) {
  const el = document.getElementById(id);
  el.textContent = isOnline ? 'Online' : 'Offline';
  el.classList.toggle('online', isOnline);
  el.classList.toggle('offline', !isOnline);
}
// เรียกตอนโหลดหน้า
fetchSystemHealth();

async function fetchDashboardData() {
  try {
    const res = await fetch('../api/get_data.php?action=dashboard');
    const data = await res.json();
    updateKPIs(data.dashboard);
    renderCharts(data.dashboard);
    populateTables(data);
    requestAnimationFrame(() => {   // ให้ layout ลงตัวก่อน
      if (chart7d) chart7d.resize();
      if (chartTypes) chartTypes.resize();
    });
  } catch (err) {
    console.error('โหลดข้อมูลไม่สำเร็จ', err);
  }
}

function updateKPIs(kpi) {
  document.getElementById('kpi-total').textContent = Number(kpi.totalCount).toLocaleString();
  document.getElementById('kpi-acc').textContent = `${Number(kpi.aiAccuracy)}%`;
  document.getElementById('kpi-today').textContent = Number(kpi.todayCount).toLocaleString();
}

function renderCharts(dash) {
  // ✅ ปรับข้อมูล 7 วันให้รวมกันเท่ากับ totalCount
  let last7 = [...dash.last7Days];

// ✅ บังคับแท่งสุดท้าย = todayCount
last7[last7.length - 1] = dash.todayCount;

// ✅ คำนวณผลรวมของ 6 แท่งแรก
const sumFirst6 = last7.slice(0, -1).reduce((a, b) => a + b, 0);

// ✅ เป้าหมายของ 6 แท่งแรก = totalCount - todayCount
const targetFirst6 = dash.totalCount - dash.todayCount;

// ✅ ถ้าผลรวมเดิมไม่ตรงกับเป้าหมาย → สเกล 6 แท่งแรก
if (sumFirst6 > 0 && targetFirst6 >= 0) {
  const factor = targetFirst6 / sumFirst6;
  for (let i = 0; i < last7.length - 1; i++) {
    last7[i] = Math.round(last7[i] * factor);
  }
}

// ✅ ปรับเศษเล็กน้อยให้รวมกันพอดี
const diff = dash.totalCount - last7.reduce((a, b) => a + b, 0);
if (diff !== 0) {
  last7[0] += diff;
}


  // ✅ ปรับข้อมูลประเภทขยะให้รวมกันเท่ากับ totalCount
let types = dash.types;
const sumTypes = Object.values(types).reduce((a, b) => a + b, 0);
if (sumTypes !== dash.totalCount && sumTypes > 0) {
  const factor = dash.totalCount / sumTypes;

  // สเกลและปัดเศษ
  types = Object.fromEntries(
    Object.entries(types).map(([k, v]) => [k, Math.round(v * factor)])
  );

  // ✅ ตรวจผลรวมแล้วปรับเศษให้ตรง
  let diff = dash.totalCount - Object.values(types).reduce((a, b) => a + b, 0);
  if (diff !== 0) {
    // ปรับตัวแรก ๆ ให้ตรง
    const keys = Object.keys(types);
    types[keys[0]] += diff;
  }
}

  // กราฟ 7 วัน
  if (chart7d) chart7d.destroy();
  const ctx1 = document.getElementById('chart7d');
  chart7d = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['6 วันก่อน','5 วันก่อน','4 วันก่อน','3 วันก่อน','2 วันก่อน','วานนี้','วันนี้'],
      datasets: [{ label: 'จำนวน (ชิ้น)', data: last7, backgroundColor: 'rgba(34,197,94,0.6)', borderColor: 'rgba(34,197,94,1)', borderWidth: 1 }]
    },
    // เมื่อสร้าง chart7d และ chartTypes
    options: { 
        responsive: true, 
        maintainAspectRatio: false, // ให้กราฟยืดตาม .chart-wrap ที่กำหนด height
        plugins: { legend: { display: false } },
        animation: { duration: 250 }, // ลด jank ตอน resize 
        scales: { y:{ beginAtZero:true, ticks:{ precision:0 } } } }
  });

  // กราฟสัดส่วนประเภทขยะ (ชื่อ key ตามฐานข้อมูลตัวอย่าง)
  if (chartTypes) chartTypes.destroy();
  const ctx2 = document.getElementById('chartTypes');

  // สร้าง labels/values อัตโนมัติจาก object ชนิดขยะ
  const typeLabels = Object.keys(dash.types);
  const typeValues = Object.values(dash.types);

  chartTypes = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: Object.keys(types),
      datasets: [{ data: Object.values(types),
        backgroundColor: ['#22c55e','#3b82f6','#f59e0b','#6b7280','#ef4444'] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function statusBadge(status) {
  if (status === 'full') {
    return `<span class="status full">เต็ม</span>`;
  } else {
    return `<span class="status not-full">ยังไม่เต็ม</span>`;
  }
}

function formatThaiDateTime(dateString) {
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

function populateTables(data) {
  // Users
  const uBody = document.getElementById('users-tbody');
  uBody.innerHTML = '';
  (data.users || []).forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td>${u.id}</td>
    <td>${u.name}</td>
    <td>${u.role}</td>
    <td>${u.class ?? '-'}</td>
    <td>${u.score ?? 0}</td>`;
    uBody.appendChild(tr);
  });

  // Bins
  const bBody = document.getElementById('bins-tbody');
  bBody.innerHTML = '';
  (data.bins || []).forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.id}</td>
      <td>${b.location}</td>
      <td>${statusBadge(b.plastic_status)}</td>
      <td>${statusBadge(b.recycle_status)}</td>
      <td>${statusBadge(b.general_status)}</td>
      <td>${formatThaiDateTime(b.last_updated)}</td>`;
    bBody.appendChild(tr);
  });
  
  // หลังจากเติมข้อมูลตาราง Bins เสร็จ
  if (document.getElementById('map')) {
    const map = L.map('map'); // ไม่ setView ตายตัว

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markers = [];

    (data.bins || []).forEach(b => {
      if (b.coords_lat && b.coords_long) {
        const lat = Number(b.coords_lat);
        const lng = Number(b.coords_long);
        markers.push([lat, lng]);
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`<b>${b.id}</b><br>${b.location}`);
      }
    });

    if (markers.length > 0) {
      map.fitBounds(markers);
    }

    // เก็บ map และ markers ไว้ใช้ตอนเปลี่ยนแท็บ
    window.binMap = { map, markers };
  }

  // Feedback
  const fBody = document.getElementById('feedback-tbody');
  fBody.innerHTML = '';
  (data.feedback || []).forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td>${f.user_id ?? '-'}</td>
    <td>${f.bin_id ?? '-'}</td>
    <td>${escapeHTML(f.message)}</td>
    <td>${formatThaiDateTime(f.timestamp)}</td>`;
    fBody.appendChild(tr);
  });
}

function setupNavbar() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');

  // เปิด/ปิดเมนูบนจอเล็ก
  if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('show'));
  }

  document.querySelectorAll('.nav-item').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();

      // สลับ active เมนู
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      a.classList.add('active');

      // ซ่อนทุก section แล้วเปิดอันที่เลือก
      document.querySelectorAll('.dashboard-section').forEach(sec => sec.classList.remove('active'));
      const targetId = a.dataset.target;
      const section = document.getElementById(targetId);
      section.classList.add('active');

      // ปิดเมนูอัตโนมัติหลังเลือก (บนจอเล็ก)
      nav.classList.remove('show');

      // รอให้ layout เสถียรแล้วค่อย resize กราฟ
      requestAnimationFrame(() => {
        if (targetId === 'overview') {
          if (chart7d) chart7d.resize();
          if (chartTypes) chartTypes.resize();
        }

        // ✅ เพิ่มส่วนนี้สำหรับแมพ
        if (targetId === 'bins' && window.binMap) {
          setTimeout(() => {
            window.binMap.map.invalidateSize();
            if (window.binMap.markers.length > 0) {
              window.binMap.map.fitBounds(window.binMap.markers);
            }
          }, 200);
        }
      });
    });
  });
}


function logout() {
  localStorage.removeItem('vs_user');
  window.location.href = '../login/login2.html';
}

// ป้องกัน XSS เวลาแสดงข้อความฟีดแบ็ก
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}
