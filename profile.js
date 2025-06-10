// profile.js
const apiBase = "https://my-kitchen-server.onrender.com";

(async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  let name = localStorage.getItem('userName') || '';
  let email = localStorage.getItem('userEmail') || '';
  try {
    const res = await fetch(apiBase + '/profile', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    if (res.status === 401 || res.status === 403) {
      window.location.href = 'login.html';
      return;
    }
    const data = await res.json();
    if (data.name) name = data.name;
    if (data.email) email = data.email;
  } catch (err) {
    // אם יש שגיאה, נשתמש ב-localStorage
  }
  const box = document.getElementById('profileBox');
  box.innerHTML = `
    <div style="margin:32px auto; max-width:340px; background:#f4f6fa; border-radius:18px; box-shadow:0 2px 8px #e0e6ef; padding:32px 18px;">
      <h3 style="color:#1c2d5a;">שלום, ${name || 'משתמש'}!</h3>
      <div style="color:#1976d2; font-size:1.1rem; margin-bottom:18px;">${email}</div>
      <button id="logoutBtn" style="background:#c00; color:#fff; border:none; border-radius:18px; padding:10px 28px; font-size:1.1rem; font-weight:600; cursor:pointer;">התנתק</button>
    </div>
  `;
  document.getElementById('logoutBtn').onclick = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
  };
})(); 