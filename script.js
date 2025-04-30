const apiBase = 'https://my-kitchen-server.onrender.com';

document.getElementById('searchBtn').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  const response = await fetch(`${apiBase}/search?query=${query}`);
  const results = await response.json();

  if (results.length === 0) {
    resultsDiv.innerHTML = '<p>לא נמצאו מתכונים</p>';
    return;
  }

  results.forEach(recipe => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${recipe.title}</h3>
      <p><strong>רכיבים:</strong> ${recipe.ingredients.join(', ')}</p>
      <p><strong>הוראות:</strong> ${recipe.instructions}</p>
    `;
    resultsDiv.appendChild(div);
  });
});

document.getElementById('addBtn').addEventListener('click', async () => {
  const title = document.getElementById('newTitle').value;
  const ingredients = document.getElementById('newIngredients').value.split(',');
  const instructions = document.getElementById('newInstructions').value;

  const res = await fetch(`${apiBase}/addRecipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, ingredients, instructions })
  });

  const data = await res.json();
  alert(data.message);
});

document.getElementById('saveFavoriteBtn').addEventListener('click', async () => {
  const userEmail = document.getElementById('email').value;
  const title = document.getElementById('searchInput').value;

  if (!userEmail) {
    alert('אנא הכנס כתובת מייל לפני שמירה');
    return;
  }

  const searchRes = await fetch(`${apiBase}/search?query=${title}`);
  const recipes = await searchRes.json();

  if (!recipes.length) return alert('לא נמצא מתכון לשמירה');

  const recipeId = recipes[0]._id;

  const res = await fetch(`${apiBase}/saveFavorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail, recipeId })
  });

  const data = await res.json();
  alert(data.message);
});

document.getElementById('loadFavoritesBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const favDiv = document.getElementById('favorites');
  favDiv.innerHTML = '';

  const favRes = await fetch(`${apiBase}/getFavorites?email=${email}`);
  const favorites = await favRes.json();

  for (let fav of favorites) {
    const res = await fetch(`${apiBase}/recipeById/${fav.recipeId}`);
    const recipe = await res.json();

    const div = document.createElement('div');
    div.innerHTML = `
      <h4>${recipe.title}</h4>
      <p><strong>רכיבים:</strong> ${recipe.ingredients.join(', ')}</p>
      <p><strong>הוראות:</strong> ${recipe.instructions}</p>
    `;
    favDiv.appendChild(div);
  }
});
