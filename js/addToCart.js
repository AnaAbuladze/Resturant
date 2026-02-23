const ul = document.querySelector(".kalata");
const CART_COUNT_KEY = "cartCount";
const totalPriceEl = document.querySelector(".total-price .total");

function isUserLoggedIn() {
  const token = Cookies.get("token");

  console.log("Token exists:", token ? "Yes" : "No");
  
  return token !== undefined && token !== null && token !== "";
}

function promptLogin() {
  alert("გთხოვთ, გაიაროთ ავტორიზაცია ან რეგისტრაცია კალათაში დამატებისთვის!");
  
}

function checkCartAccess() {
  if (!isUserLoggedIn()) {
    if (ul) {
      ul.innerHTML = `
        <div style="text-align:center; padding:40px;">
          <p style="font-size:18px; margin-bottom:20px;">
            გთხოვთ გაიაროთ ავტორიზაცია კალათის სანახავად
          </p>
          <button onclick="window.location.href='login.html'" 
                  style="padding:10px 20px; background:#007bff; color:white; border:none; border-radius:5px; cursor:pointer;">
            შესვლა
          </button>
        </div>
      `;
    }
    
    if (totalPriceEl) {
      totalPriceEl.style.display = "none";
    }
    
    const payButton = document.querySelector(".pay-btn");
    if (payButton) {
      payButton.style.display = "none";
    }
    
    return false;
  }
  
  const payButton = document.querySelector(".pay-btn");
  if (payButton) {
    payButton.style.display = "block";
  }
  
  return true;
}

function createCartItem(item) {
  const li = document.createElement("li");
  li.style.cssText = "display:flex; gap:16px; align-items:center; margin-bottom:16px;";
  li.innerHTML = `
    <img src="${item.product.image}" width="80">
    <div class="detail-prod">
      <h3>${item.product.name}</h3>
      <h4>
        Quantity:
        <div class="quant">
          <button onclick="decrease(${item.product.id})" class="dec-inc">-</button>
          <span>${item.quantity}</span>
          <button onclick="increase(${item.product.id})" class="dec-inc">+</button>
        </div>
      </h4>
      <h4>Price: $${item.price}</h4>
      <h4>Total: $${(item.price * item.quantity).toFixed(2)}</h4>
      <button class="remove-btn" onclick="removeFromCart(${item.product.id})">Remove</button>
    </div>
  `;
  return li;
}

async function getAllBasket() {
  if (!checkCartAccess()) {
    return;
  }

  try {
    const res = await fetch("https://restaurant.stepprojects.ge/api/Baskets/GetAll");
    const data = await res.json();

    if (!ul) return;

    ul.innerHTML = "";

    if (data.length === 0) {
      ul.innerHTML = "<p>Your cart is empty.</p>";
      if (totalPriceEl) totalPriceEl.textContent = "Total price: $0.00";
      
      const payButton = document.querySelector(".pay-btn");
      if (payButton) {
        payButton.style.display = "none";
      }
      
      await updateCartCount();
      return;
    }

    const merged = {};
    data.forEach(item => {
      if (merged[item.product.id]) {
        merged[item.product.id].quantity += item.quantity;
      } else {
        merged[item.product.id] = { ...item };
      }
    });

    let totalPrice = 0;

    Object.values(merged).forEach(item => {
      ul.appendChild(createCartItem(item));
      totalPrice += item.price * item.quantity;
    });

    if (totalPriceEl) {
      totalPriceEl.textContent = `Total price: $${totalPrice.toFixed(2)}`;
      totalPriceEl.style.display = "block";
    }
    
    const payButton = document.querySelector(".pay-btn");
    if (payButton) {
      payButton.style.display = "block";
    }

    await updateCartCount();

  } catch (err) {
    console.error("Basket error:", err);
  }
}

async function addToCart(productId, price) {
  if (!isUserLoggedIn()) {
    promptLogin();
    return false;
  }

  try {
    const res = await fetch("https://restaurant.stepprojects.ge/api/Baskets/GetAll");
    
    if (!res.ok) {
      alert("შეცდომა! გთხოვთ თავიდან შეხვიდეთ სისტემაში.");
      return false;
    }
    
    const basket = await res.json();

    const existingItem = basket.find(item => item.product.id === productId);
    const quantity = existingItem ? existingItem.quantity + 1 : 1;

    if (existingItem) {
      const updateRes = await fetch("https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, price })
      });
      
      if (!updateRes.ok) {
        alert("შეცდომა! პროდუქტი ვერ დაემატა კალათაში.");
        return false;
      }
    } else {
      const addRes = await fetch("https://restaurant.stepprojects.ge/api/Baskets/AddToBasket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, price })
      });
      
      if (!addRes.ok) {
        alert("შეცდომა! პროდუქტი ვერ დაემატა კალათაში.");
        return false;
      }
    }

    await getAllBasket();
    return true;

  } catch (err) {
    console.error("AddToCart error:", err);
    alert("დაფიქსირდა შეცდომა! გთხოვთ თავიდან სცადოთ.");
    return false;
  }
}

async function increase(productId) {
  if (!isUserLoggedIn()) {
    promptLogin();
    return false;
  }

  try {
    const res = await fetch("https://restaurant.stepprojects.ge/api/Baskets/GetAll");
    
    if (!res.ok) {
      alert("შეცდომა! გთხოვთ თავიდან შეხვიდეთ სისტემაში.");
      return false;
    }
    
    const basket = await res.json();
    const item = basket.find(i => i.product.id === productId);
    if (!item) return false;

    await updateBasket(item.quantity + 1, item.price, productId);
    return true;
  } catch (err) {
    console.error(err);
    alert("შეცდომა! გთხოვთ თავიდან სცადოთ.");
    return false;
  }
}

