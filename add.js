// add.js
const apiBase = "https://my-kitchen-server.onrender.com";

(function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  const name = localStorage.getItem('userName') || '';
  const box = document.getElementById('addBox');
  box.innerHTML = `<div style="margin:32px auto; max-width:340px; background:#f4f6fa; border-radius:18px; box-shadow:0 2px 8px #e0e6ef; padding:32px 18px; font-size:1.2rem; color:#1c2d5a;">ברוך הבא${name ? ', ' + name : ''}! תוכל להוסיף או לייבא מתכון.</div>`;

  // טיפול בטופס הוספת מתכון
  const addForm = document.getElementById('addRecipeForm');
  const addStatus = document.createElement('div');
  addStatus.style.marginTop = '12px';
  addStatus.style.minHeight = '22px';
  addForm && addForm.appendChild(addStatus);
  if (addForm) {
    addForm.onsubmit = async function(e) {
      e.preventDefault();
      addStatus.innerText = 'שולח מתכון...';
      addStatus.style.color = '#1c2d5a';
      const title = document.getElementById('newTitle').value.trim();
      const ingredients = document.getElementById('newIngredients').value.split('\n').map(x => x.trim()).filter(Boolean);
      const instructions = document.getElementById('newInstructions').value.trim();
      try {
        const res = await fetch(apiBase + '/addRecipe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ title, ingredients, instructions })
        });
        if (res.status === 401 || res.status === 403) {
          window.location.href = 'login.html';
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'שגיאה בהוספת מתכון');
        addStatus.innerText = 'המתכון נוסף בהצלחה!';
        addStatus.style.color = 'green';
        addForm.reset();
      } catch (err) {
        addStatus.innerText = err.message || 'שגיאה לא ידועה';
        addStatus.style.color = '#c00';
      }
    };
  }

  // טיפול בייבוא מתכון
  const importBtn = document.getElementById('importBtn');
  const importInput = document.getElementById('importUrlInput');
  const importStatus = document.getElementById('importStatus');
  if (importBtn && importInput && importStatus) {
    importBtn.onclick = async function(e) {
      e.preventDefault();
      const url = importInput.value.trim();
      if (!url) {
        importStatus.innerText = 'אנא הדבק כתובת אתר';
        importStatus.style.color = '#c00';
        return;
      }
      importStatus.innerText = 'מייבא מתכון...';
      importStatus.style.color = '#1c2d5a';
      try {
        const res = await fetch(apiBase + '/importRecipeFromUrl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ url })
        });
        if (res.status === 401 || res.status === 403) {
          window.location.href = 'login.html';
          return;
        }
        const data = await res.json();
        const recipe = data.recipe || data;
        if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
          throw new Error('לא נמצא מתכון בכתובת זו');
        }
        document.getElementById('newTitle').value = recipe.title || '';
        // תמיכה גם במבנה ingredients עם sections
        let ingredientsStr = '';
        if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
          if (typeof recipe.ingredients[0] === 'object' && recipe.ingredients[0].items) {
            ingredientsStr = recipe.ingredients
              .map(section =>
                (section.section ? section.section + ':\n' : '') +
                section.items.map(item => '- ' + item).join('\n')
              )
              .join('\n');
          } else {
            ingredientsStr = recipe.ingredients.join('\n');
          }
        }
        document.getElementById('newIngredients').value = ingredientsStr;
        document.getElementById('newInstructions').value = recipe.instructions || '';
        importStatus.innerText = 'המתכון יובא בהצלחה! ניתן לערוך ולשמור.';
        importStatus.style.color = '#1c2d5a';
      } catch (err) {
        importStatus.innerText = err.message || 'שגיאה לא ידועה';
        importStatus.style.color = '#c00';
      }
    };
  }
})(); 