const apiBase = "https://my-kitchen-server.onrender.com";

async function searchRecipe() {
  const query = document.getElementById("searchInput").value;
  const res = await fetch(`${apiBase}/search?q=${query}`);
  const recipes = await res.json();

  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  const list = document.createElement("div");
  list.className = "recipes-list";

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <h3>${recipe.title}</h3>
      <b>רכיבים:</b>
      <table>
        <tbody>
          ${recipe.ingredients.map((ing) => `<tr><td>${ing}</td></tr>`).join("")}
        </tbody>
      </table>
      <b>הוראות:</b>
      <div class="instructions">${recipe.instructions}</div>
    `;

    const enhanceBtn = document.createElement("button");
    enhanceBtn.innerText = "שדרג עם AI";
    enhanceBtn.onclick = () => enhanceRecipe(recipe);
    enhanceBtn.className = "enhance-btn";

    const favBtn = document.createElement("button");
    favBtn.innerText = "הוסף למועדפים";
    favBtn.onclick = () => saveFavoriteForRecipe(recipe._id || recipe.recipeId);
    favBtn.className = "favorite-btn";

    const suggestionDiv = document.createElement("div");
    suggestionDiv.id = `suggestion-${recipe._id || recipe.recipeId}`;
    suggestionDiv.style.marginTop = "10px";
    suggestionDiv.style.color = "green";

    card.appendChild(enhanceBtn);
    card.appendChild(favBtn);
    card.appendChild(suggestionDiv);
    list.appendChild(card);
  });
  container.appendChild(list);
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

async function saveFavoriteForRecipe(recipeId) {
  const email = document.getElementById("emailInput").value;
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

function saveFavorite() {
  alert("השתמש בכפתור 'הוסף למועדפים' ליד כל מתכון.");
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

async function generateRecipeFromIngredients() {
  const ingredients = document.getElementById("myIngredientsInput").value;
  if (!ingredients.trim()) {
    alert("אנא הזן רכיבים");
    return;
  }
  const res = await fetch(`${apiBase}/generateRecipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients: ingredients.split(",") }),
  });
  if (!res.ok) {
    alert("שגיאה ביצירת מתכון");
    return;
  }
  const data = await res.json();
  const recipeText = data.recipe || "לא התקבל מתכון";

  // --- פירוק המחרוזת ---
  // חילוץ כותרת
  let title = "מתכון שנוצר עבורך";
  let ingredientsArr = [];
  let instructionsArr = [];
  let tipsArr = [];

  // חילוץ כותרת
  const titleMatch = recipeText.match(/שם המתכון: (.+)/);
  if (titleMatch) title = titleMatch[1].trim();

  // חילוץ רכיבים
  const ingredientsMatch = recipeText.match(/מרכיבים:\n([\s\S]*?)\n\nהוראות הכנה:/);
  if (ingredientsMatch) {
    ingredientsArr = ingredientsMatch[1]
      .split("\n")
      .map(line => line.replace(/^[-•\s]+/, "").trim())
      .filter(Boolean);
  }

  // חילוץ הוראות
  const instructionsMatch = recipeText.match(/הוראות הכנה:\n([\s\S]*?)(\n\n|$)/);
  if (instructionsMatch) {
    instructionsArr = instructionsMatch[1]
      .split(/\n\d+\. /)
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  // חילוץ טיפים/הערות (לא חובה)
  const tipsMatch = recipeText.match(/טיפים והערות:\n([\s\S]*)/);
  if (tipsMatch) {
    tipsArr = tipsMatch[1]
      .split("\n-")
      .map(line => line.replace(/^[-\s]+/, "").trim())
      .filter(Boolean);
  }

  // הצגה בדף
  const container = document.getElementById("searchResults");
  container.innerHTML = "";
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.innerHTML = `
    <h3>${title}</h3>
    <b>רכיבים:</b>
    <table><tbody>
      ${ingredientsArr.map(ing => `<tr><td>${ing}</td></tr>`).join("")}
    </tbody></table>
    <b>הוראות:</b>
    <div class="instructions">
      <ol style="padding-right:18px;">
        ${instructionsArr.map(step => `<li>${step}</li>`).join("")}
      </ol>
    </div>
    ${tipsArr.length ? `<b>טיפים והערות:</b><ul>${tipsArr.map(tip => `<li>${tip}</li>`).join("")}</ul>` : ""}
  `;
  container.appendChild(card);
}
