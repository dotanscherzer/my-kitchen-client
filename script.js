const API_BASE = 'https://my-kitchen-server.onrender.com';

function searchRecipes() {
  const query = document.getElementById('searchInput').value;
  fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      const div = document.getElementById('searchResults');
      div.innerHTML = '';
      data.forEach(recipe => {
        const html = `
          <h3>${recipe.title}</h3>
          <p><b>רכיבים:</b> ${recipe.ingredients.join(', ')}</p>
          <p><b>הוראות:</b> ${recipe.instructions}</p>
          <button onclick="saveFavorite('${recipe._id}')">הוסף למועדפים</button>
          <hr/>
        `;
        div.innerHTML += html;
      });
    });
}

function addRecipe() {
  const title = document.getElementById('newTitle').value;
  const ingredients = document.getElementById('newIngredients').value.split(',');
  const instructions = document.getElementById('newInstructions').value;

  fetch(`${API_BASE}/addRecipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, ingredients, instructions })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('addStatus').innerText = data.message;
  });
}

function saveFavorite(recipeId) {
  const userEmail = document.getElementById('emailInput').value;
  if (!userEmail) {
    alert('אנא הזן כתובת אימייל לפני שמירה למועדפים');
    return;
  }

  fetch(`${API_BASE}/saveFavorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail, recipeId })
  })
  .then(res => res.json())
  .then(data => alert(data.message));
}

function loadFavorites() {
  const email = document.getElementById('emailInput').value;
  fetch(`${API_BASE}/getFavorites?email=${encodeURIComponent(email)}`)
    .then(res => res.json())
    .then(data => {
      const div = document.getElementById('favoritesList');
      div.innerHTML = '';
      data.forEach(recipe => {
        div.innerHTML += `<h3>${recipe.title}</h3><p>${recipe.instructions}</p><hr/>`;
      });
    });
}
