let user = null;

async function init() {
  user = await checkAuth();
  return user;
}

init().then(() => {

  const token = localStorage.getItem("access_token");
  const roleLabels = { student: "УЧЕНИК", teacher: "УЧИТЕЛЬ", admin: "АДМИН" };

  if (user.role !== "admin") {
    document.getElementById("header-username").textContent = user.name;
  }

  document.getElementById("header-role-badge").textContent = roleLabels[user.role] || user.role;

  function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  const logoutBtn = document.getElementById("logout-btn");
  const logoutBtnAdmin = document.getElementById("logout-btn-admin");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (logoutBtnAdmin) logoutBtnAdmin.addEventListener("click", logout);

  if (user.role === "student") {
    showDashboard("student");
    initStudent(token);
  } else if (user.role === "teacher") {
    showDashboard("teacher");
    initTeacher(token);
  } else if (user.role === "admin") {
    showDashboard("admin");
    initAdmin(token);
  } else {
    throw new Error("Неизвестная роль");
  }

});

function showDashboard(role) {
  document.getElementById("student-dashboard").style.display = "none";
  document.getElementById("teacher-dashboard").style.display = "none";
  document.getElementById("admin-dashboard").style.display   = "none";

  if (role === "student") document.getElementById("student-dashboard").style.display = "block";
  if (role === "teacher") document.getElementById("teacher-dashboard").style.display = "block";
  if (role === "admin")   document.getElementById("admin-dashboard").style.display   = "flex";
}

async function initStudent(token) {
  document.getElementById("user-name").textContent = user.name.toUpperCase();

  fetch("/api/students/me", { headers: { "Authorization": "Bearer " + token } })
    .then(r => r.json())
    .then(data => {
      document.getElementById("user-class").textContent = data["class"] + " класс · " + data["school_name"];
    })
    .catch(() => {});

  const response = await fetch("/api/students/me/homeworks", {
    headers: { "Authorization": "Bearer " + token }
  });

  const homework = document.getElementById("homework");

  if (!response.ok) {
    homework.innerHTML = "<p class='empty-hw'>Ошибка загрузки заданий</p>";
    return;
  }

  const data = await response.json();
  document.getElementById("hw-count").textContent = data.length;

  if (data.length === 0) {
    homework.innerHTML = "<p class='empty-hw'>Нет домашних заданий</p>";
    return;
  }

  data.forEach(hw => {
    const item     = document.createElement("div");
    const body     = document.createElement("div");
    const subjName = document.createElement("div");
    const title    = document.createElement("div");
    const desc     = document.createElement("div");
    const date     = document.createElement("div");

    item.classList.add("hw-card");
    body.classList.add("hw-card-body");
    subjName.classList.add("hw-card-subjname");
    title.classList.add("hw-card-title");
    desc.classList.add("hw-card-desc");
    date.classList.add("hw-card-date");

    subjName.textContent = hw.subject_name;
    title.textContent    = hw.title;
    desc.textContent     = hw.description;

    const d = new Date(hw.due_date);
    date.textContent = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();

    body.appendChild(subjName);
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(date);
    item.appendChild(body);
    homework.appendChild(item);
  });
}

function initTeacher(token) {
  const teacherName = document.getElementById("teacher-name");
  if (teacherName) teacherName.textContent = user.name.toUpperCase();
  loadClasses(token);
}

function loadClasses(token) {
  fetch("/api/teacher/classes", { headers: { "Authorization": "Bearer " + token } })
    .then(r => r.json())
    .then(data => {
      const list = document.getElementById("class-list");
      list.innerHTML = "";

      if (data.length === 0) {
        list.innerHTML = "<span class='text'>Нет классов</span>";
        return;
      }

      data.forEach(cls => {
        const div = document.createElement("div");
        div.classList.add("class-item");
        div.innerHTML = `
          <div>${cls.name}</div>
          <div class="class-item-sub">${cls.students_count} учеников</div>
        `;
        div.addEventListener("click", () => {
          document.querySelectorAll(".class-item").forEach(el => el.classList.remove("active"));
          div.classList.add("active");
          document.getElementById("class-title").textContent = cls.name;
          document.getElementById("hw-panel").style.display = "block";
          loadStudents(cls.id, token);
        });
        list.appendChild(div);
      });
    })
    .catch(() => {});
}

