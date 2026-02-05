// 数据存储
let notesData = {
    notes: [],
    collections: [],
    likes: []
};

let currentTab = 'notes';
let filteredData = [];

// 初始化
async function init() {
    try {
        // 加载数据
        await loadData();

        // 渲染内容
        renderAll();

        // 绑定事件
        bindEvents();
    } catch (error) {
        console.error('初始化失败:', error);
        showEmptyState();
    }
}

// 加载数据
async function loadData() {
    const dataFiles = ['data/notes.json', 'data/collections.json', 'data/likes.json'];

    for (const file of dataFiles) {
        try {
            const response = await fetch(file);
            const data = await response.json();

            if (file.includes('notes')) {
                notesData.notes = data;
            } else if (file.includes('collections')) {
                notesData.collections = data;
            } else if (file.includes('likes')) {
                notesData.likes = data;
            }
        } catch (error) {
            console.warn(`无法加载 ${file}:`, error);
        }
    }

    // 更新计数
    updateCounts();
}

// 更新计数
function updateCounts() {
    document.getElementById('notes-count').textContent = notesData.notes.length;
    document.getElementById('collections-count').textContent = notesData.collections.length;
    document.getElementById('likes-count').textContent = notesData.likes.length;

    const total = notesData.notes.length + notesData.collections.length + notesData.likes.length;
    document.getElementById('total-count').textContent = total;
}

// 渲染所有内容
function renderAll() {
    renderNotes('notes');
    renderNotes('collections');
    renderNotes('likes');
}

// 渲染笔记列表
function renderNotes(type) {
    const grid = document.getElementById(`${type}-grid`);
    const data = notesData[type];

    if (!data || data.length === 0) {
        grid.innerHTML = createEmptyState(type);
        return;
    }

    grid.innerHTML = data.map(note => createNoteCard(note, type)).join('');
    filteredData = data;
}

// 创建笔记卡片
function createNoteCard(note, type) {
    const images = note.images || [];
    const coverImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/400x300?text=暂无图片';
    const title = note.title || '无标题';
    const content = note.content || note.description || '暂无内容';
    const date = note.createTime || note.collectTime || note.likeTime || '';
    const likes = note.likes || 0;
    const collects = note.collects || 0;
    const tags = note.tags || [];

    return `
        <div class="note-card" data-id="${note.id}" data-type="${type}">
            <img src="${coverImage}" alt="${title}" class="note-image" onerror="this.src='https://via.placeholder.com/400x300?text=图片加载失败'">
            <div class="note-content">
                <h3 class="note-title">${escapeHtml(title)}</h3>
                <p class="note-description">${escapeHtml(content)}</p>
                ${tags.length > 0 ? `
                    <div class="note-tags">
                        ${tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="note-meta">
                    <div class="note-stats">
                        ${likes > 0 ? `<span class="stat">❤️ ${formatNumber(likes)}</span>` : ''}
                        ${collects > 0 ? `<span class="stat">⭐ ${formatNumber(collects)}</span>` : ''}
                    </div>
                    <span class="note-date">${formatDate(date)}</span>
                </div>
            </div>
        </div>
    `;
}

// 创建空状态
function createEmptyState(type) {
    const messages = {
        notes: { icon: '📝', title: '还没有笔记', desc: '开始记录你的第一篇笔记吧' },
        collections: { icon: '⭐', title: '还没有收藏', desc: '收藏你喜欢的笔记' },
        likes: { icon: '❤️', title: '还没有点赞', desc: '点赞感兴趣的笔记' }
    };

    const msg = messages[type];
    return `
        <div class="empty-state">
            <div class="icon">${msg.icon}</div>
            <h3>${msg.title}</h3>
            <p>${msg.desc}</p>
        </div>
    `;
}

// 显示空状态
function showEmptyState() {
    ['notes', 'collections', 'likes'].forEach(type => {
        const grid = document.getElementById(`${type}-grid`);
        grid.innerHTML = createEmptyState(type);
    });
}

// 绑定事件
function bindEvents() {
    // 标签切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    // 搜索
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // 排序
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', handleSort);

    // 笔记卡片点击
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.note-card');
        if (card) {
            const id = card.dataset.id;
            const type = card.dataset.type;
            showNoteDetail(id, type);
        }
    });

    // 关闭模态框
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // ESC 键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// 切换标签
function switchTab(tab) {
    currentTab = tab;

    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // 更新内容显示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tab);
    });

    // 重置搜索
    document.getElementById('search-input').value = '';
    filteredData = notesData[tab];
}

// 搜索处理
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        filteredData = notesData[currentTab];
    } else {
        filteredData = notesData[currentTab].filter(note => {
            const title = (note.title || '').toLowerCase();
            const content = (note.content || note.description || '').toLowerCase();
            const tags = (note.tags || []).join(' ').toLowerCase();

            return title.includes(query) || content.includes(query) || tags.includes(query);
        });
    }

    renderFilteredResults();
}

// 排序处理
function handleSort(e) {
    const sortType = e.target.value;

    filteredData.sort((a, b) => {
        switch (sortType) {
            case 'newest':
                return new Date(b.createTime || b.collectTime || b.likeTime || 0) -
                       new Date(a.createTime || a.collectTime || a.likeTime || 0);
            case 'oldest':
                return new Date(a.createTime || a.collectTime || a.likeTime || 0) -
                       new Date(b.createTime || b.collectTime || b.likeTime || 0);
            case 'popular':
                return (b.likes || 0) - (a.likes || 0);
            default:
                return 0;
        }
    });

    renderFilteredResults();
}

// 渲染筛选结果
function renderFilteredResults() {
    const grid = document.getElementById(`${currentTab}-grid`);

    if (filteredData.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔍</div>
                <h3>未找到相关内容</h3>
                <p>试试其他关键词吧</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredData.map(note => createNoteCard(note, currentTab)).join('');
}

// 显示笔记详情
function showNoteDetail(id, type) {
    const note = notesData[type].find(n => n.id === id);
    if (!note) return;

    const images = note.images || [];
    const title = note.title || '无标题';
    const content = note.content || note.description || '暂无内容';
    const tags = note.tags || [];
    const date = note.createTime || note.collectTime || note.likeTime || '';
    const url = note.url || '';

    let imagesHtml = '';
    if (images.length > 0) {
        imagesHtml = `
            <div class="modal-images" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px;">
                ${images.map(img => `
                    <img src="${img}" alt="${title}" style="width: 100%; border-radius: 8px; cursor: pointer;" onerror="this.style.display='none'">
                `).join('')}
            </div>
        `;
    }

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        ${imagesHtml}
        <h2 style="font-size: 1.8em; margin-bottom: 15px;">${escapeHtml(title)}</h2>
        ${tags.length > 0 ? `
            <div style="margin-bottom: 15px;">
                ${tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join(' ')}
            </div>
        ` : ''}
        <div style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
            ${escapeHtml(content).replace(/\n/g, '<br>')}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid var(--border-color);">
            <span style="color: var(--text-secondary);">${formatDate(date)}</span>
            ${url ? `<a href="${url}" target="_blank" style="color: var(--primary-color); text-decoration: none;">查看原文 →</a>` : ''}
        </div>
    `;

    document.getElementById('modal').classList.add('show');
}

// 关闭模态框
function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

// 工具函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';

    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return '今天';
        if (days === 1) return '昨天';
        if (days < 7) return `${days}天前`;

        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return dateStr;
    }
}

function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 启动应用
init();
