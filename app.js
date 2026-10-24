/* HostelHub – Demo app with localStorage */

const KEYS = {
  user: 'hh_user',
  complaints: 'hh_complaints',
  reviews: 'hh_reviews',
  notifs: 'hh_notifs',
  counter: 'hh_counter',
};

const DEMO_STUDENT = {
  id: 'student-1',
  email: 'student@demo.hostelhub',
  full_name: 'Aarav Patel',
  hostel_block: 'Block A',
  room_number: '204',
  enrollment_number: 'CE2024-1042',
  role: 'student',
};

const DEMO_ADMIN = {
  id: 'admin-1',
  email: 'admin@demo.hostelhub',
  full_name: 'Priya Sharma',
  hostel_block: 'Admin',
  room_number: 'N/A',
  enrollment_number: 'ADMIN-001',
  role: 'admin',
};

const DEMO_PASS = 'demo1234';

const SAMPLE_COMPLAINTS = [
  {
    id: 'c1', complaint_id: 'HH-CMP-1001', user_id: 'student-1',
    category: 'Washroom', hostel_block: 'Block A', location: 'Floor 2 Common Washroom',
    room_or_area: '2nd Floor', description: 'Water leakage from ceiling and broken tap.',
    priority: 'High', status: 'In Progress', assigned_to: 'Maintenance Staff',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'c2', complaint_id: 'HH-CMP-1002', user_id: 'student-1',
    category: 'Drinking Water', hostel_block: 'Block A', location: 'Near Room 204',
    room_or_area: '204', description: 'Water cooler not working.',
    priority: 'Urgent', status: 'Assigned', assigned_to: 'Plumbing Team',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'c3', complaint_id: 'HH-CMP-1003', user_id: 'student-1',
    category: 'Corridor', hostel_block: 'Block A', location: 'Main Corridor Floor 2',
    room_or_area: 'Corridor', description: 'Lights not working in corridor.',
    priority: 'Normal', status: 'Resolved', resolution_notes: 'Replaced bulbs.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const MENUS = [
  { type: 'Breakfast', time: '07:30 AM – 09:00 AM', items: ['Poha', 'Bread Butter', 'Tea / Coffee', 'Boiled Eggs'] },
  { type: 'Lunch', time: '12:30 PM – 02:00 PM', items: ['Roti', 'Dal Tadka', 'Paneer Butter Masala', 'Jeera Rice', 'Salad & Curd'] },
  { type: 'Dinner', time: '07:30 PM – 09:00 PM', items: ['Chapati', 'Mix Veg', 'Dal Fry', 'Rice', 'Sweet (Halwa)'] },
];

const CANTEEN = [
  { name: 'Veg Sandwich', cat: 'Snacks', price: 40, avail: true, desc: 'Fresh vegetables with green chutney' },
  { name: 'Masala Dosa', cat: 'South Indian', price: 60, avail: true, desc: 'Crispy dosa with potato filling' },
  { name: 'Cold Coffee', cat: 'Beverages', price: 50, avail: true, desc: 'Chilled coffee with ice cream' },
  { name: 'Samosa (2 pcs)', cat: 'Snacks', price: 30, avail: true, desc: 'Crispy fried samosas with chutney' },
  { name: 'Maggi', cat: 'Snacks', price: 35, avail: false, desc: 'Classic masala Maggi noodles' },
  { name: 'Fruit Juice', cat: 'Beverages', price: 45, avail: true, desc: 'Fresh seasonal fruit juice' },
  { name: 'Pav Bhaji', cat: 'Main Course', price: 70, avail: true, desc: 'Spicy vegetable bhaji with butter pav' },
  { name: 'Ice Cream Cup', cat: 'Desserts', price: 40, avail: true, desc: 'Vanilla / Chocolate / Strawberry' },
];

const ANNOUNCEMENTS = [
  { title: 'Water Supply Maintenance', content: 'Block A water interrupted Saturday 10 AM – 2 PM for tank cleaning.' },
  { title: 'Mess Menu Change – Sunday', content: 'Special Sunday lunch: Paneer special + Gulab Jamun.' },
];

// ---------- Storage helpers ----------
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function initData() {
  if (!localStorage.getItem(KEYS.complaints)) save(KEYS.complaints, SAMPLE_COMPLAINTS);
  if (!localStorage.getItem(KEYS.counter)) localStorage.setItem(KEYS.counter, '1003');
  if (!localStorage.getItem(KEYS.reviews)) save(KEYS.reviews, []);
  if (!localStorage.getItem(KEYS.notifs)) {
    save(KEYS.notifs, [
      { id: 'n1', user_id: 'student-1', title: 'Complaint Status Updated', message: 'HH-CMP-1001 is now In Progress.', read: false, at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'n2', user_id: 'student-1', title: 'Mess Menu Updated', message: "Today's lunch menu has been published.", read: true, at: new Date(Date.now() - 18000000).toISOString() },
    ]);
  }
}

// ---------- UI helpers ----------
function toast(msg, type) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + (type || '');
  setTimeout(() => { el.className = 'toast'; }, 3500);
}