function loadStudents(classId, token) {
  const container = document.getElementById("students");
  container.innerHTML = "<p class='text'>Загрузка...</p>";

  fetch("/api/teacher/classes/" + classId + "/students", {
    headers: { "Authorization": "Bearer " + token }
  })
    .then(r => r.json())
    .then(data => {
      container.innerHTML = "";

      if (data.length === 0) {
        container.innerHTML = "<p class='text'>Нет учеников</p>";
        return;
      }

      data.forEach(student => {
        const row = document.createElement("div");
        row.classList.add("student-row");
        row.innerHTML = `<span class="student-row-name">${student.name}</span>`;
        container.appendChild(row);
      });
    })
    .catch(() => {
      container.innerHTML = "<p class='text'>Ошибка загрузки</p>";
    });
}

function initAdmin(token) {
  const sidebar = document.getElementById("admin-username-sidebar");
  if (sidebar) sidebar.textContent = user.email || "";

  setupAdminNav(token);
  loadPage("assign", token);
}

function setupAdminNav(token) {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      loadPage(item.dataset.page, token);
    });
  });
}

function loadPage(page, token) {
  const container = document.getElementById("admin-content");

  if (page === "assign") {
    container.innerHTML = `
      <h1 class="admin-page-title">Назначения</h1>
      <div id="assign-panel"></div>
      <div class="assignments-list" id="assignments"></div>
    `;
    initAssignPage(token);
    return;
  }

  if (page === "teachers") {
    container.innerHTML = `
      <h1 class="admin-page-title">Учителя</h1>
      <div class="assignments-list" id="teachers-list"></div>
    `;
    loadTeachers(token);
    return;
  }

  if (page === "classes") {
    container.innerHTML = `
      <h1 class="admin-page-title">Классы</h1>
      <div class="assignments-list" id="classes-list"></div>
    `;
    loadAdminClasses(token);
    return;
  }

  if (page === "analytics") {
    container.innerHTML = `
      <h1 class="admin-page-title">Аналитика</h1>
      <div id="analytics-content"></div>
    `;
    loadAnalytics(token);
    return;
  }

  if (page === "reports") {
    container.innerHTML = `
      <h1 class="admin-page-title">Жалобы</h1>
      <p class="text">Нет жалоб</p>
    `;
    return;
  }
}

function initAssignPage(token) {
  renderAssignUI(token);
  loadAssignments(token);
}

function renderAssignUI(token) {
  const container = document.getElementById("assign-panel");
  container.innerHTML = `
    <div class="assign-form">
      <select class="assign-select" id="teacher-select"></select>
      <select class="assign-select" id="class-select"></select>
      <select class="assign-select" id="subject-select"></select>
      <button class="accent-button" id="assign-btn">Назначить</button>
    </div>
    <div class="assign-error" id="assign-error"></div>
  `;
  loadAssignData(token);
}

async function loadAssignData(token) {
  const errorEl = document.getElementById("assign-error");
  try {
    const [teachers, classes, subjects] = await Promise.all([
      fetch("/api/admin/teachers",  { headers: { Authorization: "Bearer " + token } }).then(r => r.json()),
      fetch("/api/classes").then(r => r.json()),
      fetch("/api/admin/subjects",  { headers: { Authorization: "Bearer " + token } }).then(r => r.json())
    ]);

    fillSelect("teacher-select", teachers, "Учитель");
    fillSelect("class-select",   classes,  "Класс");
    fillSelect("subject-select", subjects, "Предмет");

    initAssignButton(token);
  } catch {
    errorEl.textContent = "Ошибка загрузки данных";
    errorEl.style.display = "block";
  }
}

function fillSelect(id, data, placeholder) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">${placeholder}</option>`;
  data.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });
}

