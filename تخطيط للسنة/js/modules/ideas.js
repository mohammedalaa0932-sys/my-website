/**
 * LIFE OS — Ideas Module
 * Quick capture, categories, search, favorite ideas
 */

const IdeasModule = {
  state: {
    searchQuery: '',
    filterCategory: 'all',
  },

  render(container) {
    const ideas = DB.getIdeas();
    const categories = ['الكل', ...new Set(ideas.map(i => i.category).filter(Boolean))];

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">💡 الأفكار الملهمة</h1>
            <p class="page-subtitle">التقط أفكارك الإبداعية فوراً قبل أن تنساها ونظمها</p>
          </div>
          <button class="btn btn-primary" onclick="IdeasModule.openAddIdea()">+ فكرة جديدة</button>
        </div>

        <!-- Filter and Search Row -->
        <div style="display:flex; gap:var(--space-3); margin-bottom:var(--space-6); flex-wrap:wrap; align-items:center;">
          <div style="flex:1; min-width:260px;">
            <input type="text" class="form-control" placeholder="🔍 ابحث في أفكارك..." id="idea-search-input"
                   value="${this.state.searchQuery}" oninput="IdeasModule.search(this.value)">
          </div>
          <div>
            <select class="form-control" onchange="IdeasModule.filterCategory(this.value)" style="min-width:150px;">
              <option value="all">كل التصنيفات</option>
              ${categories.filter(c => c !== 'الكل').map(c => `<option value="${c}" ${this.state.filterCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Ideas List / Grid -->
        <div id="ideas-grid">
          ${this.renderIdeasList()}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  search(q) {
    this.state.searchQuery = q;
    const grid = document.getElementById('ideas-grid');
    if (grid) {
      grid.innerHTML = this.renderIdeasList();
      if (window.lucide) lucide.createIcons();
    }
  },

  filterCategory(cat) {
    this.state.filterCategory = cat;
    const grid = document.getElementById('ideas-grid');
    if (grid) {
      grid.innerHTML = this.renderIdeasList();
      if (window.lucide) lucide.createIcons();
    }
  },

  renderIdeasList() {
    let ideas = DB.getIdeas().sort((a,b) => b.favorite - a.favorite || new Date(b.createdAt) - new Date(a.createdAt));

    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      ideas = ideas.filter(i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q));
    }

    if (this.state.filterCategory !== 'all') {
      ideas = ideas.filter(i => i.category === this.state.filterCategory);
    }

    if (ideas.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="lightbulb" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد أفكار مسجلة</h3>
          <p>سجّل خواطرك وأفكارك الإبداعية لتطويرها لاحقاً.</p>
          <button class="btn btn-primary" onclick="IdeasModule.openAddIdea()">دوّن أول فكرة</button>
        </div>
      `;
    }

    return `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:var(--space-4);">
        ${ideas.map(i => `
          <div class="idea-card card animate-fade-in ${i.favorite ? 'favorite' : ''}" onclick="IdeasModule.openEditIdea('${i.id}')">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-2);">
              <span class="badge badge-purple">${i.category || 'عام'}</span>
              <div style="display:flex; gap:2px;">
                <button class="btn btn-ghost btn-icon btn-sm" onclick="event.stopPropagation(); IdeasModule.toggleFavorite('${i.id}')" style="color:var(--accent-amber);">
                  ${i.favorite ? '★' : '☆'}
                </button>
                <button class="btn btn-danger btn-icon btn-sm" onclick="event.stopPropagation(); IdeasModule.deleteIdea('${i.id}')">
                  <i data-lucide="trash-2" style="width:12px;height:12px;"></i>
                </button>
              </div>
            </div>
            <h3 style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${i.title}</h3>
            <p style="font-size:var(--font-size-xs); color:var(--text-secondary); margin-top:var(--space-2); line-height:1.6; max-height:80px; overflow:hidden;">
              ${i.content}
            </p>
            <div style="font-size:9px; color:var(--text-muted); margin-top:var(--space-3);">📅 ${formatDateAr(i.createdAt, 'short')}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  openAddIdea() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تدوين فكرة جديدة 💡</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">عنوان الفكرة</label>
          <input type="text" id="idea-title" class="form-control" placeholder="اكتب عنواناً معبراً عن الفكرة">
        </div>
        <div class="form-group">
          <label class="form-label">التصنيف</label>
          <input type="text" id="idea-category" class="form-control" placeholder="مثال: مشروع، دراسة، كتابة...">
        </div>
        <div class="form-group">
          <label class="form-label required">تفاصيل الفكرة</label>
          <textarea id="idea-content" class="form-control" placeholder="اشرح فكرتك بالتفصيل لئلا تفقد جوهرها..." rows="5"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="IdeasModule.saveIdea()">حفظ الفكرة</button>
      </div>
    `;
    openModal(content);
  },

  saveIdea() {
    const title = document.getElementById('idea-title')?.value?.trim();
    const content = document.getElementById('idea-content')?.value?.trim();
    if (!title || !content) { Toast.show('يرجى كتابة عنوان وتفاصيل الفكرة', 'error'); return; }

    const ideas = DB.getIdeas();
    ideas.push({
      id: generateId(),
      title,
      category: document.getElementById('idea-category')?.value?.trim() || 'عام',
      content,
      favorite: false,
      createdAt: new Date().toISOString()
    });
    DB.saveIdeas(ideas);
    closeTopModal();
    Toast.show('تم تدوين الفكرة بنجاح! 💡', 'success');
    renderModule('ideas');
  },

  toggleFavorite(id) {
    const ideas = DB.getIdeas();
    const idea = ideas.find(x => x.id === id);
    if (idea) {
      idea.favorite = !idea.favorite;
      DB.saveIdeas(ideas);
      Toast.show(idea.favorite ? 'تمت الإضافة للمفضلة ⭐' : 'تمت الإزالة من المفضلة', 'info');
      const grid = document.getElementById('ideas-grid');
      if (grid) {
        grid.innerHTML = this.renderIdeasList();
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  deleteIdea(id) {
    if (!confirm('هل تريد حذف هذه الفكرة؟')) return;
    let ideas = DB.getIdeas();
    ideas = ideas.filter(x => x.id !== id);
    DB.saveIdeas(ideas);
    Toast.show('تم حذف الفكرة', 'info');
    renderModule('ideas');
  },

  openEditIdea(id) {
    const ideas = DB.getIdeas();
    const idea = ideas.find(x => x.id === id);
    if (!idea) return;

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تعديل الفكرة 💡</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">عنوان الفكرة</label>
          <input type="text" id="edit-idea-title" class="form-control" value="${idea.title}">
        </div>
        <div class="form-group">
          <label class="form-label">التصنيف</label>
          <input type="text" id="edit-idea-category" class="form-control" value="${idea.category || ''}">
        </div>
        <div class="form-group">
          <label class="form-label required">تفاصيل الفكرة</label>
          <textarea id="edit-idea-content" class="form-control" rows="5">${idea.content}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="IdeasModule.updateIdea('${id}')">حفظ التغييرات</button>
      </div>
    `;
    openModal(content);
  },

  updateIdea(id) {
    const title = document.getElementById('edit-idea-title')?.value?.trim();
    const content = document.getElementById('edit-idea-content')?.value?.trim();
    if (!title || !content) { Toast.show('يرجى ملء جميع الحقول المطلوبة', 'error'); return; }

    const ideas = DB.getIdeas();
    const idea = ideas.find(x => x.id === id);
    if (idea) {
      idea.title = title;
      idea.category = document.getElementById('edit-idea-category')?.value?.trim() || 'عام';
      idea.content = content;
      DB.saveIdeas(ideas);
      closeTopModal();
      Toast.show('تم تحديث الفكرة!', 'success');
      renderModule('ideas');
    }
  }
};
