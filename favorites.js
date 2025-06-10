// favorites.js
const apiBase = "https://my-kitchen-server.onrender.com";

(async function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  const name = localStorage.getItem('userName') || '';
  const box = document.getElementById('favoritesBox');
  box.innerHTML = '<div style="color:#1c2d5a; font-size:1.2rem; margin-bottom:18px;">טוען מועדפים...</div>';
  try {
    const res = await fetch(apiBase + '/getFavorites', {
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
    if (!Array.isArray(data) || data.length === 0) {
      box.innerHTML = `<div style="margin:32px auto; max-width:340px; background:#f4f6fa; border-radius:18px; box-shadow:0 2px 8px #e0e6ef; padding:32px 18px; font-size:1.1rem; color:#1c2d5a;">שלום${name ? ', ' + name : ''}! אין לך מועדפים עדיין.</div>`;
      return;
    }
    let html = `<div style="margin:32px auto; max-width:700px;">
      <h3 style="color:#1c2d5a;">שלום${name ? ', ' + name : ''}! המועדפים שלך:</h3>
      <div class="recipes-list" style="display:flex; flex-wrap:wrap; gap:24px; justify-content:center;">`;
    data.forEach(fav => {
      html += `<div class="recipe-card" style="flex:0 0 320px; min-width:320px; max-width:340px; position:relative;">
        <h3 style="color:#00897b; font-size:1.3rem; margin-bottom:10px;">${fav.title || 'מתכון'}</h3>
        <b>רכיבים:</b>
        <table style="width:100%; background:#f1f8e9; border-radius:8px; overflow:hidden; margin-bottom:10px;"><tbody>
          ${(fav.ingredients||[]).map(ing => `<tr><td style='padding:7px 10px; border-bottom:1px solid #c8e6c9;'>${ing}</td></tr>`).join('')}
        </tbody></table>
        <b>הוראות:</b>
        <div class="instructions" style="background:#e3f2fd; border-radius:10px; padding:10px; margin-bottom:10px; color:#263238; font-size:1.05rem; line-height:1.7;">${fav.instructions||''}</div>
        <button class="remove-fav-btn" data-id="${fav._id||fav.recipeId}" style="background:#c00; color:#fff; border:none; border-radius:18px; padding:7px 18px; font-size:1rem; font-weight:600; margin-top:8px; cursor:pointer;">הסר ממועדפים</button>
        <div class="fav-status" style="min-height:18px; font-size:0.95rem; margin-top:4px;"></div>
      </div>`;
    });
    html += '</div></div>';
    box.innerHTML = html;
    // טיפול בכפתורי הסרה
    document.querySelectorAll('.remove-fav-btn').forEach(btn => {
      btn.onclick = async function() {
        const recipeId = btn.getAttribute('data-id');
        const statusDiv = btn.parentElement.querySelector('.fav-status');
        statusDiv.innerText = 'מסיר...';
        statusDiv.style.color = '#1c2d5a';
        try {
          const res = await fetch(apiBase + '/removeFavorite', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ recipeId })
          });
          if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
          }
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'שגיאה בהסרה');
          statusDiv.innerText = 'הוסר!';
          statusDiv.style.color = 'green';
          btn.disabled = true;
          btn.style.opacity = 0.5;
          setTimeout(() => window.location.reload(), 700);
        } catch (err) {
          statusDiv.innerText = err.message || 'שגיאה לא ידועה';
          statusDiv.style.color = '#c00';
        }
      };
    });
  } catch (err) {
    box.innerHTML = `<div style="color:#c00; font-size:1.1rem;">שגיאה בטעינת מועדפים. נסה להתחבר מחדש.</div>`;
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
  }
})(); 