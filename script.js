async function searchRecipes() {
  const query = document.getElementById("searchInput").value;
  const resultsList = document.getElementById("results");
  resultsList.innerHTML = "טוען...";

  try {
    const response = await fetch(`https://my-kitchen-server.onrender.com/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    resultsList.innerHTML = "";

    if (data.length === 0) {
      resultsList.innerHTML = "<li>לא נמצאו מתכונים</li>";
      return;
    }

    data.forEach(recipe => {
      const li = document.createElement("li");
      li.textContent = recipe.title;
      resultsList.appendChild(li);
    });
  } catch (error) {
    resultsList.innerHTML = "<li>שגיאה בחיפוש</li>";
    console.error(error);
  }
}
