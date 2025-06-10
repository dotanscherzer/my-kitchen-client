// search.js
const apiBase = "https://my-kitchen-server.onrender.com";
(function() {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || '';
  const resultsBox = document.getElementById('searchResultsBox');

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
        renderRecipesCarousel(data);
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
        renderRecipesCarousel([parseGeneratedRecipe(data.recipe)]);
      } catch (err) {
        resultsBox.innerHTML = '<div style="color:#c00;">שגיאה ביצירת מתכון.</div>';
      }
    };
  }

  // קרוסלה אופקית עם כפתור הצג עוד
  function renderRecipesCarousel(recipes) {
    resultsBox.innerHTML = '';
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'recipes-carousel-container';
    const list = document.createElement('div');
    list.className = 'recipes-list';
    recipes.forEach((r, idx) => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <h3 style="color:#00897b; font-size:1.3rem; margin-bottom:10px;">${r.title || 'מתכון'}</h3>
        <b>רכיבים:</b>
        <table style="width:100%; background:#f1f8e9; border-radius:8px; overflow:hidden; margin-bottom:10px;"><tbody>
          ${(r.ingredients||[]).map(ing => `<tr><td style='padding:7px 10px; border-bottom:1px solid #c8e6c9;'>${ing}</td></tr>`).join('')}
        </tbody></table>
        <b>הוראות:</b>
        <div class="instructions" style="background:#e3f2fd; border-radius:10px; padding:10px; margin-bottom:10px; color:#263238; font-size:1.05rem; line-height:1.7;">${r.instructions||''}</div>
      `;
      // כפתור הוסף למועדפים
      const favBtn = document.createElement('button');
      favBtn.className = 'fav-btn';
      favBtn.innerText = 'הוסף למועדפים';
      favBtn.style.background = '#ffd54f';
      favBtn.style.color = '#a67c00';
      favBtn.style.border = '1px solid #ffe082';
      favBtn.style.borderRadius = '8px';
      favBtn.style.marginTop = '8px';
      favBtn.style.fontWeight = 'bold';
      favBtn.style.cursor = 'pointer';
      favBtn.onclick = async function() {
        const statusDiv = card.querySelector('.fav-status');
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
            body: JSON.stringify({ recipeId: r._id || r.recipeId, title: r.title, ingredients: r.ingredients, instructions: r.instructions })
          });
          if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
          }
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'שגיאה בהוספה');
          statusDiv.innerText = 'נוסף למועדפים!';
          statusDiv.style.color = 'green';
          favBtn.disabled = true;
          favBtn.style.opacity = 0.5;
        } catch (err) {
          statusDiv.innerText = err.message || 'שגיאה לא ידועה';
          statusDiv.style.color = '#c00';
        }
      };
      card.appendChild(favBtn);
      // פידבק הוספה
      const favStatus = document.createElement('div');
      favStatus.className = 'fav-status';
      favStatus.style.minHeight = '18px';
      favStatus.style.fontSize = '0.95rem';
      favStatus.style.marginTop = '4px';
      card.appendChild(favStatus);
      // כפתור הצג עוד
      const showMoreBtn = document.createElement('button');
      showMoreBtn.className = 'show-more-btn';
      showMoreBtn.innerText = card.classList.contains('expanded') ? 'הסתר' : 'הצג עוד';
      showMoreBtn.style.display = 'block';
      showMoreBtn.onclick = (e) => {
        e.stopPropagation();
        card.classList.toggle('expanded');
        showMoreBtn.innerText = card.classList.contains('expanded') ? 'הסתר' : 'הצג עוד';
      };
      card.appendChild(showMoreBtn);
      list.appendChild(card);
    });
    carouselContainer.appendChild(list);
    // חצים לגלילה
    if (recipes.length > 2) {
      const leftArrow = document.createElement('div');
      leftArrow.className = 'carousel-arrow left';
      leftArrow.innerHTML = '&#8592;';
      leftArrow.onclick = () => {
        list.scrollBy({ left: -360, behavior: 'smooth' });
      };
      const rightArrow = document.createElement('div');
      rightArrow.className = 'carousel-arrow right';
      rightArrow.innerHTML = '&#8594;';
      rightArrow.onclick = () => {
        list.scrollBy({ left: 360, behavior: 'smooth' });
      };
      carouselContainer.appendChild(leftArrow);
      carouselContainer.appendChild(rightArrow);
    }
    resultsBox.appendChild(carouselContainer);
  }

  // עיבוד טקסט מתכון שנוצר אוטומטית
  function parseGeneratedRecipe(text) {
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