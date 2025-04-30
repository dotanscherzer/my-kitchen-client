const API_URL = 'https://my-kitchen-server.onrender.com';

async function searchRecipes() {
  const query = document.getElementById("searchInput").value;
  const resultsList = document.getElementById("results");
  resultsList.innerHTML = "טוען...";

  try {
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    resultsList.innerHTML = "";
    if (data.length === 0) {
      resultsList.innerHTML = "<li>לא נמצאו מתכונים</li>";
      return;
    }

    data.forEach(recipe => {
      const li = document.createElement("li");
      li.innerText = recipe.title;
      const favBtn = document.createElement("button");
      favBtn.innerText = "הוסף למועדפים";
      favBtn.onclick = () => saveFavorite(recipe._id);
      li.appendChild(favBtn);
      resultsList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    resultsList.innerHTML = "<li>שגיאה</li>";
  }
}

async function saveFavorite(recipeId) {
  const email = document.getElementById("email").value;
  if (!email) return alert("נא להזין אימייל לפני שמירה למועדפים");

  try {
    const res = await fetch(`${API_URL}/saveFavorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: email, recipeId })
    });
    const result = await res.json();
    alert(result.message);
  } catch (err) {
    console.error(err);
    alert("שגיאה בשמירה למועדפים");
  }
}

async function addRecipe() {
  const title = document.getElementById("newTitle").value;
  const ingredients = document.getElementById("newIngredients").value.split(',');
  const instructions = document.getElementById("newInstructions").value;

  const status = document.getElementById("addStatus");

  try {
    const res = await fetch(`${API_URL}/addRecipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, ingredients, instructions })
    });
    const result = await res.json();
    status.innerText = result.message;
  } catch (err) {
    console.error(err);
    status.innerText = "שגיאה בהוספת מתכון";
  }
}

async function loadFavorites() {
  const email = document.getElementById("email").value;
  if (!email) return alert("נא להזין אימייל");

  try {
    const res = await fetch(`${API_URL}/getFavorites?email=${email}`);
    const data = await res.json();

    const list = document.getElementById("favoritesList");
    list.innerHTML = "";

    if (data.length === 0) {
      list.innerHTML = "<li>אין מועדפים</li>";
    } else {
      data.forEach(fav => {
        const li = document.createElement("li");
        li.innerText = `ID מתכון: ${fav.recipeId}`;
        list.appendChild(li);
      });
    }
  } catch (err) {
    console.error(err);
    alert("שגיאה בטעינת מועדפים");
  }
}
