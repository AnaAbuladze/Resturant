const categoryBox = document.querySelector(".categori-box");
const productsBox = document.querySelector(".products-box");
const applyFilterBtn = document.getElementById("applyFilter");
const spicinessSlider = document.getElementById("spiciness");
const spicinessValue = document.getElementById("spicinessValue");
const vegetarianCheckbox = document.getElementById("vegeterian");
const nutsCheckbox = document.getElementById("nuts");

window.selectedCategoryId = "all";


spicinessSlider.addEventListener("input", () => {
  const value = Number(spicinessSlider.value);
  spicinessValue.textContent = value === -1 ? "Not Chosen" : value;
});


function displayProducts(products) {
  productsBox.innerHTML = "";

  if (products.length === 0) {
    productsBox.innerHTML = `<div class="not-found"></div>`;
    return;
  }

  products.forEach(product => {
    const spiceLevel = product.spiciness || 0;
    const spiceText = spiceLevel > 0 ? `Level ${spiceLevel}` : "Not Spicy";
    const vegText = product.vegeterian ? "Veg" : "Non-Veg";
    const nutsText = product.nuts ? "Nuts" : "No Nuts";

    productsBox.innerHTML += `
      <div class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <h3 class="heading-h3">${product.name}</h3>
        <p class="price">$${product.price}</p>
        <p class="spice-level">${spiceText}</p>

        <div class="product-attributes">
          <span class="attribute">${vegText}</span>
          <span class="attribute">${nutsText}</span>
        </div>

        <div class="product-btn">
          <button class="btn btn-details">View Details</button>
          <button class="btn btn-add-cart"
            onclick="addToCart(${product.id}, ${product.price})">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  });
}

window.displayProducts = displayProducts;


fetch("https://restaurant.stepprojects.ge/api/Categories/GetAll")
  .then(res => res.json())
  .then(categories => {
    categoryBox.innerHTML =
      `<button class="btn btn-categories active" data-id="all">All</button>`;

    categories.forEach(cat => {
      categoryBox.innerHTML +=
        `<button class="btn btn-categories" data-id="${cat.id}">
          ${cat.name}
        </button>`;
    });

    initCategoryButtons();
  });


function initCategoryButtons() {
  document.querySelectorAll(".btn-categories").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-categories")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      selectedCategoryId = btn.dataset.id;
      applyFilters();
    });
  });
}

window.resetCategoryButtons = function () {
  document.querySelectorAll(".btn-categories")
    .forEach(b => b.classList.remove("active"));

  document.querySelector('.btn-categories[data-id="all"]')
    ?.classList.add("active");
};


function applyFilters() {
  const params = new URLSearchParams();

  if (selectedCategoryId !== "all")
    params.append("categoryId", selectedCategoryId);

  if (spicinessSlider.value !== "-1")
    params.append("spiciness", spicinessSlider.value);

  if (vegetarianCheckbox.checked)
    params.append("vegeterian", true);

  if (nutsCheckbox.checked)
    params.append("nuts", true);

  fetch(`https://restaurant.stepprojects.ge/api/Products/GetFiltered?${params}`)
    .then(res => res.json())
    .then(displayProducts);
}

window.applyFilters = applyFilters;


function addToCart(productId, price) {
  fetch("https://restaurant.stepprojects.ge/api/Baskets/AddToBasket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity: 1, price })
  })
  .then(() => console.log("Added:", productId));
}

window.addToCart = addToCart;


applyFilters();
applyFilterBtn.addEventListener("click", applyFilters);
