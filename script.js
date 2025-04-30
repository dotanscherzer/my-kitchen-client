const apiBase = "https://my-kitchen-server.onrender.com";

async function searchRecipe() {
  const query = document.getElementById("searchInput").value;
  const res = await fetch(`${apiBase}/search?q=${query}`);
  const recipes = await res.json();

  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.innerHTML = `
      <h3>${recipe.title}</h3>
      <b>רכיבים:</b> ${recipe.ingredients.join(", ")}<br>
      <b>הוראות:</b> ${recipe.instructions}<br>
    `;

    const enhanceBtn = document.createElement("button");
    enhanceBtn.innerText = "שדרג עם AI";
    enhanceBtn.onclick = () => enhanceRecipe(recipe);

    const suggestionDiv = document.createElement("div");
    suggestionDiv.id = `suggestion-${recipe._id || recipe.recipeId}`;
    suggestionDiv.style.marginTop = "10px";
    suggestionDiv.style.color = "green";

    card.appendChild(enhanceBtn);
    card.appendChild(suggestionDiv);
    container.appendChild(card);
  });
}

async function addRecipe() {
  const title = document.getElementById("newTitle").value;
  const ingredients = document
    .getElementById("newIngredients")
    .value.split(",");
  const instructions = document.getElementById("newInstructions").value;

  const res = await fetch(`${apiBase}/addRecipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, ingredients, instructions }),
  });

  if (res.ok) {
    alert("המתכון נוסף בהצלחה!");
  } else {
    alert("שגיאה בהוספת מתכון.");
  }
}

async function saveFavorite() {
  const email = document.getElementById("emailInput").value;
  const recipeId = document.getElementById("searchResults").querySelector("h3")
    ? document.getElementById("searchResults").querySelector("h3").nextSibling
        .nextSibling.textContent
    : null;

  if (!email || !recipeId) {
    alert("אנא הזן אימייל וודא שיש תוצאה לחיפוש");
    return;
  }

  const res = await fetch(`${apiBase}/saveFavorite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userEmail: email, recipeId }),
  });

  if (res.ok) {
    alert("נשמר בהצלחה");
  } else {
    alert("שגיאה בשמירה");
  }
}

async function loadFavorites() {
  const email = document.getElementById("emailInput").value;
  const res = await fetch(`${apiBase}/getFavorites?email=${email}`);
  const favorites = await res.json();

  const container = document.getElementById("favorites");
  container.innerHTML = "";

  favorites.forEach((f) => {
    const div = document.createElement("div");
    div.innerText = `מתכון: ${f.recipeId}`;
    container.appendChild(div);
  });
}

async function enhanceRecipe(recipe) {
  const divId = `suggestion-${recipe._id || recipe.recipeId}`;
  const suggestionDiv = document.getElementById(divId);
  suggestionDiv.innerText = "ממתין להצעת שדרוג...";

  try {
    const res = await fetch(`${apiBase}/enhanceRecipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipe),
    });

    const data = await res.json();
    suggestionDiv.innerText = data.suggestion || "לא התקבלה הצעה";
  } catch (err) {
    console.error(err);
    suggestionDiv.innerText = "שגיאה בשדרוג המתכון";
  }
}
