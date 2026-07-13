/**
 * LIFE OS — Relationships Module (إدارة العلاقات الشخصية والمهنية)
 * Categories, Contact Logs, Birthday & Follow-up Reminders, and Search & Filter.
 */

const RelationshipsModule = {
  state: {
    searchQuery: '',
    selectedCategory: 'all', // all | family | friends | university | work | networking | mentors | partner
  },

  categories: {
    family:     { ar: 'العائلة', icon: '👨‍👩‍👧', color: 'rose' },
    friends:    { ar: 'الأصدقاء', icon: '🤝', color: 'green' },
    university: { ar: 'الجامعة', icon: '🏫', color: 'blue' },
    work:       { ar: 'العمل', icon: '💼', color: 'indigo' },
    networking: { ar: 'شبكة العلاقات', icon: '🌐', color: 'cyan' },
    mentors:    { ar: 'الموجهون', icon: '👨‍🏫', color: 'purple' },
    partner:    { ar: 'شريك المستقبل', icon: '💖', color: 'amber' }
  },

  render(container) {
    const contacts = DB.getRelationships();
    
    // ── Pre-calculate Dashboard Alerts ──
    const dashboardAlerts = this.getDashboardAlerts(contacts);

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">👥 شبكة العلاقات الشخصية</h1>
            <p class="page-subtitle">حافظ على تواصلك مع عائلتك، أصدقائك، وزملائك المهنيين ولا تنس المناسبات الهامة</p>
          </div>
          <button class="btn btn-primary" onclick="RelationshipsModule.openAddContactModal()">
            <i data-lucide="plus" style="width:16px;height:16px;"></i> إضافة جهة اتصال
          </button>
        </div>

        <!-- Dashboard Alerts Section (Upcoming Birthdays & Reminders) -->
        ${this.renderDashboardAlerts(dashboardAlerts)}

        <!-- Filter and Search Controls -->
        <div style="display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-5); flex-wrap:wrap;">
          <div class="tabs" style="max-width:800px; flex:1; min-width:300px;">
            <div class="tab-item ${this.state.selectedCategory==='all'?'active':''}" onclick="RelationshipsModule.setCategory('all')">الكل</div>
            ${Object.entries(this.categories).map(([key, cat]) => `
              <div class="tab-item ${this.state.selectedCategory===key?'active':''}" onclick="RelationshipsModule.setCategory('${key}')">
                ${cat.icon} ${cat.ar}
              </div>
            `).join('')}
          </div>
          <div style="min-width:260px;">
            <input type="text" class="form-control" placeholder="🔍 ابحث بالاسم أو رقم الهاتف..."
                   value="${this.state.searchQuery}"
                   oninput="RelationshipsModule.search(this.value)">
          </div>
        </div>

        <!-- Contacts Grid -->
        <div id="contacts-grid-area">
          ${this.renderContactsList(contacts)}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  setCategory(cat) {
    this.state.selectedCategory = cat;
    this.refreshGrid();
  },

  search(query) {
    this.state.searchQuery = query;
    this.refreshGrid();
  },

  refreshGrid() {
    const grid = document.getElementById('contacts-grid-area');
    if (grid) {
      const contacts = DB.getRelationships();
      grid.innerHTML = this.renderContactsList(contacts);
      if (window.lucide) lucide.createIcons();
    }
  },

  getDashboardAlerts(contacts) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBirthdays = [];
    const followupsNeeded = [];

    contacts.forEach(c => {
      // 1. Birthday checks (within next 30 days)
      if (c.birthday) {
        const bdate = new Date(c.birthday);
        const nextb = new Date(today.getFullYear(), bdate.getMonth(), bdate.getDate());
        if (nextb < today) nextb.setFullYear(today.getFullYear() + 1);
        
        const daysLeft = Math.ceil((nextb - today) / (1000 * 60 * 60 * 24));
        if (daysLeft === 0 || daysLeft <= 30) {
          upcomingBirthdays.push({ contact: c, daysLeft });
        }
      }

      // 2. Contact follow-up check (reminder is today/past, OR last contact was > 14 days ago)
      let needsContact = false;
      let reason = '';

      if (c.nextReminder) {
        const remDate = new Date(c.nextReminder);
        if (remDate <= today) {
          needsContact = true;
          reason = 'موعد التذكير المحدد حان أو فات';
        }
      } else if (c.lastContactDate) {
        const lastc = new Date(c.lastContactDate);
        const daysSince = Math.floor((today - lastc) / (1000 * 60 * 60 * 24));
        if (daysSince > 14) {
          needsContact = true;
          reason = `لم تتواصل معه منذ ${toArabicNumerals(daysSince)} يوماً`;
        }
      }

      if (needsContact) {
        followupsNeeded.push({ contact: c, reason });
      }
    });

    // Sort birthdays by days left ascending
    upcomingBirthdays.sort((a, b) => a.daysLeft - b.daysLeft);

    return { upcomingBirthdays, followupsNeeded };
  },

  renderDashboardAlerts(alerts) {
    if (alerts.upcomingBirthdays.length === 0 && alerts.followupsNeeded.length === 0) {
      return '';
    }

    return `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4); margin-bottom:var(--space-6); flex-wrap:wrap;">
        
        <!-- Upcoming Birthdays Card -->
        <div class="card" style="padding:var(--space-4); border-top:3px solid var(--accent-rose);">
          <h3 style="font-size:var(--font-size-sm); font-weight:700; margin-bottom:var(--space-3); color:var(--text-primary); display:flex; align-items:center; gap:6px;">
            🎂 أعياد ميلاد قادمة (خلال ٣٠ يوماً)
          </h3>
          <div style="display:flex; flex-direction:column; gap:8px; max-height:150px; overflow-y:auto; padding-left:4px;">
            ${alerts.upcomingBirthdays.length === 0 
              ? `<p style="font-size:var(--font-size-xs); color:var(--text-muted); font-style:italic;">لا توجد أعياد ميلاد قريبة.</p>`
              : alerts.upcomingBirthdays.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-secondary); padding:var(--space-2) var(--space-3); border-radius:var(--radius-sm); font-size:var(--font-size-xs);">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:700;">${item.contact.name}</span>
                    <span class="badge badge-rose" style="font-size:9px;">${this.categories[item.contact.category]?.ar || ''}</span>
                  </div>
                  <span style="color:var(--accent-rose); font-weight:700;">
                    ${item.daysLeft === 0 ? '🎉 اليوم!' : `بعد ${toArabicNumerals(item.daysLeft)} يوم`}
                  </span>
                </div>
              `).join('')
            }
          </div>
        </div>

        <!-- Followups Needed Card -->
        <div class="card" style="padding:var(--space-4); border-top:3px solid var(--accent-amber);">
          <h3 style="font-size:var(--font-size-sm); font-weight:700; margin-bottom:var(--space-3); color:var(--text-primary); display:flex; align-items:center; gap:6px;">
            ⏳ جهات تواصل تحتاج لمتابعة
          </h3>
          <div style="display:flex; flex-direction:column; gap:8px; max-height:150px; overflow-y:auto; padding-left:4px;">
            ${alerts.followupsNeeded.length === 0 
              ? `<p style="font-size:var(--font-size-xs); color:var(--text-muted); font-style:italic;">أنت على تواصل جيد مع الجميع!</p>`
              : alerts.followupsNeeded.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-secondary); padding:var(--space-2) var(--space-3); border-radius:var(--radius-sm); font-size:var(--font-size-xs);">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:700;">${item.contact.name}</span>
                    <span style="color:var(--text-muted); font-size:10px;">(${item.reason})</span>
                  </div>
                  <button class="btn btn-ghost btn-xs" onclick="RelationshipsModule.logContactToday('${item.contact.id}')" style="color:var(--accent-amber); font-weight:bold; border-radius:var(--radius-sm);">
                    🤝 سجّل تواصل اليوم
                  </button>
                </div>
              `).join('')
            }
          </div>
        </div>

      </div>
    `;
  },

  renderContactsList(contacts) {
    let filtered = contacts;

    // Apply category filter
    if (this.state.selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === this.state.selectedCategory);
    }

    // Apply search filter
    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(q) || 
        c.phone?.includes(q) ||
        c.notes?.toLowerCase().includes(q)
      );
    }

    // Sort: favorites first, then by name
    filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name, 'ar');
    });

    if (filtered.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="users" style="width:36px;height:36px;"></i></div>
          <h3>لا توجد جهات اتصال مطابقة</h3>
          <p>أضف جهات اتصال جديدة أو غيّر خيارات البحث والترشيح.</p>
          <button class="btn btn-primary" onclick="RelationshipsModule.openAddContactModal()">إضافة جهة اتصال</button>
        </div>
      `;
    }

    return `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:var(--space-4);">
        ${filtered.map(c => this.renderContactCard(c)).join('')}
      </div>
    `;
  },

  renderContactCard(c) {
    const cat = this.categories[c.category] || { ar: 'أخرى', icon: '📌', color: 'gray' };
    
    // Letter avatar if no image
    const initials = c.name ? c.name.split(' ').map(n=>n[0]).slice(0, 2).join('') : '👤';
    const hasImage = !!c.image;

    return `
      <div class="card animate-fade-in" style="position:relative; padding:var(--space-4); display:flex; flex-direction:column; justify-content:space-between; min-height:220px; transition:all 0.2s;">
        <!-- Favorite Star -->
        <button onclick="RelationshipsModule.toggleFavorite('${c.id}')" style="position:absolute; top:12px; left:12px; border:none; background:none; cursor:pointer; font-size:20px; color:${c.isFavorite ? 'var(--accent-amber)' : 'var(--text-muted)'}; padding:0;">
          ${c.isFavorite ? '★' : '☆'}
        </button>

        <div style="display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-3);">
          <!-- Avatar -->
          <div style="width:52px; height:52px; border-radius:var(--radius-full); overflow:hidden; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; background:rgba(124, 58, 237, 0.08); flex-shrink:0;">
            ${hasImage 
              ? `<img src="${c.image}" style="width:100%; height:100%; object-fit:cover;">`
              : `<span style="font-weight:800; font-size:16px; color:var(--accent-purple-light);">${initials}</span>`
            }
          </div>

          <div>
            <h4 style="font-size:var(--font-size-sm); font-weight:800; color:var(--text-primary); margin:0;">${c.name}</h4>
            <div style="display:flex; gap:4px; align-items:center; margin-top:2px;">
              <span style="font-size:10px;" class="badge badge-${cat.color}">${cat.icon} ${cat.ar}</span>
            </div>
          </div>
        </div>

        <!-- Phone & Details -->
        <div style="font-size:var(--font-size-xs); color:var(--text-secondary); display:flex; flex-direction:column; gap:4px; margin-bottom:var(--space-3); flex:1;">
          ${c.phone ? `<div>📞 <strong>رقم الهاتف:</strong> <a href="tel:${c.phone}" style="color:var(--text-secondary);">${c.phone}</a></div>` : ''}
          ${c.birthday ? `<div>🎂 <strong>تاريخ الميلاد:</strong> ${formatDateAr(new Date(c.birthday), 'short')}</div>` : ''}
          ${c.lastContactDate ? `<div>🤝 <strong>آخر تواصل:</strong> ${formatDateAr(new Date(c.lastContactDate), 'short')}</div>` : ''}
          ${c.notes ? `<div style="font-style:italic; color:var(--text-muted); margin-top:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">📝 ${c.notes}</div>` : ''}
        </div>

        <!-- Action Row -->
        <div style="display:flex; gap:var(--space-2); border-top:1px solid var(--border-subtle); padding-top:var(--space-3); margin-top:auto;">
          <button class="btn btn-secondary btn-xs" onclick="RelationshipsModule.openEditContactModal('${c.id}')" style="flex:1;">تعديل</button>
          <button class="btn btn-ghost btn-xs" onclick="RelationshipsModule.deleteContact('${c.id}')" style="color:var(--accent-rose); border:1px solid rgba(244,63,94,0.1); padding:4px 6px;">حذف</button>
          <button class="btn btn-primary btn-xs" onclick="RelationshipsModule.logContactToday('${c.id}')" title="تحديث آخر تواصل لليوم">🤝 تواصلت اليوم</button>
        </div>
      </div>
    `;
  },

  openAddContactModal() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">👥 إضافة جهة اتصال جديدة</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body" style="gap:var(--space-3);">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">الاسم الكامل</label>
            <input type="text" id="contact-name" class="form-control" placeholder="اسم الشخص..." autofocus>
          </div>
          <div class="form-group">
            <label class="form-label required">التصنيف</label>
            <select id="contact-category" class="form-control">
              ${Object.entries(this.categories).map(([key, cat]) => `<option value="${key}">${cat.icon} ${cat.ar}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">رقم الهاتف</label>
            <input type="text" id="contact-phone" class="form-control" placeholder="رقم الموبايل...">
          </div>
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني (اختياري)</label>
            <input type="email" id="contact-email" class="form-control" placeholder="example@mail.com">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">تاريخ الميلاد</label>
            <input type="date" id="contact-birthday" class="form-control">
          </div>
          <div class="form-group">
            <label class="form-label">تواريخ هامة أخرى</label>
            <input type="text" id="contact-important-dates" class="form-control" placeholder="مثال: ذكرى التخرج، زواج...">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">تاريخ آخر تواصل</label>
            <input type="date" id="contact-last-contact" class="form-control" value="${todayKey()}">
          </div>
          <div class="form-group">
            <label class="form-label">تاريخ التذكير القادم</label>
            <input type="date" id="contact-next-reminder" class="form-control">
          </div>
        </div>

        <!-- Image Upload -->
        <div class="form-group">
          <label class="form-label">صورة جهة الاتصال (اختيارية)</label>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <input type="file" id="contact-image-input" accept="image/*" style="display:none;" onchange="RelationshipsModule.handleImageUpload(this, 'contact-image-preview', 'contact-image-data')">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('contact-image-input').click()" style="align-self:flex-start; display:flex; align-items:center; gap:6px;">
              <i data-lucide="image" style="width:16px;height:16px;"></i> رفع صورة
            </button>
            <input type="hidden" id="contact-image-data" value="">
            <div id="contact-image-preview" style="margin-top:var(--space-2); display:none; position:relative; width:80px; height:80px; border-radius:var(--radius-full); overflow:hidden; border:1px solid var(--border);">
              <!-- Preview -->
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">ملاحظات ومعلومات إضافية</label>
          <textarea id="contact-notes" class="form-control" rows="3" placeholder="ملاحظات حول اهتماماته، مكان السكن، أفكار للتواصل..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="RelationshipsModule.saveContact()">💾 حفظ جهة الاتصال</button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
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
        const max_size = 200; // max size in px for avatars

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

        // Compress to JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        document.getElementById(dataId).value = compressedBase64;

        const previewEl = document.getElementById(previewId);
        previewEl.innerHTML = `<img src="${compressedBase64}" style="width:100%; height:100%; object-fit:cover;">`;
        previewEl.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  saveContact() {
    const name = document.getElementById('contact-name')?.value?.trim();
    const phone = document.getElementById('contact-phone')?.value?.trim();
    const category = document.getElementById('contact-category')?.value;

    if (!name || !phone) {
      Toast.show('الرجاء إدخال الاسم ورقم الهاتف على الأقل.', 'error');
      return;
    }

    const contacts = DB.getRelationships();
    contacts.push({
      id: generateId(),
      name,
      phone,
      category,
      email: document.getElementById('contact-email')?.value?.trim() || '',
      birthday: document.getElementById('contact-birthday')?.value || '',
      importantDates: document.getElementById('contact-important-dates')?.value?.trim() || '',
      lastContactDate: document.getElementById('contact-last-contact')?.value || '',
      nextReminder: document.getElementById('contact-next-reminder')?.value || '',
      image: document.getElementById('contact-image-data')?.value || '',
      notes: document.getElementById('contact-notes')?.value?.trim() || '',
      isFavorite: false,
      createdAt: new Date().toISOString()
    });

    DB.saveRelationships(contacts);
    closeTopModal();
    Toast.show('تمت إضافة جهة الاتصال بنجاح! 👥', 'success');
    this.render(document.getElementById('module-content'));
  },

  openEditContactModal(contactId) {
    const contacts = DB.getRelationships();
    const c = contacts.find(x => x.id === contactId);
    if (!c) return;

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">📝 تعديل جهة اتصال</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body" style="gap:var(--space-3);">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">الاسم الكامل</label>
            <input type="text" id="edit-contact-name" class="form-control" value="${c.name || ''}">
          </div>
          <div class="form-group">
            <label class="form-label required">التصنيف</label>
            <select id="edit-contact-category" class="form-control">
              ${Object.entries(this.categories).map(([key, cat]) => `<option value="${key}" ${c.category===key?'selected':''}>${cat.icon} ${cat.ar}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">رقم الهاتف</label>
            <input type="text" id="edit-contact-phone" class="form-control" value="${c.phone || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني</label>
            <input type="email" id="edit-contact-email" class="form-control" value="${c.email || ''}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">تاريخ الميلاد</label>
            <input type="date" id="edit-contact-birthday" class="form-control" value="${c.birthday || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">تواريخ هامة</label>
            <input type="text" id="edit-contact-important-dates" class="form-control" value="${c.importantDates || ''}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">تاريخ آخر تواصل</label>
            <input type="date" id="edit-contact-last-contact" class="form-control" value="${c.lastContactDate || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">التذكير القادم</label>
            <input type="date" id="edit-contact-next-reminder" class="form-control" value="${c.nextReminder || ''}">
          </div>
        </div>

        <!-- Image Upload -->
        <div class="form-group">
          <label class="form-label">تعديل الصورة</label>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <input type="file" id="edit-contact-image-input" accept="image/*" style="display:none;" onchange="RelationshipsModule.handleImageUpload(this, 'edit-contact-image-preview', 'edit-contact-image-data')">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('edit-contact-image-input').click()" style="align-self:flex-start; display:flex; align-items:center; gap:6px;">
              <i data-lucide="image" style="width:16px;height:16px;"></i> تغيير الصورة
            </button>
            <input type="hidden" id="edit-contact-image-data" value="${c.image || ''}">
            <div id="edit-contact-image-preview" style="margin-top:var(--space-2); ${c.image?'':'display:none;'} position:relative; width:80px; height:80px; border-radius:var(--radius-full); overflow:hidden; border:1px solid var(--border);">
              ${c.image ? `<img src="${c.image}" style="width:100%; height:100%; object-fit:cover;">` : ''}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">ملاحظات ومعلومات إضافية</label>
          <textarea id="edit-contact-notes" class="form-control" rows="3">${c.notes || ''}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="RelationshipsModule.updateContact('${c.id}')">💾 حفظ التغييرات</button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
  },

  updateContact(contactId) {
    const contacts = DB.getRelationships();
    const c = contacts.find(x => x.id === contactId);
    if (!c) return;

    const name = document.getElementById('edit-contact-name')?.value?.trim();
    const phone = document.getElementById('edit-contact-phone')?.value?.trim();

    if (!name || !phone) {
      Toast.show('الاسم ورقم الهاتف مطلوبين.', 'error');
      return;
    }

    c.name = name;
    c.phone = phone;
    c.category = document.getElementById('edit-contact-category')?.value;
    c.email = document.getElementById('edit-contact-email')?.value?.trim() || '';
    c.birthday = document.getElementById('edit-contact-birthday')?.value || '';
    c.importantDates = document.getElementById('edit-contact-important-dates')?.value?.trim() || '';
    c.lastContactDate = document.getElementById('edit-contact-last-contact')?.value || '';
    c.nextReminder = document.getElementById('edit-contact-next-reminder')?.value || '';
    c.image = document.getElementById('edit-contact-image-data')?.value || '';
    c.notes = document.getElementById('edit-contact-notes')?.value?.trim() || '';

    DB.saveRelationships(contacts);
    closeTopModal();
    Toast.show('تم تحديث جهة الاتصال بنجاح!', 'success');
    this.render(document.getElementById('module-content'));
  },

  deleteContact(contactId) {
    if (!confirm('هل أنت متأكد من حذف جهة الاتصال هذه نهائياً؟')) return;
    let contacts = DB.getRelationships();
    contacts = contacts.filter(x => x.id !== contactId);
    DB.saveRelationships(contacts);
    Toast.show('تم حذف جهة الاتصال.', 'info');
    this.render(document.getElementById('module-content'));
  },

  toggleFavorite(contactId) {
    const contacts = DB.getRelationships();
    const c = contacts.find(x => x.id === contactId);
    if (c) {
      c.isFavorite = !c.isFavorite;
      DB.saveRelationships(contacts);
      Toast.show(c.isFavorite ? '★ تمت الإضافة للمفضلة' : 'تمت الإزالة من المفضلة', 'info');
      this.render(document.getElementById('module-content'));
    }
  },

  logContactToday(contactId) {
    const contacts = DB.getRelationships();
    const c = contacts.find(x => x.id === contactId);
    if (c) {
      c.lastContactDate = todayKey();
      // Clear next reminder since they just contacted
      c.nextReminder = '';
      DB.saveRelationships(contacts);
      Toast.show('تم تسجيل تواصل اليوم بنجاح! 🤝', 'success');
      this.render(document.getElementById('module-content'));
    }
  }
};
