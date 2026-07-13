/**
 * LIFE OS — Global Search Module
 * Searches across: Tasks, Goals, Habits, Journal, Ideas, Projects, Study books
 */

const SearchModule = {
  state: {
    query: '',
  },

  setQuery(q) {
    this.state.query = q;
    const input = document.getElementById('search-large-input');
    if (input) input.value = q;
    this.performSearch();
  },

  render(container) {
    container.innerHTML = `
      <div class="page-content">
        <div class="search-hero animate-fade-in">
          <h1 class="page-title">🔍 البحث الشامل</h1>
          <p class="page-subtitle">ابحث عن أي شيء في نظام حياتك: عادات، مهام، أهداف، أفكار، أو يوميات</p>
          
          <div class="search-input-large">
            <i data-lucide="search" style="width:24px;height:24px; color:var(--text-muted);"></i>
            <input type="text" id="search-large-input" placeholder="اكتب للبحث عن المهام، العادات، الأفكار، الأهداف..."
                   value="${this.state.query}" oninput="SearchModule.handleInput(this.value)">
          </div>
        </div>

        <!-- Search Results -->
        <div id="search-results-area" style="max-width:800px; margin:0 auto;">
          ${this.renderResults()}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    if (this.state.query) {
      this.performSearch();
    }
  },

  handleInput(val) {
    this.state.query = val;
    this.performSearch();
  },

  performSearch() {
    const area = document.getElementById('search-results-area');
    if (area) {
      area.innerHTML = this.renderResults();
      if (window.lucide) lucide.createIcons();
    }
  },

  renderResults() {
    const q = this.state.query.trim().toLowerCase();
    if (!q || q.length < 2) {
      return `
        <div class="empty-state" style="padding:var(--space-6);">
          <p>اكتب حرفين أو أكثر للبدء في البحث الفوري...</p>
        </div>
      `;
    }

    const results = [];

    // 1. Search Tasks
    const tasks = DB.getTasks();
    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q)) {
        results.push({ type: 'task', title: t.title, subtitle: `الأولوية: ${t.priority || 'متوسطة'}`, icon: 'check-square', moduleId: 'dashboard' });
      }
    });

    // 2. Search Goals
    const goals = DB.getGoals();
    goals.forEach(g => {
      if (g.title.toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q)) {
        results.push({ type: 'goal', title: g.title, subtitle: g.description || 'بدون وصف', icon: 'target', moduleId: 'goals' });
      }
    });

    // 3. Search Habits
    const habits = DB.getHabits();
    habits.forEach(h => {
      if (h.name.toLowerCase().includes(q)) {
        results.push({ type: 'habit', title: h.name, subtitle: `عادة ${h.frequency === 'daily' ? 'يومية' : 'أسبوعية'}`, icon: 'repeat', moduleId: 'habits' });
      }
    });

    // 4. Search Journal
    const journal = DB.getJournalEntries();
    journal.forEach(j => {
      if (j.title.toLowerCase().includes(q) || j.content.toLowerCase().includes(q)) {
        results.push({ type: 'journal', title: j.title, subtitle: j.content.slice(0, 100) + '...', icon: 'book-open', moduleId: 'journal' });
      }
    });

    // 5. Search Ideas
    const ideas = DB.getIdeas();
    ideas.forEach(i => {
      if (i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)) {
        results.push({ type: 'idea', title: i.title, subtitle: i.content.slice(0, 100) + '...', icon: 'lightbulb', moduleId: 'ideas' });
      }
    });

    // 6. Search Projects
    const projects = DB.getProjects();
    projects.forEach(p => {
      if (p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)) {
        results.push({ type: 'project', title: p.name, subtitle: p.description || 'بدون وصف', icon: 'folder', moduleId: 'projects' });
      }
    });

    // 7. Search Books
    const books = DB.getBooks();
    books.forEach(b => {
      if (b.title.toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q)) {
        results.push({ type: 'book', title: b.title, subtitle: `الكاتب: ${b.author || 'غير معروف'}`, icon: 'book', moduleId: 'study' });
      }
    });

    if (results.length === 0) {
      return `
        <div class="empty-state" style="padding:var(--space-6);">
          <div class="empty-state-icon"><i data-lucide="search" style="width:32px;height:32px;"></i></div>
          <h3>لم نعثر على أي نتائج</h3>
          <p>جرّب كلمات بحثية مختلفة أو تحقق من الإملاء.</p>
        </div>
      `;
    }

    const typeLabels = {
      task: 'مهمة ✅',
      goal: 'هدف 🎯',
      habit: 'عادة ⚡',
      journal: 'يوميات 📔',
      idea: 'فكرة 💡',
      project: 'مشروع 🚀',
      book: 'كتاب 📖'
    };

    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-2);">
        ${results.map(r => `
          <div class="search-result card" style="cursor:pointer;" onclick="navigateTo('${r.moduleId}')">
            <div style="display:flex; align-items:center; gap:var(--space-3); flex:1;">
              <div class="card-icon purple" style="width:32px; height:32px;">
                <i data-lucide="${r.icon}" style="width:16px;height:16px;"></i>
              </div>
              <div>
                <div style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${r.title}</div>
                <div style="font-size:var(--font-size-xs); color:var(--text-muted); margin-top:2px;">${r.subtitle}</div>
              </div>
            </div>
            <span class="search-result-type">${typeLabels[r.type] || r.type}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
};
