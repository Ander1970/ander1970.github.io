let allGames = [];
let activeTag = '全部';

// ── 判斷是否為新遊戲（7天內）
function isNew(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

// ── 載入遊戲資料
async function loadGames() {
  try {
    const res = await fetch('games.json');
    allGames = await res.json();
    // 依日期排序，最新在前
    allGames.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    document.getElementById('gameCount').textContent = `${allGames.length} 款遊戲`;
    renderTags(allGames);
    renderGames(allGames);
  } catch (e) {
    document.getElementById('gameGrid').innerHTML =
      '<p style="color:#94a3b8;text-align:center;padding:60px 0">載入遊戲資料失敗，請稍後再試。</p>';
  }
}

// ── 渲染卡片
function renderGames(games) {
  const grid = document.getElementById('gameGrid');
  const empty = document.getElementById('emptyState');

  if (games.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = games.map(game => {
    const thumbHTML = game.thumbnail
      ? `<img class="card-thumb" src="${game.thumbnail}" alt="${game.title}" onerror="this.outerHTML='<div class=card-thumb-placeholder>${game.icon || '🎮'}</div>'">`
      : `<div class="card-thumb-placeholder">${game.icon || '🎮'}</div>`;

    return `
      <div class="game-card" onclick="location.href='${game.path}'">
        ${thumbHTML}
        ${game.featured ? '<span class="badge-featured">⭐ 精選</span>' : ''}
        ${isNew(game.addedDate) ? '<span class="badge-new">🆕 新上架</span>' : ''}
        <div class="card-body">
          <h3>${game.title}</h3>
          <p>${game.description}</p>
          <div class="card-tags">
            ${game.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── 渲染標籤
function renderTags(games) {
  const allTags = ['全部', ...new Set(games.flatMap(g => g.tags))];
  const filter = document.getElementById('tagFilter');
  filter.innerHTML = allTags.map(tag => `
    <button class="tag-btn ${tag === '全部' ? 'active' : ''}"
            onclick="filterByTag(this, '${tag}')">${tag}</button>
  `).join('');
}

// ── 標籤篩選
function filterByTag(btn, tag) {
  activeTag = tag;
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilter();
}

// ── 搜尋 + 標籤合併篩選
function applyFilter() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  let result = allGames;
  if (activeTag !== '全部') {
    result = result.filter(g => g.tags.includes(activeTag));
  }
  if (keyword) {
    result = result.filter(g =>
      g.title.toLowerCase().includes(keyword) ||
      g.description.toLowerCase().includes(keyword)
    );
  }
  renderGames(result);
}

// ── 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadGames();
  document.getElementById('searchInput').addEventListener('input', applyFilter);
});