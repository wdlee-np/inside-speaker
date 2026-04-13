// SPA 라우터
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function setActiveNav(page) {
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

async function navigate(hash) {
  const page = hash.replace('#', '') || 'campaigns';
  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading-spinner">로딩 중...</div>';

  setActiveNav(page);

  try {
    if (page === 'campaigns') {
      await renderCampaigns();
    } else if (page === 'reports') {
      await renderReports();
    } else if (page.startsWith('campaigns/new')) {
      await renderCampaignForm(null);
    } else if (page.startsWith('campaigns/') && page.endsWith('/edit')) {
      const id = page.split('/')[1];
      await renderCampaignForm(id);
    } else {
      await renderCampaigns();
    }
  } catch (e) {
    app.innerHTML = `<div class="form-error">페이지 로드 오류: ${e.message}</div>`;
  }
}

window.addEventListener('hashchange', () => {
  navigate(location.hash);
});

// 초기 로드
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash || location.hash === '#') location.hash = '#campaigns';
  navigate(location.hash);
});
