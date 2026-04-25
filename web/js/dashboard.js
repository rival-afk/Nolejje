let user = null;
async function init() {
  user = await checkAuth();
  return user;
};

init().then(() => {

const userName = document.getElementById("user-name");
userName.textContent = user["name"].toUpperCase();

const token = localStorage.getItem("access_token");
const homework = document.getElementById("homework");

const userClass = document.getElementById("user-class");
const studentData = fetch("/api/students/me", {
  method: "GET",
  headers: {
    "Authorization": "Bearer " + token
  }
}).then(response => {
  if (!response.ok) {
    throw new Error("Получение класса упало с ошибкой");
  };

  return response.json()
}).then(data => {
  userClass.textContent = data["class"] + " класс · " + data["school_name"];
});

async function getHomeworks() {
  const response = await fetch("/api/students/me/homeworks", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  if (!response.ok) {
    throw new Error("Ошибка запроса к API");
  };

  const data = await response.json();

  if (data.length == 0) {
    homework.textContent = "Нет домашних заданий!";
  } else if (data.length != 0) {
    data.forEach(hw => {
      const item = document.createElement("div");
      item.classList.add("hw-card", "card");
      const title = document.createElement("p");
      title.classList.add("hw-card-title");
      const desc = document.createElement("p");
      desc.classList.add("hw-card-desc");
      const subjName = document.createElement("h2");
      subjName.classList.add("hw-card-subjname");
      const date = document.createElement("p");
      date.classList.add("hw-card-date");

      title.textContent = hw.title;
      desc.textContent = hw.description;
      subjName.textContent = hw.subject_name;
      
      const d = new Date(hw.due_date);
      date.textContent = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
      
      item.appendChild(title);
      item.appendChild(desc);
      item.appendChild(subjName);
      item.appendChild(date);
      homework.appendChild(item);
    });
  };
};

if (user.role == "student") {
  getHomeworks();
} else if (user.role == "teacher") {
  document.body.innerHTML = "<h1>Вы учитель</h1>";
} else if (user.role == "admin") {
  document.body.innerHTML = "<h1>Вы админ</h1>";
} else {
  throw new Error("Неизвестная роль")
};
});