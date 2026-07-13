/**
 * LIFE OS — Journal Module
 * Daily, Weekly, Monthly, Yearly entries with mood & tags
 */

const JournalModule = {
  state: {
    view: 'list',
    type: 'daily',
    editingId: null,
    searchQuery: '',
  },

  render(container) {
    const entries = DB.getJournalEntries();
    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">📔 اليوميات</h1>
            <p class="page-subtitle">سجّل أفكارك ومشاعرك ومسيرة حياتك</p>
          </div>
          <button class="btn btn-primary" onclick="JournalModule.openNewEntry()">
            <i data-lucide="plus" style="width:16px;height:16px;"></i>
            كتابة جديدة
          </button>
        </div>

        <!-- Filter Row -->
        <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);flex-wrap:wrap;">
          <div class="tabs" style="max-width:450px;">
            <div class="tab-item ${this.state.type==='daily'?'active':''}" onclick="JournalModule.setType('daily')">يومي</div>
            <div class="tab-item ${this.state.type==='weekly'?'active':''}" onclick="JournalModule.setType('weekly')">أسبوعي</div>
            <div class="tab-item ${this.state.type==='monthly'?'active':''}" onclick="JournalModule.setType('monthly')">شهري</div>
            <div class="tab-item ${this.state.type==='yearly'?'active':''}" onclick="JournalModule.setType('yearly')">سنوي</div>
          </div>
          <div style="flex:1;min-width:200px;">
            <input type="text" class="form-control" placeholder="🔍 البحث في اليوميات..."
                   value="${this.state.searchQuery}"
                   oninput="JournalModule.search(this.value)">
          </div>
        </div>

        <!-- Journal Grid -->
        <div id="journal-content">
          ${this.renderList()}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  setType(type) {
    this.state.type = type;
    document.querySelectorAll('.tab-item').forEach((el, i) => {
      const types = ['daily','weekly','monthly','yearly'];
      el.classList.toggle('active', types[i] === type);
    });
    this.refreshContent();
  },

  search(q) {
    this.state.searchQuery = q;
    this.refreshContent();
  },

  refreshContent() {
    const c = document.getElementById('journal-content');
    if (c) {
      c.innerHTML = this.renderList();
      if (window.lucide) lucide.createIcons();
    }
  },

  renderList() {
    let entries = DB.getJournalEntries()
      .filter(e => e.type === this.state.type)
      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      entries = entries.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.content?.toLowerCase().includes(q) ||
        e.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (entries.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="book-open" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد إدخالات</h3>
          <p>ابدأ بتسجيل أفكارك ومشاعرك</p>
          <button class="btn btn-primary" onclick="JournalModule.openNewEntry()">كتابة جديدة</button>
        </div>
      `;
    }

    return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:var(--space-4);">
      ${entries.map(entry => this.renderEntryCard(entry)).join('')}
    </div>`;
  },

  renderEntryCard(entry) {
    const mood = MOODS.find(m => m.id === entry.mood);
    return `
      <div class="journal-entry animate-fade-in" onclick="JournalModule.openEntry('${entry.id}')" style="display:flex; flex-direction:column; justify-content:space-between; min-height:180px;">
        <div>
          ${entry.image ? `
            <div style="margin:-15px -15px 12px -15px; overflow:hidden; border-radius:var(--radius-xl) var(--radius-xl) 0 0; height:120px;">
              <img src="${entry.image}" style="width:100%; height:100%; object-fit:cover;">
            </div>
          ` : ''}
          <div class="journal-entry-date">${formatDateAr(new Date(entry.createdAt), 'short')}</div>
          <div class="journal-entry-title" style="margin-bottom:var(--space-2);">${entry.title || 'بدون عنوان'}</div>
          <div class="journal-entry-preview" style="margin-bottom:var(--space-3);">${entry.content || ''}</div>
        </div>
        <div class="journal-entry-footer">
          <div style="display:flex;align-items:center;gap:var(--space-2);">
            ${mood ? `<span class="journal-mood-display">${mood.emoji}</span>` : ''}
            ${entry.isFavorite ? `<span style="color:var(--accent-amber);">⭐</span>` : ''}
          </div>
          <div class="journal-tags">
            ${(entry.tags || []).slice(0,2).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  },

  openNewEntry() {
    this.state.editingId = null;
    const today = formatDateAr(new Date(), 'full');
    const defaultTitle = `${today}`;

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">✍️ كتابة جديدة</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div class="modal-body" style="gap:var(--space-3);">
        <div class="form-group">
          <input type="text" id="journal-title" class="form-control"
                 style="font-size:var(--font-size-lg);font-weight:700;"
                 placeholder="عنوان الإدخال..." value="${defaultTitle}">
        </div>

        <!-- Type & Date & Mood -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">النوع</label>
            <select id="journal-type" class="form-control">
              <option value="daily" ${this.state.type==='daily'?'selected':''}>يومي</option>
              <option value="weekly" ${this.state.type==='weekly'?'selected':''}>أسبوعي</option>
              <option value="monthly" ${this.state.type==='monthly'?'selected':''}>شهري</option>
              <option value="yearly" ${this.state.type==='yearly'?'selected':''}>سنوي</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">المزاج</label>
            <div class="mood-selector" style="display:flex; gap:6px; flex-wrap:wrap;">
              ${MOODS.map(m => `
                <div class="mood-btn" id="mood-${m.id}" onclick="JournalModule.selectMood(${m.id})" style="cursor:pointer; padding:6px 10px; border-radius:var(--radius-md); border:1px solid var(--border); display:flex; align-items:center; gap:4px; font-size:var(--font-size-sm); transition:all 0.2s;">
                  ${m.emoji}
                  <span>${m.ar}</span>
                </div>
              `).join('')}
            </div>
            <input type="hidden" id="journal-mood" value="">
          </div>
        </div>

        <!-- Content -->
        <div class="form-group">
          <label class="form-label required">المحتوى</label>
          <textarea id="new-journal-content" class="form-control"
                    style="min-height:180px;line-height:1.8;resize:vertical;"
                    placeholder="اكتب ما يدور في ذهنك وقلبك..."></textarea>
        </div>

        <!-- Image Upload -->
        <div class="form-group">
          <label class="form-label">إضافة صورة (اختياري)</label>
          <div class="image-uploader-wrapper" style="display:flex; flex-direction:column; gap:8px;">
            <input type="file" id="journal-image-input" accept="image/*" style="display:none;" onchange="JournalModule.handleImageUpload(this, 'journal-image-preview', 'journal-image-data')">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('journal-image-input').click()" style="align-self:flex-start; display:flex; align-items:center; gap:6px;">
              <i data-lucide="image" style="width:16px;height:16px;"></i> اختر صورة من الجهاز
            </button>
            <input type="hidden" id="journal-image-data" value="">
            <div id="journal-image-preview" style="margin-top:var(--space-2); display:none; position:relative; max-width:260px; border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--border);">
              <!-- Preview will be injected here -->
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="form-group">
          <label class="form-label">الوسوم</label>
          <input type="text" id="journal-tags" class="form-control"
                 placeholder="افصل الوسوم بفاصلة: حياة، تأمل، إنجاز">
        </div>

        <div style="display:flex;align-items:center;gap:var(--space-3); margin-top:var(--space-2);">
          <label class="checkbox-wrapper" style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" id="journal-favorite" style="width:16px; height:16px;">
            <span style="font-size:var(--font-size-sm); font-weight:600;">⭐ إضافة للمفضلة</span>
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="JournalModule.saveEntry()">
          <i data-lucide="save" style="width:16px;height:16px;"></i>
          حفظ اليوميات
        </button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
  },

  selectMood(moodId) {
    document.getElementById('journal-mood').value = moodId;
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.style.borderColor = 'var(--border)';
      btn.style.backgroundColor = 'transparent';
    });
    const selectedBtn = document.getElementById(`mood-${moodId}`);
    if (selectedBtn) {
      selectedBtn.style.borderColor = 'var(--accent-purple)';
      selectedBtn.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
    }
  },

  handleImageUpload(input, previewId, dataId) {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 800; // max size in px

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        // Save to hidden input
        document.getElementById(dataId).value = compressedBase64;

        // Show preview
        const previewEl = document.getElementById(previewId);
        previewEl.innerHTML = `
          <img src="${compressedBase64}" style="width:100%; display:block; object-fit:contain;">
          <button type="button" class="btn btn-danger btn-xs" onclick="JournalModule.removeImage('${previewId}', '${dataId}')" style="position:absolute; top:8px; right:8px; padding:4px 8px; font-size:10px; font-weight:bold; border-radius:var(--radius-sm);">حذف الصورة</button>
        `;
        previewEl.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  removeImage(previewId, dataId) {
    document.getElementById(dataId).value = '';
    const previewEl = document.getElementById(previewId);
    previewEl.innerHTML = '';
    previewEl.style.display = 'none';
  },

  saveEntry() {
    const title = document.getElementById('journal-title')?.value?.trim();
    const content = document.getElementById('new-journal-content')?.value?.trim();
    if (!content) { Toast.show('الرجاء كتابة المحتوى', 'error'); return; }

    const entries = DB.getJournalEntries();
    const tagsStr = document.getElementById('journal-tags')?.value || '';
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const image = document.getElementById('journal-image-data')?.value || '';

    entries.push({
      id: generateId(),
      title: title || formatDateAr(new Date(), 'short'),
      content,
      type: document.getElementById('journal-type')?.value || 'daily',
      mood: parseInt(document.getElementById('journal-mood')?.value) || null,
      tags,
      image,
      isFavorite: document.getElementById('journal-favorite')?.checked || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    DB.saveJournalEntries(entries);
    closeTopModal();
    Toast.show('تم حفظ الإدخال بنجاح! 📔', 'success');
    this.refreshContent();
  },

  openEntry(entryId) {
    const entries = DB.getJournalEntries();
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    const mood = MOODS.find(m => m.id === entry.mood);

    const content = `
      <div class="modal-header">
        <div>
          <div style="font-size:var(--font-size-xs);color:var(--accent-purple-light);font-weight:700;">
            ${formatDateAr(new Date(entry.createdAt), 'full')}
          </div>
          <h3 class="modal-title" style="margin-top:4px;">${entry.title || 'بدون عنوان'}</h3>
        </div>
        <div style="display:flex;gap:var(--space-2); align-items:center;">
          <button class="btn btn-secondary btn-sm" onclick="JournalModule.editEntry('${entry.id}')">تعديل</button>
          <button class="btn btn-ghost btn-icon" onclick="closeTopModal()">
            <i data-lucide="x" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:var(--space-4);">
        ${entry.image ? `
          <div style="text-align:center; overflow:hidden; border-radius:var(--radius-lg); max-height:350px; border:1px solid var(--border);">
            <img src="${entry.image}" style="max-width:100%; max-height:350px; object-fit:contain; display:block; margin:0 auto;">
          </div>
        ` : ''}
        ${mood ? `
          <div style="display:flex; align-items:center; gap:8px; padding:var(--space-2) var(--space-3); background:var(--bg-secondary); border-radius:var(--radius-md); align-self:flex-start;">
            <span style="font-size:24px;">${mood.emoji}</span>
            <span style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${mood.ar}</span>
          </div>
        ` : ''}
        <div style="font-size:var(--font-size-base);color:var(--text-primary);line-height:1.8;white-space:pre-wrap;text-align:justify;">${entry.content}</div>
        
        ${entry.tags?.length ? `
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-top:var(--space-2);">
            ${entry.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-danger" onclick="JournalModule.deleteEntry('${entry.id}')">حذف</button>
        <button class="btn btn-secondary" onclick="closeTopModal()">إغلاق</button>
        <button class="btn btn-${entry.isFavorite ? 'amber' : 'ghost'}" onclick="JournalModule.toggleFavorite('${entry.id}')">
          ${entry.isFavorite ? '⭐ في المفضلة' : '☆ إضافة للمفضلة'}
        </button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
  },

  editEntry(entryId) {
    closeTopModal();
    const entries = DB.getJournalEntries();
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تعديل اليوميات 📝</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div class="modal-body" style="gap:var(--space-3);">
        <div class="form-group">
          <label class="form-label required">العنوان</label>
          <input type="text" id="edit-journal-title" class="form-control"
                 style="font-size:var(--font-size-lg);font-weight:700;"
                 value="${entry.title || ''}">
        </div>
        <div class="form-group">
          <label class="form-label required">المحتوى</label>
          <textarea id="edit-journal-content" class="form-control"
                    style="min-height:220px;line-height:1.8;resize:vertical;">${entry.content || ''}</textarea>
        </div>

        <!-- Image Edit -->
        <div class="form-group">
          <label class="form-label">تعديل الصورة</label>
          <div class="image-uploader-wrapper" style="display:flex; flex-direction:column; gap:8px;">
            <input type="file" id="edit-journal-image-input" accept="image/*" style="display:none;" onchange="JournalModule.handleImageUpload(this, 'edit-journal-image-preview', 'edit-journal-image-data')">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('edit-journal-image-input').click()" style="align-self:flex-start; display:flex; align-items:center; gap:6px;">
              <i data-lucide="image" style="width:16px;height:16px;"></i> تغيير الصورة
            </button>
            <input type="hidden" id="edit-journal-image-data" value="${entry.image || ''}">
            <div id="edit-journal-image-preview" style="margin-top:var(--space-2); ${entry.image ? '' : 'display:none;'} position:relative; max-width:260px; border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--border);">
              ${entry.image ? `
                <img src="${entry.image}" style="width:100%; display:block; object-fit:contain;">
                <button type="button" class="btn btn-danger btn-xs" onclick="JournalModule.removeImage('edit-journal-image-preview', 'edit-journal-image-data')" style="position:absolute; top:8px; right:8px; padding:4px 8px; font-size:10px; font-weight:bold; border-radius:var(--radius-sm);">حذف الصورة</button>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">الوسوم</label>
          <input type="text" id="edit-journal-tags" class="form-control" value="${(entry.tags||[]).join(', ')}">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="JournalModule.updateEntry('${entryId}')">حفظ التغييرات</button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
  },

  updateEntry(entryId) {
    const entries = DB.getJournalEntries();
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const title = document.getElementById('edit-journal-title')?.value?.trim();
    const content = document.getElementById('edit-journal-content')?.value?.trim();
    if (!content) { Toast.show('الرجاء كتابة المحتوى', 'error'); return; }

    entry.title = title || formatDateAr(new Date(entry.createdAt), 'short');
    entry.content = content;
    const tagsStr = document.getElementById('edit-journal-tags')?.value || '';
    entry.tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    entry.image = document.getElementById('edit-journal-image-data')?.value || '';
    entry.updatedAt = new Date().toISOString();

    DB.saveJournalEntries(entries);
    closeTopModal();
    Toast.show('تم تحديث الإدخال بنجاح!', 'success');
    this.refreshContent();
  },

  deleteEntry(entryId) {
    if (!confirm('هل أنت متأكد من حذف هذا الإدخال نهائياً؟')) return;
    let entries = DB.getJournalEntries();
    entries = entries.filter(e => e.id !== entryId);
    DB.saveJournalEntries(entries);
    closeTopModal();
    Toast.show('تم حذف الإدخال بنجاح', 'info');
    this.refreshContent();
  },

  toggleFavorite(entryId) {
    const entries = DB.getJournalEntries();
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      entry.isFavorite = !entry.isFavorite;
      DB.saveJournalEntries(entries);
      closeTopModal();
      Toast.show(entry.isFavorite ? '⭐ أضيف للمفضلة!' : 'تم الحذف من المفضلة', 'info');
      this.refreshContent();
    }
  },
};
