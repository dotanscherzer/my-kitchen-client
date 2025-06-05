const apiBase = "https://my-kitchen-server.onrender.com";

async function searchRecipe() {
  const query = document.getElementById("searchInput").value;
  const res = await fetch(`${apiBase}/search?q=${query}`);
  const recipes = await res.json();

  const container = document.getElementById("searchResults");
  const resultsArea = document.querySelector('.results-area');
  const carouselContainer = document.querySelector('.recipes-carousel-container');
  // Remove previous arrows/shadows if exist
  Array.from(carouselContainer.querySelectorAll('.carousel-arrow, .carousel-shadow')).forEach(e => e.remove());
  container.innerHTML = "";

  if (!recipes || recipes.length === 0) {
    if (resultsArea) resultsArea.classList.remove('has-results');
    return;
  }
  if (resultsArea) resultsArea.classList.add('has-results');

  const list = document.createElement("div");
  list.className = "recipes-list";

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    // collapsed by default
    // card.classList.add('collapsed');

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

    // Actions row (flex)
    const actionsRow = document.createElement("div");
    actionsRow.className = "actions-row";

    const enhanceBtn = document.createElement("button");
    enhanceBtn.innerText = "שדרג עם AI";
    enhanceBtn.onclick = () => enhanceRecipe(recipe);
    enhanceBtn.className = "enhance-btn";

    const favEmailInput = document.createElement("input");
    favEmailInput.type = "text";
    favEmailInput.id = "favEmail" + (recipe._id || recipe.recipeId);
    favEmailInput.className = "fav-email";
    favEmailInput.placeholder = "הזן אימייל למועדפים";
    const savedEmail = localStorage.getItem("favEmail");
    if (savedEmail) favEmailInput.value = savedEmail;

    const favBtn = document.createElement("button");
    favBtn.innerText = "הוסף למועדפים";
    favBtn.onclick = () => saveFavoriteForRecipe(recipe._id || recipe.recipeId);
    favBtn.className = "favorite-btn";

    actionsRow.appendChild(enhanceBtn);
    actionsRow.appendChild(favEmailInput);
    actionsRow.appendChild(favBtn);

    const suggestionDiv = document.createElement("div");
    suggestionDiv.id = `suggestion-${recipe._id || recipe.recipeId}`;
    suggestionDiv.style.marginTop = "10px";
    suggestionDiv.style.color = "green";

    card.appendChild(actionsRow);
    card.appendChild(suggestionDiv);

    // Add show more button
    const showMoreBtn = document.createElement("button");
    showMoreBtn.className = "show-more-btn";
    showMoreBtn.innerText = card.classList.contains("expanded") ? "הסתר" : "הצג עוד";
    showMoreBtn.style.display = "block";
    showMoreBtn.onclick = (e) => {
      e.stopPropagation();
      card.classList.toggle("expanded");
      showMoreBtn.innerText = card.classList.contains("expanded") ? "הסתר" : "הצג עוד";
    };
    card.appendChild(showMoreBtn);

    list.appendChild(card);
  });
  container.appendChild(list);

  // Add carousel arrows and shadows if more than 2 recipes
  if (recipes.length > 2) {
    // Left arrow
    const leftArrow = document.createElement('div');
    leftArrow.className = 'carousel-arrow left';
    leftArrow.innerHTML = '&#8592;';
    leftArrow.onclick = () => {
      list.scrollBy({ left: -360, behavior: 'smooth' });
    };
    // Right arrow
    const rightArrow = document.createElement('div');
    rightArrow.className = 'carousel-arrow right';
    rightArrow.innerHTML = '&#8594;';
    rightArrow.onclick = () => {
      list.scrollBy({ left: 360, behavior: 'smooth' });
    };
    // Shadows
    const leftShadow = document.createElement('div');
    leftShadow.className = 'carousel-shadow left';
    const rightShadow = document.createElement('div');
    rightShadow.className = 'carousel-shadow right';
    // Add to carousel container
    carouselContainer.appendChild(leftArrow);
    carouselContainer.appendChild(rightArrow);
    carouselContainer.appendChild(leftShadow);
    carouselContainer.appendChild(rightShadow);
  }
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
  const favEmailInput = document.getElementById("favEmail" + recipeId);
  let email = (favEmailInput && favEmailInput.value) ? favEmailInput.value : localStorage.getItem("favEmail");
  if (!email) {
    alert("אנא הזן אימייל (בשדה ליד כפתור 'הוסף למועדפים')");
    return;
  }
  localStorage.setItem("favEmail", email);
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
  const email = document.getElementById("favEmail").value;
  if (!email) {
    alert("אנא הזן אימייל באזור המועדפים");
    return;
  }
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

  // חילוץ שם המתכון
  let title = "מתכון שנוצר עבורך";
  const titleMatch = recipeText.match(/שם המתכון[:：]*\s*"?(.+?)"?\n/);
  if (titleMatch) title = titleMatch[1].replace(/"/g, '').trim();

  // חילוץ תיאור (לא חובה)
  let description = "";
  const descMatch = recipeText.match(/\*\*תיאור:\*\*\s*([\s\S]*?)\n\*\*/);
  if (descMatch) description = descMatch[1].trim();

  // חילוץ רכיבים (כולל תתי-רשימות, שורות ריקות, כותרות משנה, רשימה רגילה, ושורות עם '* **כותרת:** תוכן')
  let ingredientsArr = [];
  const ingredientsMatch = recipeText.match(/\*\*רכיבים(?:\s*\([^)]+\))?\s*:?\*\*([\s\S]*?)(?=\*\*(?:הוראות|טיפים|הערות|ציוד|הכנה|מספר מנות|זמן הכנה)[^*]*\*\*|$)/);
  if (ingredientsMatch) {
    const lines = ingredientsMatch[1].split('\n');
    let currentSection = null;
    let foundSection = false;
    lines.forEach(line => {
      const trimmed = line.trim();
      // פורמט: *   **כותרת:** תוכן
      const inlineSectionMatch = trimmed.match(/^\*\s+\*\*(.+?)\*\*:(.*)$/);
      if (inlineSectionMatch) {
        currentSection = { title: inlineSectionMatch[1].trim(), items: [inlineSectionMatch[2].trim()] };
        ingredientsArr.push(currentSection);
        foundSection = true;
        return;
      }
      // כותרת משנה רגילה (למשל: **בקר:**)
      const sectionMatch = trimmed.match(/^\*\*(.+?)\*\*:?$/);
      if (sectionMatch) {
        foundSection = true;
        currentSection = { title: sectionMatch[1], items: [] };
        ingredientsArr.push(currentSection);
      } else if (trimmed.startsWith('*')) {
        if (currentSection) {
          currentSection.items.push(trimmed.replace(/^(\*\s*)/, '').trim());
        } else if (foundSection) {
          ingredientsArr.push({ title: '', items: [trimmed.replace(/^(\*\s*)/, '').trim()] });
        } else {
          if (ingredientsArr.length === 0) {
            ingredientsArr.push({ title: '', items: [] });
          }
          ingredientsArr[0].items.push(trimmed.replace(/^(\*\s*)/, '').trim());
        }
      }
      // שורות ריקות פשוט מתעלמים מהן, לא מאפסים currentSection!
    });
  }

  // הצגה בטבלה
  let ingredientsTable = '';
  ingredientsArr.forEach(section => {
    if (section.title) {
      ingredientsTable += `<tr><th colspan="1" style="background:#e0f2f1;color:#00796b;">${section.title}</th></tr>`;
    }
    section.items.forEach(item => {
      ingredientsTable += `<tr><td>${item}</td></tr>`;
    });
  });

  // חילוץ הוראות (כולל תתי-קבוצות, קבוצות פנימיות, ורשימות רגילות)
  let instructionsArr = [];
  const instructionsMatch = recipeText.match(/\*\*הוראות(?: הכנה)?[:：]*\*\*([\s\S]*?)(?=\*\*(?:טיפים|הערות|ציוד|מספר מנות|זמן הכנה)[^*]*\*\*|$)/);
  if (instructionsMatch) {
    const lines = instructionsMatch[1].split('\n');
    let currentSection = null;
    lines.forEach(line => {
      const trimmed = line.trim();
      // פורמט: **כותרת:** (קבוצת הוראות)
      const sectionMatch = trimmed.match(/^\*\*(.+?)\*\*:?$/);
      if (sectionMatch) {
        currentSection = { title: sectionMatch[1], steps: [] };
        instructionsArr.push(currentSection);
      } else if (trimmed) {
        // שורה רגילה (הוראה)
        if (currentSection) {
          currentSection.steps.push(trimmed.replace(/^\*\s*/, '').trim());
        } else {
          // הוראות כלליות ללא קבוצה
          if (instructionsArr.length === 0) {
            instructionsArr.push({ title: '', steps: [] });
          }
          instructionsArr[0].steps.push(trimmed.replace(/^\*\s*/, '').trim());
        }
      }
    });
  }

  // הצגה מעוצבת של ההוראות
  let instructionsHtml = '';
  instructionsArr.forEach(section => {
    if (section.title) {
      instructionsHtml += `<b style="color:#1976d2;">${section.title}:</b>`;
    }
    instructionsHtml += `<ol style="padding-right:18px;">${section.steps.map(step => `<li>${step}</li>`).join('')}</ol>`;
  });

  // חילוץ טיפים/הערות
  let tipsArr = [];
  const tipsMatch = recipeText.match(/\*\*טיפים והערות(?: שימושיות)?[:：]*\*\*[\s\S]*?((?:\*|\d+\.|-).+?)(?=\n\*\*|\n\n|$)/);
  if (tipsMatch) {
    tipsArr = tipsMatch[1]
      .split(/\n/)
      .map(line => line.replace(/^\*+|^-+|\d+\.|\s+/g, '').trim())
      .filter(Boolean);
  }

  // חילוץ זמן הכנה
  let time = "";
  const timeMatch = recipeText.match(/זמן הכנה משוער[:：]*\s*([^\n]+)/);
  if (timeMatch) time = timeMatch[1].trim();

  // חילוץ מספר מנות
  let servings = "";
  const servingsMatch = recipeText.match(/מספר מנות[:：]*\s*([^\n]+)/);
  if (servingsMatch) servings = servingsMatch[1].trim();

  // הצגה בדף
  const container = document.getElementById("searchResults");
  const resultsArea = document.querySelector('.results-area');
  const carouselContainer = document.querySelector('.recipes-carousel-container');
  // Make sure area is visible
  if (resultsArea) resultsArea.classList.add('has-results');
  // Remove previous arrows/shadows if exist
  if (carouselContainer) Array.from(carouselContainer.querySelectorAll('.carousel-arrow, .carousel-shadow')).forEach(e => e.remove());
  container.innerHTML = "";
  // Create recipes-list wrapper for consistency
  const list = document.createElement("div");
  list.className = "recipes-list";
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.classList.remove("expanded");
  card.innerHTML = `
    <h3>${title}</h3>
    ${description ? `<div style=\"color:#1976d2; margin-bottom:10px;\">${description}</div>` : ""}
    <b>רכיבים:</b>
    <table><tbody>
      ${ingredientsTable}
    </tbody></table>
    <b>הוראות:</b>
    <div class=\"instructions\">
      ${instructionsHtml}
    </div>
    ${tipsArr.length ? `<b>טיפים והערות:</b><ul>${tipsArr.map(tip => `<li>${tip}</li>`).join("")}</ul>` : ""}
    ${time ? `<div><b>זמן הכנה:</b> ${time}</div>` : ""}
    ${servings ? `<div><b>מספר מנות:</b> ${servings}</div>` : ""}
  `;
  // Add show more button
  const showMoreBtn = document.createElement("button");
  showMoreBtn.className = "show-more-btn";
  showMoreBtn.innerText = card.classList.contains("expanded") ? "הסתר" : "הצג עוד";
  showMoreBtn.style.display = "block";
  showMoreBtn.onclick = (e) => {
    e.stopPropagation();
    card.classList.toggle("expanded");
    showMoreBtn.innerText = card.classList.contains("expanded") ? "הסתר" : "הצג עוד";
  };
  card.appendChild(showMoreBtn);
  list.appendChild(card);
  container.appendChild(list);
  // Add carousel arrows and shadows (like in searchRecipe)
  if (carouselContainer) {
    if (carouselContainer.querySelectorAll('.recipes-list .recipe-card').length > 2) {
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
      const leftShadow = document.createElement('div');
      leftShadow.className = 'carousel-shadow left';
      const rightShadow = document.createElement('div');
      rightShadow.className = 'carousel-shadow right';
      carouselContainer.appendChild(leftArrow);
      carouselContainer.appendChild(rightArrow);
      carouselContainer.appendChild(leftShadow);
      carouselContainer.appendChild(rightShadow);
    }
  }
}

async function importRecipeToForm() {
  const url = document.getElementById("importUrlInput").value.trim();
  const status = document.getElementById("importStatus");
  if (!url) {
    status.innerText = "אנא הדבק כתובת אתר";
    status.style.color = "#c00";
    return;
  }
  status.innerText = "מייבא מתכון...";
  status.style.color = "#1c2d5a";
  try {
    const res = await fetch(`${apiBase}/importRecipeFromUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error("שגיאה בייבוא מתכון");
    const data = await res.json();
    const recipe = data.recipe || data;
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error("לא נמצא מתכון בכתובת זו");
    }
    document.getElementById("newTitle").value = recipe.title || "";
    // Handle ingredients as array of sections or flat array
    let ingredientsStr = "";
    if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
      if (typeof recipe.ingredients[0] === "object" && recipe.ingredients[0].items) {
        // Sectioned format
        ingredientsStr = recipe.ingredients
          .map(section =>
            (section.section ? section.section + ":\n" : "") +
            section.items.map(item => "- " + item).join("\n")
          )
          .join("\n");
      } else {
        // Flat array
        ingredientsStr = recipe.ingredients.join(", ");
      }
    }
    document.getElementById("newIngredients").value = ingredientsStr;
    document.getElementById("newInstructions").value = recipe.instructions || "";
    status.innerText = "המתכון יובא בהצלחה! ניתן לערוך ולשמור.";
    status.style.color = "#1c2d5a";
  } catch (err) {
    status.innerText = err.message || "שגיאה לא ידועה";
    status.style.color = "#c00";
  }
}
