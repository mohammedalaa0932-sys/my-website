/**
 * LIFE OS — Standalone Tasks Module
 * "مهام اليوم" — One-time actions only, distinct from Goals/Habits/Priorities
 */

const TasksModule = {
  state: {
    filterCategory: 'all',
    filterPriority: 'all',
    showCompleted: false,
    searchQuery: ''
  },

  render(container) {
    const tasks = DB.getTasks();
    const today = todayKey();

    // Statistics
    const totalPending = tasks.filter(t => !t.completed).length;
    const completedToday = tasks.filter(t => t.completed && t.date === today).length;
    const overdue = tasks.filter(t => !t.completed && t.date < today).length;
    const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">📋 إدارة مهام اليوم</h1>
            <p class="page-subtitle">أفعال محددة تُنجز لمرة واحدة — ليست أهدافاً ولا عادات</p>
          </div>
          <button class="btn btn-primary" onclick="TasksModule.openAddTaskModal()">
            <i data-lucide="plus" style="width:16px;height:16px;"></i> إضافة مهمة جديدة
          </button>
        </div>

        <!-- Stats row -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-4);margin-bottom:var(--space-5);">
          <div class="card" style="border-top:3px solid var(--accent-blue);">
            <div style="font-size:24px;">📝</div>
            <div style="font-size:var(--font-size-xl);font-weight:800;color:var(--accent-blue);margin-top:var(--space-2);">${toArabicNumerals(totalPending)}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">مهام قيد الانتظار</div>
          </div>
          <div class="card" style="border-top:3px solid var(--accent-emerald);">
            <div style="font-size:24px;">✅</div>
            <div style="font-size:var(--font-size-xl);font-weight:800;color:var(--accent-emerald);margin-top:var(--space-2);">${toArabicNumerals(completedToday)}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">أنجزت اليوم</div>
          </div>
          <div class="card" style="border-top:3px solid var(--accent-rose);">
            <div style="font-size:24px;">⏰</div>
            <div style="font-size:var(--font-size-xl);font-weight:800;color:var(--accent-rose);margin-top:var(--space-2);">${toArabicNumerals(overdue)}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">مهام متأخرة</div>
          </div>
          <div class="card" style="border-top:3px solid var(--accent-purple);">
            <div style="font-size:24px;">📊</div>
            <div style="font-size:var(--font-size-xl);font-weight:800;color:var(--accent-purple);margin-top:var(--space-2);">${toArabicNumerals(completionRate)}٪</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);">معدل الإنجاز العام</div>
          </div>
        </div>

        <!-- Toolbar / Filters -->
        <div class="card" style="margin-bottom:var(--space-4);padding:var(--space-4);">
          <div style="display:flex;gap:var(--space-3);align-items:center;flex-wrap:wrap;">
            <div style="flex:1;min-width:200px;">
              <input type="text" id="task-search" class="form-control" placeholder="البحث عن مهمة..." 
                     value="${this.state.searchQuery}" oninput="TasksModule.handleSearch(this.value)">
            </div>
            <div>
              <select class="form-control" onchange="TasksModule.setFilter('Category', this.value)">
                <option value="all" ${this.state.filterCategory === 'all' ? 'selected' : ''}>كل التصنيفات</option>
                <option value="work" ${this.state.filterCategory === 'work' ? 'selected' : ''}>💼 العمل</option>
                <option value="personal" ${this.state.filterCategory === 'personal' ? 'selected' : ''}>👤 شخصي</option>
                <option value="study" ${this.state.filterCategory === 'study' ? 'selected' : ''}>📚 الدراسة</option>
                <option value="health" ${this.state.filterCategory === 'health' ? 'selected' : ''}>💪 الصحة</option>
                <option value="finance" ${this.state.filterCategory === 'finance' ? 'selected' : ''}>💰 المالية</option>
              </select>
            </div>
            <div>
              <select class="form-control" onchange="TasksModule.setFilter('Priority', this.value)">
                <option value="all" ${this.state.filterPriority === 'all' ? 'selected' : ''}>كل الأولويات</option>
                <option value="high" ${this.state.filterPriority === 'high' ? 'selected' : ''}>🔴 عالية</option>
                <option value="medium" ${this.state.filterPriority === 'medium' ? 'selected' : ''}>🟡 متوسطة</option>
                <option value="low" ${this.state.filterPriority === 'low' ? 'selected' : ''}>🟢 منخفضة</option>
              </select>
            </div>
            <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;font-size:var(--font-size-xs);color:var(--text-secondary);">
              <input type="checkbox" ${this.state.showCompleted ? 'checked' : ''} 
                     onchange="TasksModule.toggleShowCompleted(this.checked)">
              عرض المهام المكتملة
            </label>
          </div>
        </div>

        <!-- Task List Content -->
        <div style="display:grid;grid-template-columns:1fr;gap:var(--space-4);">
          ${this.renderTaskList(tasks, today)}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  renderTaskList(tasks, today) {
    // Filter tasks
    let filtered = tasks;

    // Search
    if (this.state.searchQuery) {
      const q = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }

    // Category
    if (this.state.filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === this.state.filterCategory);
    }

    // Priority
    if (this.state.filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === this.state.filterPriority);
    }

    // Completed filter
    if (!this.state.showCompleted) {
      filtered = filtered.filter(t => !t.completed);
    }

    if (filtered.length === 0) {
      return `
        <div class="card" style="text-align:center;padding:var(--space-8);color:var(--text-muted);">
          <div style="font-size:40px;margin-bottom:var(--space-3);">📋</div>
          <h3>لا توجد مهام مطابقة للفلاتر الحالية</h3>
          <p>أضف مهمة جديدة للبدء في تنظيم يومك</p>
        </div>
      `;
    }

    // Sort: Uncompleted first, then Overdue, then Today, then Future, then completed sorted by date
    const overdue = filtered.filter(t => !t.completed && t.date < today).sort((a,b) => a.date.localeCompare(b.date));
    const todayTasks = filtered.filter(t => !t.completed && t.date === today).sort((a,b) => (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99'));
    const future = filtered.filter(t => !t.completed && t.date > today).sort((a,b) => a.date.localeCompare(b.date));
    const completed = filtered.filter(t => t.completed).sort((a,b) => b.createdAt.localeCompare(a.createdAt));

    return `
      ${overdue.length > 0 ? `
        <div class="section-header">
          <div class="section-title" style="color:var(--accent-rose);">⚠️ مهام متأخرة</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-4);">
          ${overdue.map(t => this.renderTaskRow(t, true)).join('')}
        </div>
      ` : ''}

      ${todayTasks.length > 0 ? `
        <div class="section-header">
          <div class="section-title" style="color:var(--accent-blue);">📅 مهام اليوم</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-4);">
          ${todayTasks.map(t => this.renderTaskRow(t, false)).join('')}
        </div>
      ` : ''}

      ${future.length > 0 ? `
        <div class="section-header">
          <div class="section-title" style="color:var(--accent-purple);">🔮 مهام قادمة</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-4);">
          ${future.map(t => this.renderTaskRow(t, false)).join('')}
        </div>
      ` : ''}

      ${completed.length > 0 ? `
        <div class="section-header">
          <div class="section-title" style="color:var(--accent-emerald);">✅ مهام منجزة</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-4);">
          ${completed.map(t => this.renderTaskRow(t, false)).join('')}
        </div>
      ` : ''}
    `;
  },

  renderTaskRow(task, isOverdue) {
    const priorityLabels = { high: '🔴 عالية', medium: '🟡 متوسطة', low: '🟢 منخفضة' };
    const categoryLabels = { work: '💼 عمل', personal: '👤 شخصي', study: '📚 دراسة', health: '💪 صحة', finance: '💰 مالية' };
    
    return `
      <div class="card" style="padding:var(--space-3) var(--space-4);display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);border-right:4px solid ${task.priority === 'high' ? 'var(--accent-rose)' : task.priority === 'medium' ? 'var(--accent-amber)' : 'var(--accent-emerald)'}; opacity: ${task.completed ? '0.7' : '1'};">
        <div style="display:flex;align-items:center;gap:var(--space-3);flex:1;">
          <div class="habit-check ${task.completed ? 'checked' : ''}" 
               style="cursor:pointer;" 
               onclick="TasksModule.toggleTask('${task.id}')">
            ${task.completed ? '<i data-lucide="check" style="width:14px;height:14px;color:white;"></i>' : ''}
          </div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">
              <span style="font-weight:700;font-size:var(--font-size-sm);color:var(--text-primary);${task.completed ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">
                ${task.title}
              </span>
              ${task.dueTime ? `<span class="badge badge-purple" style="font-size:10px;padding:2px 6px;">⏱️ ${task.dueTime}</span>` : ''}
              ${task.category ? `<span class="badge badge-blue" style="font-size:10px;padding:2px 6px;">${categoryLabels[task.category] || task.category}</span>` : ''}
              ${isOverdue ? `<span class="badge badge-rose" style="font-size:10px;padding:2px 6px;">متأخرة!</span>` : ''}
            </div>
            ${task.notes ? `<p style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:4px;white-space:pre-wrap;">📝 ${task.notes}</p>` : ''}
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:var(--space-3);">
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);text-align:left;">
            <div>📅 ${formatDateAr(new Date(task.date), 'day-month')}</div>
          </div>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="TasksModule.deleteTask('${task.id}')" style="color:var(--accent-rose);">
            <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
          </button>
        </div>
      </div>
    `;
  },

  handleSearch(val) {
    this.state.searchQuery = val.trim();
    this.refresh();
  },

  setFilter(type, value) {
    this.state[`filter${type}`] = value;
    this.refresh();
  },

  toggleShowCompleted(checked) {
    this.state.showCompleted = checked;
    this.refresh();
  },

  toggleTask(id) {
    const tasks = DB.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx].completed = !tasks[idx].completed;
      DB.saveTasks(tasks);
      Toast.show(tasks[idx].completed ? 'تم إنجاز المهمة! 🎉' : 'تمت إعادة تعيين المهمة', 'success');
      this.refresh();
      if (AppState.currentModule === 'dashboard') {
        DashboardModule.render(document.getElementById('module-content'));
      }
    }
  },

  deleteTask(id) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      const tasks = DB.getTasks();
      const updated = tasks.filter(t => t.id !== id);
      DB.saveTasks(updated);
      Toast.show('تم حذف المهمة بنجاح', 'info');
      this.refresh();
    }
  },

  openAddTaskModal() {
    const today = todayKey();
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة مهمة جديدة 📋</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">عنوان المهمة</label>
          <input type="text" id="task-title" class="form-control" placeholder="مثال: تقديم واجب الشبكات، إرسال تقرير المشروع..." autofocus>
        </div>
        <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
          <div class="form-group">
            <label class="form-label">الأولوية</label>
            <select id="task-priority" class="form-control">
              <option value="high">🔴 عالية</option>
              <option value="medium" selected>🟡 متوسطة</option>
              <option value="low">🟢 منخفضة</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">التصنيف</label>
            <select id="task-category" class="form-control">
              <option value="personal">👤 شخصي</option>
              <option value="work">💼 عمل</option>
              <option value="study">📚 دراسة</option>
              <option value="health">💪 صحة</option>
              <option value="finance">💰 مالية</option>
            </select>
          </div>
        </div>
        <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
          <div class="form-group">
            <label class="form-label">التاريخ</label>
            <input type="date" id="task-date" class="form-control" value="${today}">
          </div>
          <div class="form-group">
            <label class="form-label">موعد الإنجاز (اختياري)</label>
            <input type="time" id="task-time" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات</label>
          <textarea id="task-notes" class="form-control" rows="3" placeholder="ملاحظات أو تفاصيل إضافية للمهمة..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="TasksModule.saveNewTask()">حفظ المهمة</button>
      </div>
    `;
    openModal(content);
  },

  saveNewTask() {
    const title = document.getElementById('task-title')?.value?.trim();
    if (!title) { Toast.show('الرجاء إدخال عنوان المهمة', 'error'); return; }

    const priority = document.getElementById('task-priority')?.value || 'medium';
    const category = document.getElementById('task-category')?.value || 'personal';
    const date = document.getElementById('task-date')?.value || todayKey();
    const dueTime = document.getElementById('task-time')?.value || '';
    const notes = document.getElementById('task-notes')?.value?.trim() || '';

    const tasks = DB.getTasks();
    tasks.push({
      id: generateId(),
      title,
      priority,
      category,
      date,
      dueTime,
      notes,
      completed: false,
      createdAt: new Date().toISOString()
    });

    DB.saveTasks(tasks);
    closeTopModal();
    Toast.show('تمت إضافة المهمة بنجاح! ✅', 'success');
    this.refresh();
  },

  refresh() {
    const container = document.getElementById('module-content');
    if (container && AppState.currentModule === 'tasks') {
      this.render(container);
    }
  }
};
