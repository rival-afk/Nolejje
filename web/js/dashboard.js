async function init() {
  const user = await checkAuth();
  return user;
};

init();

const userName = document.getElementById("user-name");
userName.append(user["name"]);