function showPage(name) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  window.scrollTo(0, 0);

  if (name === 'dashboard') renderDashboard();
  if (name === 'admin') renderAdmin();
}

function statusBadge(s) {
  const map = {
    Received: 'badge-received',
    Assigned: 'badge-assigned',
    'In Progress': 'badge-progress',
    Resolved: 'badge-resolved',
    Cancelled: 'badge-cancelled',
  };
  return `<span class="badge ${map[s] || ''}">${s}</span>`;
}

function priorityBadge(p) {
  const map = { Normal: 'badge-normal', High: 'badge-high', Urgent: 'badge-urgent' };
  return `<span class="badge ${map[p] || ''}">${p}</span>`;
}

function getUser() {
  return load(KEYS.user, null);
}

// ---------- Auth ----------
function fillDemo(role) {
  if (role === 'student') {
    document.getElementById('login-email').value = DEMO_STUDENT.email;
    document.getElementById('login-password').value = DEMO_PASS;
  } else {
    document.getElementById('login-email').value = DEMO_ADMIN.email;
    document.getElementById('login-password').value = DEMO_PASS;
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-password').value;
  if (pass !== DEMO_PASS) {
    toast('Invalid password. Use demo1234', 'error');
    return;
  }
  let user = null;
  if (email === DEMO_STUDENT.email) user = DEMO_STUDENT;
  else if (email === DEMO_ADMIN.email) user = DEMO_ADMIN;
  else {
    toast('Unknown email. Use demo accounts or sign up.', 'error');
    return;
  }
  save(KEYS.user, user);
  toast('Login successful!', 'success');
  showPage(user.role === 'admin' ? 'admin' : 'dashboard');
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const pass = document.getElementById('su-pass').value;
  const confirm = document.getElementById('su-confirm').value;
  const block = document.getElementById('su-block').value;
  const room = document.getElementById('su-room').value.trim();
  const enroll = document.getElementById('su-enroll').value.trim();

  if (pass !== confirm) {
    toast('Passwords do not match', 'error');
    return;
  }
  if (pass.length < 6) {
    toast('Password min 6 characters', 'error');
    return;
  }
  // Demo signup always creates student (password not stored in this simple demo)
  const user = {
    id: 'user-' + Date.now(),
    email,
    full_name: name,
    hostel_block: block,
    room_number: room,
    enrollment_number: enroll,
    role: 'student',
  };
  save(KEYS.user, user);
  toast('Account created!', 'success');
  showPage('dashboard');
}

function handleLogout() {
  if (!confirm('Logout?')) return;
  localStorage.removeItem(KEYS.user);
  toast('Logged out');
  showPage('landing');
}

// ---------- Dashboard views ----------
function showDashView(view, linkEl) {
  document.querySelectorAll('#page-dashboard .dash-view').forEach((v) => v.classList.remove('active'));
  const el = document.getElementById('view-' + view);
  if (el) el.classList.add('active');
  document.querySelectorAll('#page-dashboard .side-link').forEach((a) => a.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
  document.getElementById('dash-title').textContent =
    { overview: 'Overview', cleanliness: 'Cleanliness', complaints: 'My Complaints', mess: 'Mess Menu',
      reviews: 'Food Reviews', canteen: 'Canteen', rector: 'Rector & Info', notifications: 'Notifications', profile: 'My Profile' }[view] || view;

  if (view === 'overview') renderOverview();
  if (view === 'complaints') renderComplaints();
  if (view === 'mess') renderMess();
  if (view === 'reviews') renderReviews();
  if (view === 'canteen') renderCanteen();
  if (view === 'notifications') renderNotifs();
  if (view === 'profile') renderProfile();

  document.getElementById('sidebar').classList.remove('open');
}

function renderDashboard() {
  const user = getUser();
  if (!user || user.role === 'admin') {
    showPage(user?.role === 'admin' ? 'admin' : 'login');
    return;
  }
  document.getElementById('dash-user-name').textContent = user.full_name;
  document.getElementById('dash-user-email').textContent = user.email;
  showDashView('overview', document.querySelector('#page-dashboard .side-link'));
}

function renderOverview() {
  const user = getUser();
  const all = load(KEYS.complaints, []).filter((c) => c.user_id === user.id);
  const pending = all.filter((c) => ['Received', 'Assigned', 'In Progress'].includes(c.status)).length;
  const resolved = all.filter((c) => c.status === 'Resolved').length;
  const reviews = load(KEYS.reviews, []).filter((r) => r.user_id === user.id);
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

  document.getElementById('welcome-msg').textContent = `Welcome back, ${user.full_name.split(' ')[0]}!`;
  document.getElementById('welcome-sub').textContent = `${user.hostel_block} · Room ${user.room_number} · ${user.enrollment_number}`;

  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card"><div class="icon" style="background:#dbeafe">📋</div><div><b>${all.length}</b><span>Total Complaints</span></div></div>
    <div class="stat-card"><div class="icon" style="background:#fef3c7">⏳</div><div><b>${pending}</b><span>Pending</span></div></div>
    <div class="stat-card"><div class="icon" style="background:#d1fae5">✅</div><div><b>${resolved}</b><span>Resolved</span></div></div>
    <div class="stat-card"><div class="icon" style="background:#cffafe">⭐</div><div><b>${avg}</b><span>Meal Rating</span></div></div>
  `;

  document.getElementById('today-menu').innerHTML = MENUS.map((m) =>
    `<div style="margin-bottom:12px"><strong>${m.type}</strong> <span class="tiny muted">${m.time}</span><br/><span class="tiny">${m.items.join(' · ')}</span></div>`
  ).join('');

  document.getElementById('announcements-list').innerHTML = ANNOUNCEMENTS.map((a) =>
    `<div style="border-left:3px solid var(--blue);padding-left:10px;margin-bottom:10px"><strong class="tiny">${a.title}</strong><p class="tiny muted">${a.content}</p></div>`
  ).join('');

  const recent = all.slice(0, 5);
  if (!recent.length) {
    document.getElementById('recent-complaints').innerHTML = '<p class="muted">No complaints yet.</p>';
  } else {
    document.getElementById('recent-complaints').innerHTML = `
      <table><thead><tr><th>ID</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>${recent.map((c) => `
        <tr>
          <td><a href="#" onclick="openComplaint('${c.id}');return false">${c.complaint_id}</a></td>
          <td>${c.category}</td>
          <td>${priorityBadge(c.priority)}</td>
          <td>${statusBadge(c.status)}</td>
          <td class="tiny">${new Date(c.created_at).toLocaleDateString()}</td>
        </tr>`).join('')}
      </tbody></table>`;
  }
}

// ---------- Complaints ----------
function submitComplaint(e) {
  e.preventDefault();
  const user = getUser();
  let counter = parseInt(localStorage.getItem(KEYS.counter) || '1003', 10) + 1;
  localStorage.setItem(KEYS.counter, String(counter));

  const c = {
    id: 'c-' + Date.now(),
    complaint_id: 'HH-CMP-' + counter,
    user_id: user.id,
    category: document.getElementById('c-cat').value,
    hostel_block: document.getElementById('c-block').value,
    location: document.getElementById('c-loc').value.trim(),
    room_or_area: document.getElementById('c-room').value.trim(),
    description: document.getElementById('c-desc').value.trim(),
    priority: document.getElementById('c-pri').value,
    status: 'Received',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const list = load(KEYS.complaints, []);
  list.unshift(c);
  save(KEYS.complaints, list);

  const notifs = load(KEYS.notifs, []);
  notifs.unshift({
    id: 'n-' + Date.now(),
    user_id: user.id,
    title: 'Complaint Received',
    message: `Your complaint ${c.complaint_id} has been registered.`,
    read: false,
    at: new Date().toISOString(),
  });
  save(KEYS.notifs, notifs);

  toast(`Complaint ${c.complaint_id} submitted!`, 'success');
  e.target.reset();
  openComplaint(c.id);
}

function renderComplaints() {
  const user = getUser();
  let list = load(KEYS.complaints, []).filter((c) => c.user_id === user.id);
  const q = (document.getElementById('c-search')?.value || '').toLowerCase();
  const st = document.getElementById('c-filter-status')?.value || '';
  if (q) list = list.filter((c) => c.complaint_id.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));
  if (st) list = list.filter((c) => c.status === st);

  if (!list.length) {
    document.getElementById('complaints-table').innerHTML = '<p class="muted" style="padding:24px;text-align:center">No complaints found.</p>';
    return;
  }
  document.getElementById('complaints-table').innerHTML = `
    <table><thead><tr><th>ID</th><th>Category</th><th>Location</th><th>Priority</th><th>Status</th><th>Date</th><th></th></tr></thead>
    <tbody>${list.map((c) => `
      <tr>
        <td><strong>${c.complaint_id}</strong></td>
        <td>${c.category}</td>
        <td class="tiny">${c.location}</td>
        <td>${priorityBadge(c.priority)}</td>
        <td>${statusBadge(c.status)}</td>
        <td class="tiny">${new Date(c.created_at).toLocaleDateString()}</td>
        <td><a href="#" onclick="openComplaint('${c.id}');return false">View</a></td>
      </tr>`).join('')}
    </tbody></table>`;
}

function openComplaint(id) {
  const c = load(KEYS.complaints, []).find((x) => x.id === id);
  if (!c) return;
  showDashView('complaint-detail');
  const flow = ['Received', 'Assigned', 'In Progress', 'Resolved'];
  const idx = flow.indexOf(c.status);

  document.getElementById('complaint-detail-body').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px;margin:16px 0">
      <div>
        <h1>${c.complaint_id}</h1>
        <p class="muted tiny">Submitted ${new Date(c.created_at).toLocaleString()}</p>
      </div>
      <div>${priorityBadge(c.priority)} ${statusBadge(c.status)}</div>
    </div>
    <div class="card">
      <h3>Progress Timeline</h3>
      <div class="timeline">
        ${flow.map((s, i) => `
          <div class="tl-step">
            <div class="tl-dot ${idx >= i || c.status === s ? 'done' : ''}">${i + 1}</div>
            <div class="tl-label">${s}</div>
          </div>`).join('')}
      </div>
      ${c.status === 'Cancelled' ? '<p class="muted" style="text-align:center">This complaint was cancelled.</p>' : ''}
    </div>
    <div class="card" style="margin-top:16px">
      <h3>Details</h3>
      <p><strong>Category:</strong> ${c.category}</p>
      <p><strong>Block:</strong> ${c.hostel_block} · <strong>Area:</strong> ${c.room_or_area}</p>
      <p><strong>Location:</strong> ${c.location}</p>
      <p><strong>Description:</strong> ${c.description}</p>
      ${c.assigned_to ? `<p><strong>Assigned to:</strong> ${c.assigned_to}</p>` : ''}
      ${c.resolution_notes ? `<p><strong>Resolution:</strong> ${c.resolution_notes}</p>` : ''}
    </div>
    ${c.priority === 'Urgent' && c.status !== 'Resolved' ? `
      <div class="card card-warn" style="margin-top:16px">
        <strong>⚠ Urgent</strong>
        <p class="tiny">This website does not replace official emergency procedures. Contact campus security for immediate help.</p>
      </div>` : ''}
  `;
}

// Priority urgent note toggle
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'c-pri') {
    document.getElementById('urgent-note').style.display = e.target.value === 'Urgent' ? 'block' : 'none';
  }
});

