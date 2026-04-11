const token = localStorage.getItem("access_token");
const user = fetch("/api/users/me", {
  method:"GET",
  headers: {
    "Authorization": "Bearer " + token
  }
})
.then(response => {
  if (!response.ok) {
    document.getElementById("error").textContent = "Ошибка при получении текущего пользователя";
    throw new Error("Ошибка при получении текущего пользователя");
  };
  return response.json();
});

console.log(user);