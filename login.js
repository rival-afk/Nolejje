const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const login = document.getElementById("login");
const register = document.getElementById("register");

loginTab.addEventListener("click", function () {
  login.style.display = "block";
  register.style.display = "none";
});

registerTab.addEventListener("click", function () {
  login.style.display = "none";
  register.style.display = "block";
});