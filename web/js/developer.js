async function loadDeveloperInfo() {
  try {
    const response = await fetch('/api/developer/age', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
      }
    });

    if (!response.ok) {
      document.getElementById('developer-age').textContent = 'Ошибка загрузки';
      document.getElementById('dev-age-span').textContent = 'Ошибка загрузки';
      return;
    }

    const data = await response.json();
    document.getElementById('developer-age').textContent = data.age ? `${data.age} лет` : '—';
    document.getElementById('dev-age-span').textContent = data.age ? `${data.age} лет` : '—';
  } catch (err) {
    document.getElementById('developer-age').textContent = 'Ошибка';
    document.getElementById('dev-age-span').textContent = 'Ошибка';
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  loadDeveloperInfo();

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  });
});
