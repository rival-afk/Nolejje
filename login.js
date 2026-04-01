const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const login = document.getElementById("login");
const register = document.getElementById("register");

const registerName = document.getElementById("register-name");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");

loginTab.addEventListener("click", function () {
  login.style.display = "block";
  register.style.display = "none";
});

registerTab.addEventListener("click", function () {
  login.style.display = "none";
  register.style.display = "block";
});

loginButton.addEventListener("click", function () {
  const email = loginEmail.value;
  const password = loginPassword.value;
  
  fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("An error occured while login");
    }
    return response.json();
  })
  .then(data => {
    localStorage.setItem("access_token", data.access_token);
    window.location.href = "/dashboard.html";
  })
  .catch(error => {
    document.getElementById("error").textContent = "Неверный логин или пароль"
  })
});