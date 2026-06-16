// ─── STATE ENGINE ────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  users: {
    owner: { id: "owner", role: "owner", name: "ZeRo LT", username: "zerolt_owner", password: "zerolt2024", avatar: "👑", email: "owner@zerolt.gg", phone: "+91 9876543210", joined: "2023-01-01" },
    admin1: { id: "admin1", role: "admin", name: "Phantom X", username: "phantom_x", password: "admin123", avatar: "⚡", email: "phantom@zerolt.gg", phone: "+91 9123456789", joined: "2023-03-15" },
  },
  scrims: [
    { id: "s1", title: "BGMI Weekly Clash #47", date: "2026-06-20", time: "19:00", map: "Erangel", mode: "Squad", slots: 25, maxSlots: 25, prize: "₹5,000", status: "upcoming", entryFee: "₹50", roomId: "", roomPass: "", registrations: [] },
    { id: "s2", title: "BGMI Pro Showdown #12", date: "2026-06-22", time: "20:00", map: "Miramar", mode: "Squad", slots: 20, maxSlots: 25, prize: "₹10,000", status: "upcoming", entryFee: "₹100", roomId: "", roomPass: "", registrations: [] },
    { id: "s3", title: "BGMI Vikendi Cup #5", date: "2026-06-18", time: "18:00", map: "Vikendi", mode: "Squad", slots: 25, maxSlots: 25, prize: "₹3,000", status: "live", entryFee: "VIK2026", roomPass: "ZRT888", registrations: [] },
  ],
  leaderboard: [
    { rank: 1, team: "ALPHA WOLVES", logo: "🐺", kills: 187, points: 2340, matches: 12 },
    { rank: 2, team: "THUNDER STRIKE", logo: "⚡", kills: 162, points: 2180, matches: 12 },
    { rank: 3, team: "SHADOW OPS", logo: "🥷", kills: 154, points: 2050, matches: 12 }
  ],
  registrations: []
};

let db = JSON.parse(localStorage.getItem("zerolt_db")) || INITIAL_STATE;
let session = JSON.parse(localStorage.getItem("zerolt_session")) || null;
let currentTab = "home"; 
let currentAdminTab = "scrims"; 
let loginPortalTab = "player"; // player, admin, owner

function saveDB() { localStorage.setItem("zerolt_db", JSON.stringify(db)); }
function saveSession() { localStorage.setItem("zerolt_session", JSON.stringify(session)); }

// ─── ROUTING & VIEW CONTROLLER ────────────────────────────────────────────────
function initApp() {
  renderNavbar();
  navigate(currentTab);
}

