const CART_COUNT_KEY = "cartCount";

function isLoggedIn() {
  const token = Cookies.get("token");
  return token !== undefined && token !== null && token !== "";
}

async function updateCartCount() {
  if (!isLoggedIn()) {
    hideCartCount();
    return;
  }

  try {
    const res = await fetch(
      "https://restaurant.stepprojects.ge/api/Baskets/GetAll"
    );
    const data = await res.json();

    const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem(CART_COUNT_KEY, totalItems);

    const itemNum = document.querySelector(".item-num");
    if (itemNum) {
      itemNum.textContent = totalItems;
      itemNum.style.display = totalItems > 0 ? "flex" : "none";
    }

    const itemNumMobile = document.querySelector(".item-num-mobile");
    if (itemNumMobile) {
      itemNumMobile.textContent = totalItems;
      itemNumMobile.style.display = totalItems > 0 ? "flex" : "none";
    }

  } catch (err) {
    console.error("Cart count error:", err);
    hideCartCount();
  }
}

function loadCartCountFromStorage() {
  if (!isLoggedIn()) {
    hideCartCount();
    return;
  }

  const saved = localStorage.getItem(CART_COUNT_KEY);

  const itemNum = document.querySelector(".item-num");
  if (itemNum) {
    itemNum.textContent = saved ? saved : "0";
    itemNum.style.display = "flex";
  }

  const itemNumMobile = document.querySelector(".item-num-mobile");
  if (itemNumMobile) {
    itemNumMobile.textContent = saved ? saved : "0";
    itemNumMobile.style.display = "flex";
  }
}

function hideCartCount() {
  const itemNum = document.querySelector(".item-num");
  if (itemNum) itemNum.style.display = "none";

  const itemNumMobile = document.querySelector(".item-num-mobile");
  if (itemNumMobile) itemNumMobile.style.display = "none";
  
  localStorage.setItem(CART_COUNT_KEY, "0");
}

window.addEventListener("DOMContentLoaded", () => {
  loadCartCountFromStorage();
  updateCartCount();
});