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
let studentData = null;
let activeClassId = null;

if (user.role == "student") {
  document.getElementById("student-dashboard").style.display = "block";
  document.getElementById("teacher-dashboard").style.display = "none";
  studentData = fetch("/api/students/me", {
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
  initStudent();
  showDashboard(user.role);
} else if (user.role == "teacher") {
  document.getElementById("student-dashboard").style.display = "none";
  document.getElementById("teacher-dashboard").style.display = "block";
  initTeacher();
  showDashboard(user.role);
} else if (user.role == "admin") {
  showDashboard(user.role);
} else {
  throw new Error("Неизвестная роль")
};

async function initStudent() {
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

function initTeacher() {
  loadClasses();
};

function loadClasses() {
  fetch("/api/teacher/classes", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("access_token")
    }
  })
  .then(response => response.json())
  .then(data => {
    const list = document.getElementById("class-list");
    list.innerHTML = "";

    if (data.length == 0) {
      const div = document.createElement("div");
      div.textContent = "Нет классов";
      div.classList.add("text");
      list.appendChild(div);
    } else {
      data.forEach(teacherClass => {
        const div = document.createElement("div");
        div.classList.add("class-item");

        div.innerHTML = `
          <div>${teacherClass.name}</div>
          <div style="font-size:11px; color:#777;">
            ${teacherClass.students_count} учеников
          </div>
        `;

        div.addEventListener("click", () => {
          activeClassId = teacherClass.id;

          document.querySelectorAll(".class-item").forEach(el => {
            el.classList.remove("active");
          });

          div.classList.add("active");

          loadStudents(teacherClass.id);
        });

        list.appendChild(div);
      });
    };
  });
};

function showDashboard(role) {
  document.getElementById("student-dashboard").style.display = "none";
  document.getElementById("teacher-dashboard").style.display = "none";
  document.getElementById("admin-dashboard").style.display = "none";

  if (role == "student") {
    document.getElementById("student-dashboard").style.display = "block";
  }

  if (role == "teacher") {
    document.getElementById("teacher-dashboard").style.display = "block";
  }

  if (role == "admin") {
    document.getElementById("admin-dashboard").style.display = "block";
  }
};
});