let user = null;
async function init() {
  user = await checkAuth();
  return user;
};

await init().then(() => {

const userName = document.getElementById("user-name");
userName.textContent = user["name"];

const userRole = document.getElementById("user-role");
userRole.textContent = user["role"];

});