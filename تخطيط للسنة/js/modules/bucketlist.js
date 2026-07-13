/**
 * LIFE OS — Bucket List Module
 * Things to accomplish before I die: Priority, Category, Deadline (optional), completed status
 */

const BucketListModule = {
  render(container) {
    const items = DB.getBucketList().sort((a,b) => a.completed - b.completed || b.priority.localeCompare(a.priority));
    const completedCount = items.filter(x => x.completed).length;

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">🪂 قائمة الأمنيات (Bucket List)</h1>
            <p class="page-subtitle">أشياء تريد إنجازها وتجربتها طوال حياتك</p>
          </div>
          <button class="btn btn-primary" onclick="BucketListModule.openAddItem()">+ إضافة أمنية</button>
        </div>

        <!-- Completion Progress -->
        <div class="card" style="margin-bottom:var(--space-6); background:linear-gradient(135deg, rgba(6,182,212,0.1), rgba(124,58,237,0.05));">
          <div style="display:flex; align-items:center; gap:var(--space-4);">
            <div style="font-size:36px;">🌅</div>
            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:var(--font-size-sm); margin-bottom:var(--space-2);">
                <span style="font-weight:700; color:var(--text-primary);">نسبة تحقيق أمنيات الحياة</span>
                <span>${toArabicNumerals(completedCount)} / ${toArabicNumerals(items.length)} أمنية</span>
              </div>
              <div class="progress-bar thick">
                <div class="progress-fill hero" style="width:${items.length > 0 ? (completedCount/items.length)*100 : 0}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bucket List Items -->
        ${items.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="compass" style="width:32px;height:32px;"></i></div>
            <h3>قائمتك فارغة تماماً</h3>
            <p>ابدأ بكتابة قائمة أهدافك وأمنياتك الكبرى في الحياة (السفر، المهارات، التجارب...).</p>
            <button class="btn btn-primary" onclick="BucketListModule.openAddItem()">أضف أمنية الآن</button>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:var(--space-3);">
            ${items.map(item => {
              const priorityLabels = { high: '🔴 عالية', medium: '🟡 متوسطة', low: '🟢 منخفضة' };
              const catInfo = CATEGORIES.find(c => c.id === item.category) || { icon: '📌', ar: 'أخرى' };
              
              return `
                <div class="bucket-item card animate-fade-in ${item.completed ? 'completed' : ''}" style="padding:var(--space-3) var(--space-4);">
                  <div class="checkbox-wrapper" onclick="BucketListModule.toggleCompleted('${item.id}')">
                    <input type="checkbox" ${item.completed ? 'checked' : ''}>
                    <div class="custom-checkbox"></div>
                  </div>
                  <div style="flex:1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-3);">
                    <div>
                      <div class="bucket-title" style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${item.title}</div>
                      <div style="font-size:var(--font-size-xs); color:var(--text-muted); margin-top:2px;">
                        التصنيف: ${catInfo.icon} ${catInfo.ar} | الأولوية: ${priorityLabels[item.priority] || 'متوسطة'}
                        ${item.deadline ? ` | التاريخ المستهدف: ${formatDateAr(item.deadline, 'short')}` : ''}
                      </div>
                    </div>
                    <div>
                      <button class="btn btn-danger btn-icon btn-sm" onclick="BucketListModule.deleteItem('${item.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  openAddItem() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة أمنية جديدة للقائمة 🪂</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">اسم الأمنية / الهدف</label>
          <input type="text" id="bucket-title" class="form-control" placeholder="مثال: القفز المظلي، تعلم العزف، زيارة مكة...">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">التصنيف</label>
            <select id="bucket-category" class="form-control">
              ${CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.ar}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الأولوية</label>
            <select id="bucket-priority" class="form-control">
              <option value="high">🔴 عالية</option>
              <option value="medium" selected>🟡 متوسطة</option>
              <option value="low">🟢 منخفضة</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">التاريخ المستهدف (اختياري)</label>
          <input type="date" id="bucket-deadline" class="form-control">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="BucketListModule.saveItem()">إضافة لقائمتي</button>
      </div>
    `;
    openModal(content);
  },

  saveItem() {
    const title = document.getElementById('bucket-title')?.value?.trim();
    if (!title) { Toast.show('يرجى إدخال عنوان الأمنية', 'error'); return; }

    const items = DB.getBucketList();
    items.push({
      id: generateId(),
      title,
      category: document.getElementById('bucket-category')?.value || 'other',
      priority: document.getElementById('bucket-priority')?.value || 'medium',
      deadline: document.getElementById('bucket-deadline')?.value || '',
      completed: false,
      createdAt: new Date().toISOString()
    });
    DB.saveBucketList(items);
    closeTopModal();
    Toast.show('تمت الإضافة بنجاح! 🎉', 'success');
    this.render(document.getElementById('module-content'));
  },

  toggleCompleted(id) {
    const items = DB.getBucketList();
    const item = items.find(x => x.id === id);
    if (item) {
      item.completed = !item.completed;
      DB.saveBucketList(items);
      Toast.show(item.completed ? '🎉 مبارك تحقيق هذا الهدف الرائع في حياتك!' : 'تم التحديث', 'success');
      this.render(document.getElementById('module-content'));
    }
  },

  deleteItem(id) {
    if (!confirm('هل تريد حذف هذه الأمنية من قائمتك؟')) return;
    let items = DB.getBucketList();
    items = items.filter(x => x.id !== id);
    DB.saveBucketList(items);
    Toast.show('تم الحذف من القائمة', 'info');
    this.render(document.getElementById('module-content'));
  }
};