// ---------- Mess / Reviews / Canteen ----------
function renderMess() {
  document.getElementById('mess-list').innerHTML = MENUS.map((m) => `
    <div class="card">
      <div style="display:flex;justify-content:space-between"><h3>${m.type}</h3><span class="badge badge-warn">Demo</span></div>
      <p class="tiny muted">${m.time}</p>
      <ul style="margin-top:10px;padding-left:18px;font-size:0.9rem">
        ${m.items.map((i) => `<li>${i}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function submitReview(e) {
  e.preventDefault();
  const user = getUser();
  const meal = document.getElementById('r-meal').value;
  const rating = parseInt(document.getElementById('r-rating').value, 10);
  const text = document.getElementById('r-text').value.trim();
  const list = load(KEYS.reviews, []);
  if (list.some((r) => r.user_id === user.id && r.meal === meal)) {
    toast('You already reviewed this meal', 'error');
    return;
  }
  list.unshift({
    id: 'r-' + Date.now(),
    user_id: user.id,
    user_name: user.full_name,
    meal,
    rating,
    text,
    at: new Date().toISOString(),
  });
  save(KEYS.reviews, list);
  toast('Review submitted (demo)', 'success');
  e.target.reset();
  renderReviews();
}

function renderReviews() {
  const user = getUser();
  const mine = load(KEYS.reviews, []).filter((r) => r.user_id === user.id);
  document.getElementById('my-reviews').innerHTML = mine.length
    ? mine.map((r) => `<div style="border-bottom:1px solid var(--border);padding:10px 0"><strong>${r.meal}</strong> · ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}<br/><span class="tiny muted">${r.text || '—'}</span></div>`).join('')
    : '<p class="muted">No reviews yet.</p>';
}

function renderCanteen() {
  const q = (document.getElementById('can-search')?.value || '').toLowerCase();
  let items = CANTEEN;
  if (q) items = items.filter((i) => i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q));
  document.getElementById('canteen-list').innerHTML = items.map((i) => `
    <div class="card" style="${i.avail ? '' : 'opacity:0.7'}">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div><h3>${i.name}</h3><span class="tiny muted">${i.cat}</span></div>
        <div style="text-align:right"><strong style="color:var(--blue)">₹${i.price}</strong><br/><span class="badge badge-warn">Demo</span></div>
      </div>
      <p class="tiny muted" style="margin:8px 0">${i.desc}</p>
      <span class="badge ${i.avail ? 'badge-ok' : 'badge-no'}">${i.avail ? 'Available' : 'Unavailable'}</span>
    </div>
  `).join('') || '<p class="muted">No items found.</p>';
}

function renderNotifs() {
  const user = getUser();
  const list = load(KEYS.notifs, []).filter((n) => n.user_id === user.id);
  document.getElementById('notif-list').innerHTML = list.length
    ? list.map((n) => `
      <div style="padding:12px;border-bottom:1px solid var(--border);${!n.read ? 'background:#eff6ff' : ''}">
        <strong>${n.title}</strong>
        <p class="tiny muted">${n.message}</p>
        <span class="tiny muted">${new Date(n.at).toLocaleString()}</span>
      </div>`).join('')
    : '<p class="muted" style="padding:20px">No notifications.</p>';
}

function markAllRead() {
  const user = getUser();
  const list = load(KEYS.notifs, []);
  list.forEach((n) => { if (n.user_id === user.id) n.read = true; });
  save(KEYS.notifs, list);
  renderNotifs();
  toast('All marked as read', 'success');
}

function renderProfile() {
  const u = getUser();
  document.getElementById('profile-card').innerHTML = `
    <p><strong>${u.full_name}</strong></p>
    <p class="muted">${u.email}</p>
    <p class="tiny" style="margin-top:12px"><span class="badge badge-assigned">${u.role}</span></p>
    <hr style="margin:16px 0;border:none;border-top:1px solid var(--border)" />
    <p><strong>Block:</strong> ${u.hostel_block}</p>
    <p><strong>Room:</strong> ${u.room_number}</p>
    <p><strong>Enrollment:</strong> ${u.enrollment_number}</p>
  `;
}

// ---------- Admin ----------
function showAdminView(view, linkEl) {
  document.querySelectorAll('#page-admin .dash-view').forEach((v) => v.classList.remove('active'));
  document.getElementById('view-' + view)?.classList.add('active');
  document.querySelectorAll('#page-admin .side-link').forEach((a) => a.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
  document.getElementById('admin-sidebar').classList.remove('open');

  if (view === 'a-overview') renderAdminOverview();
  if (view === 'a-complaints') renderAdminComplaints();
  if (view === 'a-mess') {
    document.getElementById('admin-mess-list').innerHTML = MENUS.map((m) =>
      `<div class="card"><h3>${m.type}</h3><p class="tiny muted">${m.time}</p><p class="tiny">${m.items.join(', ')}</p><span class="badge badge-ok">Published</span></div>`
    ).join('');
  }
  if (view === 'a-canteen') {
    document.getElementById('admin-canteen-list').innerHTML = `
      <table><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th></tr></thead>
      <tbody>${CANTEEN.map((i) => `<tr><td>${i.name}</td><td>${i.cat}</td><td>₹${i.price}</td><td>${i.avail ? statusBadge('Resolved').replace('Resolved','Available') : '<span class="badge badge-no">Unavailable</span>'}</td></tr>`).join('')}</tbody></table>`;
  }
  if (view === 'a-users') {
    document.getElementById('admin-users').innerHTML = `
      <table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
      <tbody>
        <tr><td>${DEMO_STUDENT.full_name}</td><td>${DEMO_STUDENT.email}</td><td>student</td></tr>
        <tr><td>${DEMO_ADMIN.full_name}</td><td>${DEMO_ADMIN.email}</td><td>admin</td></tr>
      </tbody></table>`;
  }
}

function renderAdmin() {
  const user = getUser();
  if (!user || user.role !== 'admin') {
    showPage('login');
    return;
  }
  document.getElementById('admin-user-name').textContent = user.full_name;
  showAdminView('a-overview', document.querySelector('#page-admin .side-link'));
}

function renderAdminOverview() {
  const all = load(KEYS.complaints, []);
  const received = all.filter((c) => c.status === 'Received').length;
  const progress = all.filter((c) => ['Assigned', 'In Progress'].includes(c.status)).length;
  const resolved = all.filter((c) => c.status === 'Resolved').length;

  document.getElementById('admin-stats').innerHTML = `
    <div class="stat-card"><div class="icon" style="background:#dbeafe">📋</div><div><b>${all.length}</b><span>Total</span></div></div>
    <div class="stat-card"><div class="icon" style="background:#f1f5f9">📥</div><div><b>${received}</b><span>Received</span></div></div>
    <div class="stat-card"><div class="icon" style="background:#fef3c7">🔄</div><div><b>${progress}</b><span>In Progress</span></div></div>
    <div class="stat-card"><div class="icon" style="background:#d1fae5">✅</div><div><b>${resolved}</b><span>Resolved</span></div></div>
  `;

  document.getElementById('admin-complaints-table').innerHTML = `
    <table><thead><tr><th>ID</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
    <tbody>${all.map((c) => `
      <tr>
        <td>${c.complaint_id}</td><td>${c.category}</td>
        <td>${priorityBadge(c.priority)}</td><td>${statusBadge(c.status)}</td>
        <td class="tiny">${new Date(c.created_at).toLocaleDateString()}</td>
      </tr>`).join('')}
    </tbody></table>`;
}

let editingId = null;

function renderAdminComplaints() {
  const all = load(KEYS.complaints, []);
  document.getElementById('admin-manage').innerHTML = `
    <table><thead><tr><th>ID</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${all.map((c) => `
      <tr>
        <td>${c.complaint_id}</td><td>${c.category}</td><td>${statusBadge(c.status)}</td>
        <td><button class="btn btn-sm btn-outline" onclick="editComplaint('${c.id}')">Manage</button></td>
      </tr>`).join('')}
    </tbody></table>`;
}

function editComplaint(id) {
  const c = load(KEYS.complaints, []).find((x) => x.id === id);
  if (!c) return;
  editingId = id;
  document.getElementById('admin-edit-panel').style.display = 'block';
  document.getElementById('edit-title').textContent = 'Update ' + c.complaint_id;
  document.getElementById('edit-status').value = c.status;
  document.getElementById('edit-assign').value = c.assigned_to || '';
  document.getElementById('edit-notes').value = c.resolution_notes || '';
}

function saveComplaintStatus() {
  if (!editingId) return;
  const list = load(KEYS.complaints, []);
  const idx = list.findIndex((c) => c.id === editingId);
  if (idx < 0) return;
  const status = document.getElementById('edit-status').value;
  list[idx].status = status;
  list[idx].assigned_to = document.getElementById('edit-assign').value.trim() || list[idx].assigned_to;
  list[idx].resolution_notes = document.getElementById('edit-notes').value.trim() || list[idx].resolution_notes;
  list[idx].updated_at = new Date().toISOString();
  save(KEYS.complaints, list);

  const notifs = load(KEYS.notifs, []);
  notifs.unshift({
    id: 'n-' + Date.now(),
    user_id: list[idx].user_id,
    title: 'Complaint Status Updated',
    message: `${list[idx].complaint_id} is now ${status}.`,
    read: false,
    at: new Date().toISOString(),
  });
  save(KEYS.notifs, notifs);

  toast('Complaint updated', 'success');
  document.getElementById('admin-edit-panel').style.display = 'none';
  editingId = null;
  renderAdminComplaints();
  renderAdminOverview();
}

// ---------- Boot ----------
initData();

// Auto-login if session exists
(function () {
  const user = getUser();
  if (user) {
    showPage(user.role === 'admin' ? 'admin' : 'dashboard');
  } else {
    showPage('landing');
  }
})();