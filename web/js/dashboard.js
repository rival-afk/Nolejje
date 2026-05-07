let user = null;
async function init() {
  user = await checkAuth();
  return user;
};

init().then(() => {

const userName = document.getElementById("user-name");
if (user.role != "admin") {
  userName.textContent = user["name"].toUpperCase();
};

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
  initAdmin();
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
    homework.classList.add("empty-hw")
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

function initAdmin() {
  setupAdminNav();
  loadPage("assign");
};

function setupAdminNav() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {

      document.querySelectorAll(".nav-item")
        .forEach(item => item.classList.remove("active"));

      item.classList.add("active");

      loadPage(item.dataset.page);
    });
  });
};

function loadPage(page) {
  const container = document.getElementById("admin-content");

  if (page === "assign") {
    container.innerHTML = `
      <h1 class="h2">Назначения</h1>
      <div id="assign-panel"></div>
      <div id="assignments"></div>
    `;

    initAssignPage();
  }

  if (page === "analytics") {
    container.innerHTML = `
      <h1 class="h2">Аналитика</h1>
      <p class="text">Скоро здесь будет статистика</p>
    `;
  }
};

function initAssignPage() {
  renderAssignUI();
  loadAssignments();
};

function renderAssignUI() {
  const container = document.getElementById("assign-panel");

  container.innerHTML = `
    <div class="assign-box">
      <select id="teacher-select"></select>
      <select id="class-select"></select>
      <select id="subject-select"></select>

      <button id="assign-btn">Назначить</button>
    </div>

    <div id="assign-error" class="text" style="color:#ff5555;"></div>
  `;

  loadAssignData();
};

async function loadAssignData() {
  try {
    const token = localStorage.getItem("access_token");

    const [teachers, classes, subjects] = await Promise.all([
      fetch("/api/admin/teachers", { headers: { Authorization: "Bearer " + token }}).then(response => response.json()),
      fetch("/api/classes").then(response => response.json()),
      fetch("/api/subjects").then(response => response.json())
    ]);

    fillSelect("teacher-select", teachers);
    fillSelect("class-select", classes);
    fillSelect("subject-select", subjects);

    initAssignButton();

  } catch (e) {
    document.getElementById("assign-error").textContent = "Ошибка загрузки данных";
  }
};

function fillSelect(id, data) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">Выберите</option>`;

  data.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });
};

function initAssignButton() {
  const button = document.getElementById("assign-btn");

  button.addEventListener("click", async () => {
    const teacher_id = document.getElementById("teacher-select").value;
    const class_id = document.getElementById("class-select").value;
    const subject_id = document.getElementById("subject-select").value;

    const error = document.getElementById("assign-error");

    if (!teacher_id || !class_id || !subject_id) {
      error.textContent = "Заполни все поля";
      return;
    }

    try {
      await fetch("/api/admin/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("access_token")
        },
        body: JSON.stringify({
          teacher_id,
          class_id,
          subject_id
        })
      });

      error.textContent = "";
      loadAssignments();

      button.textContent = "✓";
      setTimeout(() => button.textContent = "Назначить", 800);
    } catch {
      error.textContent = "Ошибка назначения";
    }
  });
};

async function loadAssignments() {
  const container = document.getElementById("assignments");
  container.innerHTML = "<p class='text'>Загрузка...</p>";

  try {
    const data = await fetch("/api/admin/assignments", {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("access_token")
      }
    }).then(response => response.json());

    renderAssignments(data);

  } catch {
    container.innerHTML = "<p class='text'>Ошибка загрузки</p>";
  }
};

function renderAssignments(data) {
  const container = document.getElementById("assignments");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p class='text'>Нет назначений</p>";
    return;
  }

  data.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("assignment-card");

    div.innerHTML = `
      <div class="assignment-main">
        ${item.teacher} → ${item.class} → ${item.subject}
      </div>
    `;

    container.appendChild(div);
  });
};
});