async function decrease(productId) {
  if (!isUserLoggedIn()) {
    promptLogin();
    return false;
  }

  try {
    const res = await fetch("https://restaurant.stepprojects.ge/api/Baskets/GetAll");
    
    if (!res.ok) {
      alert("შეცდომა! გთხოვთ თავიდან შეხვიდეთ სისტემაში.");
      return false;
    }
    
    const basket = await res.json();
    const item = basket.find(i => i.product.id === productId);
    if (!item) return false;

    if (item.quantity <= 1) {
      await removeFromCart(productId);
    } else {
      await updateBasket(item.quantity - 1, item.price, productId);
    }
    return true;
  } catch (err) {
    console.error(err);
    alert("შეცდომა! გთხოვთ თავიდან სცადოთ.");
    return false;
  }
}

async function updateBasket(quantity, price, productId) {
  if (!isUserLoggedIn()) {
    promptLogin();
    return false;
  }
  
  try {
    const res = await fetch("https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity, price, productId })
    });
    
    if (!res.ok) {
      alert("შეცდომა განახლებისას!");
      return false;
    }
    
    await getAllBasket();
    return true;
  } catch (err) {
    console.error("UpdateBasket error:", err);
    alert("შეცდომა! გთხოვთ თავიდან სცადოთ.");
    return false;
  }
}

async function removeFromCart(productId) {
 
  if (!isUserLoggedIn()) {
    promptLogin();
    return false;
  }

  try {
    const res = await fetch(`https://restaurant.stepprojects.ge/api/Baskets/DeleteProduct/${productId}`, {
      method: "DELETE",
      headers: { accept: "*/*" }
    });
    
    if (!res.ok) {
      alert("შეცდომა წაშლისას!");
      return false;
    }
    
    await getAllBasket();
    return true;
  } catch (err) {
    console.error("RemoveFromCart error:", err);
    alert("შეცდომა! გთხოვთ თავიდან სცადოთ.");
    return false;
  }
}

async function handlePayment() {

  if (!isUserLoggedIn()) {
    promptLogin();
    return false;
  }
  
  try {
    const res = await fetch("https://restaurant.stepprojects.ge/api/Baskets/GetAll");
    
    if (!res.ok) {
      alert("შეცდომა! გთხოვთ თავიდან შეხვიდეთ სისტემაში.");
      return false;
    }
    
    const basket = await res.json();
    
    if (basket.length === 0) {
      alert("თქვენი კალათა ცარიელია!");
      return false;
    }
    
  
    const merged = {};
    basket.forEach(item => {
      if (merged[item.product.id]) {
        merged[item.product.id].quantity += item.quantity;
      } else {
        merged[item.product.id] = { ...item };
      }
    });
    
    const totalPrice = Object.values(merged).reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    const confirmed = confirm(`გსურთ გადახდა? ჯამი: $${totalPrice.toFixed(2)}`);
    
    if (confirmed) {
      alert("გადახდა წარმატებით განხორციელდა! 🎉");
    
      for (const item of Object.values(merged)) {
        await fetch(`https://restaurant.stepprojects.ge/api/Baskets/DeleteProduct/${item.product.id}`, {
          method: "DELETE",
          headers: { accept: "*/*" }
        });
      }
      
      await getAllBasket();
      return true;
    }
    
    return false;
    
  } catch (err) {
    console.error("Payment error:", err);
    alert("გადახდის დროს მოხდა შეცდომა. სცადეთ თავიდან.");
    return false;
  }
}

async function updateCartCount() {
  if (!isUserLoggedIn()) {
    const counters = document.querySelectorAll(".item-num");
    counters.forEach(el => el.textContent = "0");
    return;
  }

  try {
    const res = await fetch("https://restaurant.stepprojects.ge/api/Baskets/GetAll");
    
    if (!res.ok) {
      const counters = document.querySelectorAll(".item-num");
      counters.forEach(el => el.textContent = "0");
      return;
    }
    
    const basket = await res.json();

    const merged = {};
    basket.forEach(item => {
      if (merged[item.product.id]) {
        merged[item.product.id].quantity += item.quantity;
      } else {
        merged[item.product.id] = { ...item };
      }
    });

    const totalItems = Object.values(merged).reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem(CART_COUNT_KEY, totalItems);

    const counters = document.querySelectorAll(".item-num");
    counters.forEach(el => el.textContent = totalItems);

  } catch (err) {
    console.error("Cart count error:", err);
    const counters = document.querySelectorAll(".item-num");
    counters.forEach(el => el.textContent = "0");
  }
}

function loadCartCountFromStorage() {
  if (!isUserLoggedIn()) {
    const counters = document.querySelectorAll(".item-num");
    counters.forEach(el => el.textContent = "0");
    return;
  }

  const saved = localStorage.getItem(CART_COUNT_KEY) || "0";
  const counters = document.querySelectorAll(".item-num");
  counters.forEach(el => el.textContent = saved);
}

window.addEventListener("DOMContentLoaded", () => {
  loadCartCountFromStorage();
  getAllBasket();
});

window.addToCart = addToCart;
window.increase = increase;
window.decrease = decrease;
window.removeFromCart = removeFromCart;
window.handlePayment = handlePayment;