function initAssignButton(token) {
  const btn     = document.getElementById("assign-btn");
  const errorEl = document.getElementById("assign-error");

  btn.addEventListener("click", async () => {
    const teacher_id = document.getElementById("teacher-select").value;
    const class_id   = document.getElementById("class-select").value;
    const subject_id = document.getElementById("subject-select").value;

    if (!teacher_id || !class_id || !subject_id) {
      errorEl.textContent = "Заполни все поля";
      errorEl.style.display = "block";
      return;
    }

    errorEl.style.display = "none";

    try {
      await fetch("/api/admin/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ teacher_id, class_id, subject_id })
      });

      loadAssignments(token);
      btn.textContent = "✓ Готово";
      setTimeout(() => btn.textContent = "Назначить", 1200);
    } catch {
      errorEl.textContent = "Ошибка назначения";
      errorEl.style.display = "block";
    }
  });
}

async function loadAssignments(token) {
  const container = document.getElementById("assignments");
  container.innerHTML = "<p class='text'>Загрузка...</p>";

  try {
    const data = await fetch("/api/admin/assignments", {
      headers: { "Authorization": "Bearer " + token }
    }).then(r => r.json());

    renderAssignments(data, token);
  } catch {
    container.innerHTML = "<p class='text'>Ошибка загрузки</p>";
  }
}

function renderAssignments(data, token) {
  const container = document.getElementById("assignments");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p class='list-empty'>Нет назначений</p>";
    return;
  }

  data.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("assignment-card");
    div.innerHTML = `
      <span class="assignment-main">
        <span class="assignment-teacher">${item.teacher}</span>
        <span class="assignment-arrow"> → </span>
        <span class="assignment-class">${item.class}</span>
        <span class="assignment-arrow"> → </span>
        <span class="assignment-subject">${item.subject}</span>
      </span>
      <button class="delete-btn" data-id="${item.id}">✕</button>
    `;

    div.querySelector(".delete-btn").addEventListener("click", async () => {
      await fetch("/api/admin/assign/" + item.id, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
      });
      loadAssignments(token);
    });

    container.appendChild(div);
  });
}

async function loadTeachers(token) {
  const container = document.getElementById("teachers-list");
  container.innerHTML = "<p class='text'>Загрузка...</p>";

  try {
    const data = await fetch("/api/admin/teachers", {
      headers: { "Authorization": "Bearer " + token }
    }).then(r => r.json());

    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = "<p class='list-empty'>Нет учителей</p>";
      return;
    }

    data.forEach(teacher => {
      const div = document.createElement("div");
      div.classList.add("assignment-card");
      div.innerHTML = `<span class="assignment-subject">${teacher.name}</span>`;
      container.appendChild(div);
    });
  } catch {
    container.innerHTML = "<p class='text'>Ошибка загрузки</p>";
  }
}

async function loadAdminClasses(token) {
  const container = document.getElementById("classes-list");
  container.innerHTML = "<p class='text'>Загрузка...</p>";

  try {
    const data = await fetch("/api/admin/classes", {
      headers: { "Authorization": "Bearer " + token }
    }).then(r => r.json());

    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = "<p class='list-empty'>Нет классов</p>";
      return;
    }

    data.forEach(cls => {
      const div = document.createElement("div");
      div.classList.add("assignment-card");
      div.innerHTML = `
        <span class="assignment-subject">${cls.name}</span>
        <span class="assignment-teacher">${cls.students_count} учеников</span>
      `;
      container.appendChild(div);
    });
  } catch {
    container.innerHTML = "<p class='text'>Ошибка загрузки</p>";
  }
}

async function loadAnalytics(token) {
  const container = document.getElementById("analytics-content");
  container.innerHTML = "<p class='text'>Загрузка...</p>";

  try {
    const data = await fetch("/api/admin/analytics", {
      headers: { "Authorization": "Bearer " + token }
    }).then(r => r.json());

    const a = data[0];
    const avg = a.avg_grade ? parseFloat(a.avg_grade).toFixed(1) : "—";

    container.innerHTML = `
      <div class="analytics-grid">
        <div class="stat-card">
          <span class="stat-label">Пользователей</span>
          <span class="stat-value">${a.total_users}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Учеников</span>
          <span class="stat-value">${a.total_students}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Учителей</span>
          <span class="stat-value">${a.total_teachers}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Классов</span>
          <span class="stat-value">${a.total_classes}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Средний балл</span>
          <span class="stat-value">${avg}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Админов</span>
          <span class="stat-value">${a.total_admins}</span>
        </div>
      </div>
    `;
  } catch {
    container.innerHTML = "<p class='text'>Ошибка загрузки</p>";
  }
}