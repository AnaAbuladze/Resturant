document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }

  updateUserProfile();
});

async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const sms = document.getElementById("loginSms");

  sms.innerText = "";
  sms.style.color = "black";

  if (!email || !password) {
    sms.innerText = "Please fill in all fields";
    sms.style.color = "red";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    sms.innerText = "Invalid email format";
    sms.style.color = "red";
    return;
  }

  try {
    sms.innerText = "Logging in...";

    const response = await fetch("https://api.everrest.educata.dev/auth/sign_in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log("LOGIN RESPONSE:", data);

    if (!response.ok) {
      if (response.status === 401) {
        sms.innerText = "Incorrect email or password";
      } else if (response.status === 404) {
        sms.innerText = "User not found";
      } else {
        sms.innerText = data.message || "Login failed. Try again.";
      }
      sms.style.color = "red";
      return;
    }

    Cookies.set("token", data.access_token, { expires: 7 });

    sms.innerText = "Login successful! Redirecting...";
    sms.style.color = "green";

    updateUserProfile();

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 1200);

  } catch (err) {
    console.error(err);
    sms.innerText = "Server error. Please try again later.";
    sms.style.color = "red";
  }
}

function updateUserProfile() {
  const token = Cookies.get("token");

  const userLinkDesktop = document.getElementById("userLinkDesktop");
  const logoutLinkDesktop = document.getElementById("logoutLinkDesktop");

  const userLinkMobile = document.getElementById("userLinkMobile");
  const logoutLinkMobile = document.getElementById("logoutLinkMobile");

  if (!userLinkDesktop || !logoutLinkDesktop || !userLinkMobile || !logoutLinkMobile) return;

  if (!token) {
    userLinkDesktop.innerHTML = `<a href="login.html">Log In</a>`;
    userLinkMobile.innerHTML = `<a href="login.html">Log In</a>`;
    logoutLinkDesktop.style.display = "none";
    logoutLinkMobile.style.display = "none";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const name = payload.firstName || payload.email || "User";
    const avatar = payload.avatar || "default-avatar.png";

    const userHTML = `
      <a href="menu.html" style="display:flex; align-items:center; gap:6px;">
        <img src="${avatar}" alt="User" style="width:24px; height:24px; border-radius:50%; object-fit:cover;">
        <span>${name}</span>
      </a>
    `;

    userLinkDesktop.innerHTML = userHTML;
    userLinkMobile.innerHTML = userHTML;
    logoutLinkDesktop.style.display = "block";
    logoutLinkMobile.style.display = "block";

  } catch (err) {
    console.error("Failed to decode token:", err);
    userLinkDesktop.innerHTML = `<a href="login.html">Log In</a>`;
    userLinkMobile.innerHTML = `<a href="login.html">Log In</a>`;
    logoutLinkDesktop.style.display = "none";
    logoutLinkMobile.style.display = "none";
  }
}

function logout() {
  const token = Cookies.get("token");

  fetch("https://api.everrest.educata.dev/auth/sign_out", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({})
  })
  .finally(() => {
    Cookies.remove("token");
    updateUserProfile();
    window.location.href = "login.html";
  });
}