function navigate(tab) {
  currentTab = tab;
  renderNavbar();
  
  const main = document.getElementById("main-content");
  if (tab === "home") renderHome(main);
  else if (tab === "scrims") renderScrimsPage(main);
  else if (tab === "leaderboard") renderLeaderboardPage(main);
  else if (tab === "admin") renderAdminPage(main);
  else if (tab === "login") renderLoginPage(main);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function renderNavbar() {
  const nav = document.querySelector(".navbar");
  let actionBtn = `<button class="btn btn-gold btn-sm" onclick="navigate('login')">PORTAL LOGIN</button>`;
  
  if (session) {
    actionBtn = `
      <div style="display:flex; align-items:center; gap:12px;">
        ${session.role !== 'player' ? `<button class="btn btn-outline btn-sm" onclick="navigate('admin')">DASHBOARD</button>` : ''}
        <div class="profile-btn" onclick="logout()">
          <div class="profile-avatar">${session.avatar || '👤'}</div>
          <span>LOGOUT</span>
        </div>
      </div>`;
  }

  nav.innerHTML = `
    <div class="nav-logo" onclick="navigate('home')">
      <div class="fallback-logo">👑</div>
      <div class="nav-logo-text"><span>ZERO</span><span>LT</span></div>
    </div>
    <div class="nav-links">
      <button class="nav-link ${currentTab==='home'?'active':''}" onclick="navigate('home')">HOME</button>
      <button class="nav-link ${currentTab==='scrims'?'active':''}" onclick="navigate('scrims')">SCRIMS</button>
      <button class="nav-link ${currentTab==='leaderboard'?'active':''}" onclick="navigate('leaderboard')">STANDINGS</button>
    </div>
    <div>${actionBtn}</div>
  `;
}

function renderHome(container) {
  container.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <div class="hero-tag"><span class="live-dot"></span> NEXT-GEN BGMI PLATFORM</div>
        <h1 class="hero-title"><span class="z">ZeRo</span> <span class="e">LT</span> <span class="rest">ESPORTS</span></h1>
        <p class="hero-sub">Join daily competitive scrims, track automated season leaderboards, and claim victory rewards instantly.</p>
        <div class="hero-stats">
          <div class="hero-stat"><div class="hero-stat-num">${db.scrims.length}</div><div class="hero-stat-label">Active Scrims</div></div>
          <div class="hero-stat"><div class="hero-stat-num">₹25K+</div><div class="hero-stat-label">Weekly Pools</div></div>
        </div>
        <div class="hero-cta">
          <button class="btn btn-gold btn-lg" onclick="navigate('scrims')">VIEW LIVE SCRIMS</button>
          <button class="btn btn-outline btn-lg" onclick="navigate('leaderboard')">LEADERBOARD</button>
        </div>
      </div>
    </section>
  `;
}

function renderScrimsPage(container) {
  let cardsHtml = db.scrims.map(s => {
    const progress = ((s.maxSlots - s.slots) / s.maxSlots) * 100;
    const isLive = s.status === 'live';
    return `
      <div class="scrim-card">
        <div class="scrim-top">
          <span class="scrim-status ${isLive?'status-live':'status-upcoming'}">${s.status.toUpperCase()}</span>
          <h3 class="scrim-title">${s.title}</h3>
          <div class="scrim-meta">
            <div class="scrim-tag">📅 ${s.date}</div>
            <div class="scrim-tag">⏰ ${s.time} IST</div>
            <div class="scrim-tag">🗺️ ${s.map}</div>
          </div>
          <div class="scrim-prize">${s.prize} <span style="font-size:12px;color:var(--muted)">PRIZE POOL</span></div>
        </div>
        <div class="scrim-bottom">
          <div class="slots-bar">
            <div class="slots-label">
              <span>Slots Filled</span>
              <span style="font-weight:700;color:var(--gold)">${s.maxSlots - s.slots}/${s.maxSlots}</span>
            </div>
            <div class="slots-track"><div class="slots-fill" style="width: ${progress}%"></div></div>
          </div>
          <button class="btn ${s.slots === 0 ? 'btn-outline' : 'btn-red'} btn-sm" ${s.slots === 0 ? 'disabled' : ''} onclick="openRegisterModal('${s.id}')">
            ${s.slots === 0 ? 'FULL' : 'REGISTER'}
          </button>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">AVAILABLE <span>SCRIMS</span></h2>
          <p class="section-sub">Register your squad before slots run out.</p>
        </div>
      </div>
      <div class="scrims-grid">${cardsHtml}</div>
    </div>`;
}

function renderLeaderboardPage(container) {
  let rows = db.leaderboard.map(team => `
    <tr>
      <td class="lb-rank rank-${team.rank}">#${team.rank}</td>
      <td class="team-name">${team.logo} ${team.team}</td>
      <td>${team.matches}</td>
      <td>${team.kills}</td>
      <td><span class="points-chip">${team.points}</span></td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">SEASON <span>STANDINGS</span></h2>
          <p class="section-sub">Live ranking leaderboard updated based on custom scrim performance metrics.</p>
        </div>
      </div>
      <div class="card">
        <table class="lb-table">
          <thead>
            <tr><th>Rank</th><th>Team Clan</th><th>Matches</th><th>Finishes</th><th>Total Points</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

// ─── PORTAL LOGIN ENGINE ─────────────────────────────────────────────────────
function renderLoginPage(container) {
  container.innerHTML = `
    <div class="login-wrap">
      <div class="login-box">
        <div class="login-card">
          <div class="login-tabs">
            <div class="login-tab ${loginPortalTab==='player'?'active':''}" onclick="setLoginTab('player')">PLAYER</div>
            <div class="login-tab ${loginPortalTab==='admin'?'active':''}" onclick="setLoginTab('admin')">ADMIN</div>
            <div class="login-tab ${loginPortalTab==='owner'?'active':''}" onclick="setLoginTab('owner')">OWNER</div>
          </div>
          <h3 class="login-title orbitron">${loginPortalTab.toUpperCase()} PORTAL</h3>
          <p class="login-sub" style="margin-bottom:20px;">Access management console endpoints securely.</p>
          <form onsubmit="handleLogin(event)">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" id="login-user" class="form-input" required placeholder="Enter system login ID">
            </div>
            <div class="form-group" style="margin-bottom:24px;">
              <label class="form-label">Security Key / Password</label>
              <input type="password" id="login-pass" class="form-input" required placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-gold" style="width:100%; justify-content:center;">AUTHENTICATE</button>
          </form>
        </div>
      </div>
    </div>`;
}

function setLoginTab(target) {
  loginPortalTab = target;
  renderLoginPage(document.getElementById("main-content"));
}

function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById("login-user").value;
  const p = document.getElementById("login-pass").value;

  if (loginPortalTab === 'player') {
    session = { id: "p_" + Date.now(), role: "player", name: u, username: u, avatar: "🎮" };
    saveSession();
    navigate('home');
    return;
  }

  const matchUser = Object.values(db.users).find(x => x.username === u && x.password === p && x.role === loginPortalTab);
  if (matchUser) {
    session = matchUser;
    saveSession();
    navigate('admin');
  } else {
    alert("Invalid credentials for chosen access terminal level.");
  }
}

function logout() {
  session = null;
  localStorage.removeItem("zerolt_session");
  navigate('home');
}

// ─── ADMIN SYSTEM OPERATIONS ─────────────────────────────────────────────────
function renderAdminPage(container) {
  if (!session || session.role === 'player') { navigate('home'); return; }

  let activeViewHtml = '';
  if (currentAdminTab === 'scrims') {
    let listRows = db.scrims.map(s => `
      <tr>
        <td class="orbitron" style="font-weight:700;">${s.title}</td>
        <td>${s.map}</td>
        <td>${s.slots}/${s.maxSlots}</td>
        <td><span class="badge badge-gold">${s.status}</span></td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteScrim('${s.id}')">REMOVE</button></td>
      </tr>`).join('');

    activeViewHtml = `
      <div class="flex-between" style="margin-bottom:24px;">
        <h3 class="orbitron">MATCH MANAGER</h3>
        <button class="btn btn-gold btn-sm" onclick="openCreateScrimModal()">+ CREATE NEW SCRIM</button>
      </div>
      <div class="card">
        <table class="lb-table">
          <thead><tr><th>Scrim Event Title</th><th>Map</th><th>Remaining Slots</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${listRows}</tbody>
        </table>
      </div>`;
  } else if (currentAdminTab === 'overview') {
    activeViewHtml = `
      <h3 class="orbitron" style="margin-bottom:24px;">TERMINAL MONITOR OVERVIEW</h3>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-num">${db.scrims.length}</div><div class="stat-label">Total Tournaments</div></div>
        <div class="stat-card"><div class="stat-num">${Object.keys(db.users).length}</div><div class="stat-label">Staff Personnel</div></div>
      </div>`;
  }

  container.innerHTML = `
    <div class="admin-grid">
      <div class="admin-sidebar">
        <div class="admin-section-label">SYSTEM TERMINAL</div>
        <div class="admin-link ${currentAdminTab==='overview'?'active':''}" onclick="setAdminTab('overview')">Monitor Console</div>
        <div class="admin-link ${currentAdminTab==='scrims'?'active':''}" onclick="setAdminTab('scrims')">Match Management</div>
        <div class="admin-link" onclick="navigate('home')">← Exit Dashboard</div>
      </div>
      <div class="admin-content">${activeViewHtml}</div>
    </div>`;
}

function setAdminTab(t) {
  currentAdminTab = t;
  renderAdminPage(document.getElementById("main-content"));
}

function deleteScrim(id) {
  db.scrims = db.scrims.filter(s => s.id !== id);
  saveDB();
  renderAdminPage(document.getElementById("main-content"));
}

// ─── MODAL CONTROLLERS ───────────────────────────────────────────────────────
function openRegisterModal(scrimId) {
  const scrim = db.scrims.find(s => s.id === scrimId);
  const modalContainer = document.getElementById("modal-container");
  
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">SQUAD REGISTRATION</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <p style="color:var(--muted); margin-bottom:16px;">Registering for: <strong>${scrim.title}</strong></p>
          <form onsubmit="handleRegisterSquad(event, '${scrimId}')">
            <div class="form-group">
              <label class="form-label">Team / Clan Name</label>
              <input type="text" id="reg-team" class="form-input" required placeholder="e.g. ALPHA SQUAD">
            </div>
            <div class="form-group">
              <label class="form-label">Team Leader Name</label>
              <input type="text" id="reg-leader" class="form-input" required placeholder="In-game Name">
            </div>
            <div class="form-group">
              <label class="form-label">Contact Mobile / Discord</label>
              <input type="text" id="reg-contact" class="form-input" required placeholder="+91 xxxxxxxxxx">
            </div>
            <button type="submit" class="btn btn-red" style="width:100%; justify-content:center; margin-top:12px;">CONFIRM SLOT</button>
          </form>
        </div>
      </div>
    </div>`;
}

function handleRegisterSquad(e, scrimId) {
  e.preventDefault();
  const scrim = db.scrims.find(s => s.id === scrimId);
  if (scrim && scrim.slots > 0) {
    scrim.slots -= 1;
    saveDB();
    alert(`Slot booked successfully for ${document.getElementById("reg-team").value}!`);
    closeModal();
    if(currentTab === 'scrims') navigate('scrims');
  }
}

function openCreateScrimModal() {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">CREATE SCRIM EVENT</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="handleCreateScrim(event)">
            <div class="form-group">
              <label class="form-label">Scrim Title</label>
              <input type="text" id="cs-title" class="form-input" required placeholder="BGMI Pro Clash">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Map</label>
                <input type="text" id="cs-map" class="form-input" required placeholder="Erangel">
              </div>
              <div class="form-group">
                <label class="form-label">Max Slots</label>
                <input type="number" id="cs-slots" class="form-input" required value="25">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" id="cs-date" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">Time</label>
                <input type="time" id="cs-time" class="form-input" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Prize Pool</label>
              <input type="text" id="cs-prize" class="form-input" required placeholder="₹5,000">
            </div>
            <button type="submit" class="btn btn-gold" style="width:100%; justify-content:center;">LAUNCH MATCH</button>
          </form>
        </div>
      </div>
    </div>`;
}

function handleCreateScrim(e) {
  e.preventDefault();
  const maxSlots = parseInt(document.getElementById("cs-slots").value);
  const newScrim = {
    id: "s_" + Date.now(),
    title: document.getElementById("cs-title").value,
    date: document.getElementById("cs-date").value,
    time: document.getElementById("cs-time").value,
    map: document.getElementById("cs-map").value,
    slots: maxSlots,
    maxSlots: maxSlots,
    prize: document.getElementById("cs-prize").value,
    status: "upcoming"
  };

  db.scrims.push(newScrim);
  saveDB();
  closeModal();
  renderAdminPage(document.getElementById("main-content"));
}

function closeModal() {
  document.getElementById("modal-container").innerHTML = "";
}

// Run Startup System
window.onload = initApp;
