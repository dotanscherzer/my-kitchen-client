// login.js
const apiBase = ""; // השאר ריק אם ה-API על אותו דומיין, אחרת כתוב כאן את כתובת השרת

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginStatus = document.getElementById('loginStatus');

if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    loginStatus.innerText = "מתחבר...";
    loginStatus.style.color = "#1c2d5a";
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    try {
      const res = await fetch(apiBase + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || 'שגיאה בהתחברות');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name || '');
      localStorage.setItem('userEmail', data.email || '');
      loginStatus.innerText = "התחברת בהצלחה!";
      loginStatus.style.color = "green";
      setTimeout(() => { window.location.href = 'profile.html'; }, 800);
    } catch (err) {
      loginStatus.innerText = err.message || 'שגיאה לא ידועה';
      loginStatus.style.color = "#c00";
    }
  };
}

if (registerForm) {
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    loginStatus.innerText = "נרשם...";
    loginStatus.style.color = "#1c2d5a";
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    try {
      const res = await fetch(apiBase + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || 'שגיאה בהרשמה');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name || '');
      localStorage.setItem('userEmail', data.email || '');
      loginStatus.innerText = "נרשמת בהצלחה!";
      loginStatus.style.color = "green";
      setTimeout(() => { window.location.href = 'profile.html'; }, 800);
    } catch (err) {
      loginStatus.innerText = err.message || 'שגיאה לא ידועה';
      loginStatus.style.color = "#c00";
    }
  };
}

// Google Sign-In callback
window.handleGoogleLogin = async function(response) {
  loginStatus.innerText = "מתחבר עם גוגל...";
  loginStatus.style.color = "#1c2d5a";
  try {
    // שלח את ה-id_token לשרת שלך
    const res = await fetch(apiBase + '/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: response.credential })
    });
    const data = await res.json();
    if (!res.ok || !data.token) throw new Error(data.error || 'שגיאה בהתחברות עם גוגל');
    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.name || '');
    localStorage.setItem('userEmail', data.email || '');
    loginStatus.innerText = "התחברת בהצלחה!";
    loginStatus.style.color = "green";
    setTimeout(() => { window.location.href = 'profile.html'; }, 800);
  } catch (err) {
    loginStatus.innerText = err.message || 'שגיאה לא ידועה';
    loginStatus.style.color = "#c00";
  }
}; 