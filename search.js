// search.js
(function() {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || '';
  const resultsBox = document.getElementById('searchResultsBox');
  const apiBase = "https://my-kitchen-server.onrender.com";

  // חיפוש מתכונים
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.onsubmit = async function(e) {
      e.preventDefault();
      const q = document.getElementById('searchInput').value.trim();
      if (!q) return;
      resultsBox.innerHTML = '<div style="color:#1c2d5a;">טוען תוצאות...</div>';
      try {
        const res = await fetch(apiBase + '/search?q=' + encodeURIComponent(q));
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          resultsBox.innerHTML = '<div style="color:#c00;">לא נמצאו מתכונים.</div>';
          return;
        }
        renderRecipes(data);
      } catch (err) {
        resultsBox.innerHTML = '<div style="color:#c00;">שגיאה בחיפוש.</div>';
      }
    };
  }

  // יצירת מתכון לפי רכיבים
  const generateForm = document.getElementById('generateForm');
  if (generateForm) {
    generateForm.onsubmit = async function(e) {
      e.preventDefault();
      const ingredients = document.getElementById('myIngredientsInput').value.trim();
      if (!ingredients) return;
      resultsBox.innerHTML = '<div style="color:#1c2d5a;">יוצר מתכון...</div>';
      try {
        const res = await fetch(apiBase + '/generateRecipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredients: ingredients.split(',').map(x => x.trim()).filter(Boolean) })
        });
        const data = await res.json();
        if (!data.recipe) {
          resultsBox.innerHTML = '<div style="color:#c00;">לא נוצר מתכון.</div>';
          return;
        }
        // נניח ש-data.recipe הוא טקסט, נציג אותו ככרטיס
        renderRecipes([parseGeneratedRecipe(data.recipe)]);
      } catch (err) {
        resultsBox.innerHTML = '<div style="color:#c00;">שגיאה ביצירת מתכון.</div>';
      }
    };
  }

  // הצגת כרטיסי מתכון
  function renderRecipes(recipes) {
    let html = `<div class="recipes-list" style="display:flex; flex-wrap:wrap; gap:24px; justify-content:center;">`;
    recipes.forEach((r, idx) => {
      html += `<div class="recipe-card" style="flex:0 0 320px; min-width:320px; max-width:340px; position:relative;">
        <h3 style="color:#00897b; font-size:1.3rem; margin-bottom:10px;">${r.title || 'מתכון'}</h3>
        <b>רכיבים:</b>
        <table style="width:100%; background:#f1f8e9; border-radius:8px; overflow:hidden; margin-bottom:10px;"><tbody>
          ${(r.ingredients||[]).map(ing => `<tr><td style='padding:7px 10px; border-bottom:1px solid #c8e6c9;'>${ing}</td></tr>`).join('')}
        </tbody></table>
        <b>הוראות:</b>
        <div class="instructions" style="background:#e3f2fd; border-radius:10px; padding:10px; margin-bottom:10px; color:#263238; font-size:1.05rem; line-height:1.7;">${r.instructions||''}</div>
        <button class="fav-btn" data-idx="${idx}" style="background:#ffd54f; color:#a67c00; border:1px solid #ffe082; border-radius:8px; margin-top:8px; font-weight:bold; cursor:pointer;">הוסף למועדפים</button>
        <div class="fav-status" style="min-height:18px; font-size:0.95rem; margin-top:4px;"></div>
      </div>`;
    });
    html += '</div>';
    resultsBox.innerHTML = html;
    // טיפול בכפתורי מועדפים
    document.querySelectorAll('.fav-btn').forEach(btn => {
      btn.onclick = async function() {
        const idx = btn.getAttribute('data-idx');
        const recipe = recipes[idx];
        const statusDiv = btn.parentElement.querySelector('.fav-status');
        if (!token) {
          statusDiv.innerText = 'יש להתחבר כדי להוסיף למועדפים';
          statusDiv.style.color = '#c00';
          return;
        }
        statusDiv.innerText = 'מוסיף...';
        statusDiv.style.color = '#1c2d5a';
        try {
          const res = await fetch(apiBase + '/saveFavorite', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ recipeId: recipe._id || recipe.recipeId, title: recipe.title, ingredients: recipe.ingredients, instructions: recipe.instructions })
          });
          if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
          }
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'שגיאה בהוספה');
          statusDiv.innerText = 'נוסף למועדפים!';
          statusDiv.style.color = 'green';
          btn.disabled = true;
          btn.style.opacity = 0.5;
        } catch (err) {
          statusDiv.innerText = err.message || 'שגיאה לא ידועה';
          statusDiv.style.color = '#c00';
        }
      };
    });
  }

  // עיבוד טקסט מתכון שנוצר אוטומטית
  function parseGeneratedRecipe(text) {
    // חילוץ שם, רכיבים, הוראות (פשוט)
    let title = 'מתכון שנוצר';
    let ingredients = [];
    let instructions = '';
    const titleMatch = text.match(/שם המתכון[:：]*\s*"?(.+?)"?\n/);
    if (titleMatch) title = titleMatch[1].replace(/"/g, '').trim();
    const ingMatch = text.match(/\*\*רכיבים.*?\*\*([\s\S]*?)(?=\*\*הוראות|$)/);
    if (ingMatch) {
      ingredients = ingMatch[1].split('\n').map(x => x.replace(/^[-*\s]+/, '').trim()).filter(Boolean);
    }
    const instMatch = text.match(/\*\*הוראות.*?\*\*([\s\S]*)/);
    if (instMatch) instructions = instMatch[1].trim();
    return { title, ingredients, instructions };
  }
})(); 