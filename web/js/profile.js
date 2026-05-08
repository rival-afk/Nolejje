const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileRole = document.getElementById('profile-role');
const avatarInput = document.getElementById('avatar-input');
const avatarPreview = document.getElementById('avatar-preview');
const saveNameBtn = document.getElementById('save-name');
const uploadAvatarBtn = document.getElementById('upload-avatar');
const deleteAccountBtn = document.getElementById('delete-account');
const profileMessage = document.getElementById('profile-message');

let profileData = null;

function showMessage(text, danger = false) {
  profileMessage.textContent = text;
  profileMessage.style.color = danger ? '#ff7b7b' : '#8ae59f';
}

async function loadProfile() {
  try {
    const token = await checkAuth();
    if (!token) return;

    const response = await fetch('/api/users/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!response.ok) {
      window.location.href = '/login';
      return;
    }

    profileData = await response.json();
    profileName.value = profileData.name || '';
    profileEmail.value = profileData.email || '';
    profileRole.value = (profileData.role || '').toUpperCase();
    document.getElementById('header-username').textContent = profileData.name || '';
    document.getElementById('header-role-badge').textContent = profileData.role ? profileData.role.toUpperCase() : '';

    if (profileData.avatar_url) {
      avatarPreview.innerHTML = `<img src="${profileData.avatar_url}" alt="Avatar">`;
    } else {
      avatarPreview.textContent = profileData.name ? profileData.name[0].toUpperCase() : 'A';
    }
  } catch (err) {
    showMessage('Не удалось загрузить профиль', true);
  }
}

async function updateName() {
  const value = profileName.value.trim();
  if (!value) {
    showMessage('Имя не может быть пустым', true);
    return;
  }

  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ name: value })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      showMessage(error.detail || 'Ошибка при сохранении имени', true);
      return;
    }

    showMessage('Имя сохранено');
    document.getElementById('header-username').textContent = value;
  } catch (err) {
    showMessage('Сервер не отвечает', true);
  }
}

async function uploadAvatar() {
  const file = avatarInput.files[0];
  if (!file) {
    showMessage('Выберите файл для загрузки', true);
    return;
  }

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/users/me/avatar', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      showMessage(error.detail || 'Ошибка при загрузке аватара', true);
      return;
    }

    const data = await response.json();
    if (data.avatar_url) {
      avatarPreview.innerHTML = `<img src="${data.avatar_url}" alt="Avatar">`;
      showMessage('Аватар обновлён');
    }
  } catch (err) {
    showMessage('Ошибка сети', true);
  }
}

async function deleteAccount() {
  if (!confirm('Вы уверены? Это действие удалит ваш аккаунт навсегда.')) {
    return;
  }

  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/users/me', {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      showMessage(error.detail || 'Ошибка удаления аккаунта', true);
      return;
    }

    localStorage.removeItem('access_token');
    window.location.href = '/login';
  } catch (err) {
    showMessage('Ошибка сети', true);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  loadProfile();

  saveNameBtn.addEventListener('click', updateName);
  uploadAvatarBtn.addEventListener('click', uploadAvatar);
  deleteAccountBtn.addEventListener('click', deleteAccount);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    });
  }
});
