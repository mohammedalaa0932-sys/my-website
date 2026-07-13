/**
 * LIFE OS — Project Manager Module
 * Personal Projects, Work Projects, University Projects
 * Kanban Board / Tasks, Progress, Notes, Files
 */

const ProjectsModule = {
  state: {
    activeCategory: 'all', // all, personal, work, university
    selectedProjectId: null,
  },

  render(container) {
    if (this.state.selectedProjectId) {
      this.renderProjectDetail(container);
      return;
    }

    const projects = DB.getProjects();
    const categories = [
      { id: 'all', label: 'الكل', count: projects.length },
      { id: 'personal', label: 'شخصي', count: projects.filter(p => p.category === 'personal').length },
      { id: 'work', label: 'عمل', count: projects.filter(p => p.category === 'work').length },
      { id: 'university', label: 'جامعة', count: projects.filter(p => p.category === 'university').length },
    ];

    const filtered = this.state.activeCategory === 'all'
      ? projects
      : projects.filter(p => p.category === this.state.activeCategory);

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">🚀 إدارة المشاريع</h1>
            <p class="page-subtitle">خطط ونفّذ مشاريعك، وتابع تفاصيل المهام في مكان واحد</p>
          </div>
          <button class="btn btn-primary" onclick="ProjectsModule.openAddProject()">+ مشروع جديد</button>
        </div>

        <!-- Category Filter Tabs -->
        <div class="tabs" style="margin-bottom:var(--space-6); max-width:500px;">
          ${categories.map(c => `
            <div class="tab-item ${this.state.activeCategory === c.id ? 'active' : ''}" 
                 onclick="ProjectsModule.setCategory('${c.id}')">
              ${c.label} (${toArabicNumerals(c.count)})
            </div>
          `).join('')}
        </div>

        <!-- Projects Grid -->
        ${filtered.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="folder-open" style="width:32px;height:32px;"></i></div>
            <h3>لا توجد مشاريع مضافة</h3>
            <p>أضف مشاريعك (شخصية، عمل، جامعة) ونظم مهامها وتتبع نسب إنجازها.</p>
            <button class="btn btn-primary" onclick="ProjectsModule.openAddProject()">أضف أول مشروع</button>
          </div>
        ` : `
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:var(--space-4);">
            ${filtered.map(p => {
              const tasks = p.tasks || [];
              const completedTasks = tasks.filter(t => t.completed).length;
              const progressPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
              const categoryLabels = { personal: '👤 شخصي', work: '💼 عمل', university: '🎓 جامعة' };

              return `
                <div class="project-card card animate-fade-in" onclick="ProjectsModule.selectProject('${p.id}')">
                  <div class="project-card-header">
                    <span class="badge ${p.category === 'work' ? 'badge-amber' : p.category === 'university' ? 'badge-purple' : 'badge-blue'}">${categoryLabels[p.category] || p.category}</span>
                    <h3 style="font-size:var(--font-size-base); font-weight:700; color:var(--text-primary); margin-top:var(--space-2);">${p.name}</h3>
                    <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-top:4px;">${p.description || 'لا يوجد وصف للمشروع'}</p>
                  </div>
                  <div class="project-card-body">
                    <div class="project-progress-label">
                      <span>المهام: ${toArabicNumerals(completedTasks)}/${toArabicNumerals(tasks.length)}</span>
                      <span>${toArabicNumerals(progressPct)}٪</span>
                    </div>
                    <div class="progress-bar thin">
                      <div class="progress-fill" style="width:${progressPct}%;"></div>
                    </div>
                    ${p.deadline ? `
                      <div style="display:flex; align-items:center; gap:var(--space-1); font-size:var(--font-size-xs); color:var(--text-muted); margin-top:var(--space-3);">
                        <i data-lucide="calendar" style="width:12px;height:12px;"></i>
                        <span>الموعد: ${formatDateAr(p.deadline, 'short')}</span>
                      </div>
                    ` : ''}
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

  setCategory(cat) {
    this.state.activeCategory = cat;
    renderModule('projects');
  },

  selectProject(id) {
    this.state.selectedProjectId = id;
    renderModule('projects');
  },

  exitProjectDetail() {
    this.state.selectedProjectId = null;
    renderModule('projects');
  },

  openAddProject() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة مشروع جديد 🚀</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">اسم المشروع</label>
          <input type="text" id="project-name" class="form-control" placeholder="اسم المشروع بالتفصيل">
        </div>
        <div class="form-group">
          <label class="form-label">الوصف</label>
          <textarea id="project-desc" class="form-control" placeholder="اكتب تفاصيل المشروع..." rows="3"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">التصنيف</label>
            <select id="project-category" class="form-control">
              <option value="personal">👤 شخصي</option>
              <option value="work">💼 عمل</option>
              <option value="university">🎓 جامعة</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">تاريخ التسليم / الموعد النهائي</label>
            <input type="date" id="project-deadline" class="form-control">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="ProjectsModule.saveProject()">حفظ المشروع</button>
      </div>
    `;
    openModal(content);
  },

  saveProject() {
    const name = document.getElementById('project-name')?.value?.trim();
    if (!name) { Toast.show('يرجى إدخال اسم المشروع', 'error'); return; }

    const projects = DB.getProjects();
    projects.push({
      id: generateId(),
      name,
      description: document.getElementById('project-desc')?.value?.trim() || '',
      category: document.getElementById('project-category')?.value || 'personal',
      deadline: document.getElementById('project-deadline')?.value || '',
      tasks: [],
      notes: '',
      files: [],
      createdAt: new Date().toISOString()
    });
    DB.saveProjects(projects);
    closeTopModal();
    Toast.show('تم إضافة المشروع الجديد! 🚀', 'success');
    renderModule('projects');
  },

  // ── Project Detail View (Kanban / Tasks & Notes) ──
  renderProjectDetail(container) {
    const projects = DB.getProjects();
    const p = projects.find(x => x.id === this.state.selectedProjectId);
    if (!p) {
      this.state.selectedProjectId = null;
      this.render(container);
      return;
    }

    const tasks = p.tasks || [];
    const completedTasks = tasks.filter(t => t.completed).length;
    const progressPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // Kanban columns: todo, in_progress, done
    const todoTasks = tasks.filter(t => !t.completed && t.status !== 'in_progress');
    const inProgressTasks = tasks.filter(t => !t.completed && t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.completed);

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header" style="border-bottom:1px solid var(--border); padding-bottom:var(--space-4); margin-bottom:var(--space-4);">
          <div style="display:flex; align-items:center; gap:var(--space-3);">
            <button class="btn btn-secondary btn-icon btn-sm" onclick="ProjectsModule.exitProjectDetail()">
              <i data-lucide="chevron-right" style="width:18px;height:18px;"></i>
            </button>
            <div>
              <h1 class="page-title" style="font-size:var(--font-size-2xl);">${p.name}</h1>
              <p class="page-subtitle">${p.description || 'لا يوجد وصف للمشروع'}</p>
            </div>
          </div>
          <div style="display:flex; gap:var(--space-2);">
            <button class="btn btn-secondary" onclick="ProjectsModule.openEditProject('${p.id}')">تعديل</button>
            <button class="btn btn-danger" onclick="ProjectsModule.deleteProject('${p.id}')">حذف</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr; gap:var(--space-4); margin-bottom:var(--space-6);">
          <div class="card" style="padding:var(--space-4);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2); font-size:var(--font-size-sm);">
              <span>معدل إنجاز المشروع: <strong>${toArabicNumerals(progressPct)}٪</strong></span>
              <span>المهام المكتملة: ${toArabicNumerals(completedTasks)} / ${toArabicNumerals(tasks.length)}</span>
            </div>
            <div class="progress-bar thick">
              <div class="progress-fill" style="width:${progressPct}%;"></div>
            </div>
          </div>
        </div>

        <!-- Project Workspace: Kanban Board vs Notes -->
        <div style="display:grid; grid-template-columns:3fr 1.5fr; gap:var(--space-6);">
          <!-- Kanban Board -->
          <div>
            <div class="section-header">
              <div class="section-title">📋 لوحة المهام (Kanban)</div>
              <button class="btn btn-primary btn-sm" onclick="ProjectsModule.openAddTask('${p.id}')">+ إضافة مهمة</button>
            </div>

            <div class="kanban-board">
              <!-- Column: To Do -->
              <div class="kanban-column">
                <div class="kanban-column-header">
                  <span>قيد الانتظار ⏳</span>
                  <span class="badge badge-gray">${toArabicNumerals(todoTasks.length)}</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:var(--space-2);">
                  ${todoTasks.map(t => this.renderKanbanTask(p.id, t)).join('')}
                </div>
              </div>

              <!-- Column: In Progress -->
              <div class="kanban-column">
                <div class="kanban-column-header">
                  <span>قيد العمل 🔄</span>
                  <span class="badge badge-amber">${toArabicNumerals(inProgressTasks.length)}</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:var(--space-2);">
                  ${inProgressTasks.map(t => this.renderKanbanTask(p.id, t)).join('')}
                </div>
              </div>

              <!-- Column: Done -->
              <div class="kanban-column">
                <div class="kanban-column-header">
                  <span>مكتملة ✅</span>
                  <span class="badge badge-green">${toArabicNumerals(doneTasks.length)}</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:var(--space-2);">
                  ${doneTasks.map(t => this.renderKanbanTask(p.id, t)).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Notes & Attachments -->
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            <!-- Notes -->
            <div class="card">
              <h3 class="card-title" style="margin-bottom:var(--space-2);">📝 ملاحظات المشروع</h3>
              <textarea class="form-control" rows="8" placeholder="اكتب ملاحظاتك، أفكارك، أو روابط هامة للمشروع..."
                        onchange="ProjectsModule.updateProjectNotes('${p.id}', this.value)">${p.notes || ''}</textarea>
            </div>

            <!-- Files -->
            <div class="card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
                <h3 class="card-title">🔗 المرفقات والروابط</h3>
                <button class="btn btn-ghost btn-sm" onclick="ProjectsModule.openAddFile('${p.id}')">+ إضافة</button>
              </div>
              ${(p.files || []).length === 0 ? `<p style="font-size:var(--font-size-xs); color:var(--text-muted);">لا توجد ملفات أو روابط مرفقة.</p>` : `
                <div style="display:flex; flex-direction:column; gap:var(--space-2);">
                  ${p.files.map(f => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-2); background:var(--bg-secondary); border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
                      <a href="${f.url}" target="_blank" style="font-size:var(--font-size-xs); color:var(--accent-blue-light); text-decoration:underline; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px;">
                        ${f.name}
                      </a>
                      <button class="btn btn-ghost btn-icon btn-sm" onclick="ProjectsModule.deleteFile('${p.id}', '${f.id}')" style="color:var(--accent-rose);"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  renderKanbanTask(projectId, t) {
    const priorityLabels = { high: '🔴 عالية', medium: '🟡 متوسطة', low: '🟢 منخفضة' };
    return `
      <div class="kanban-task card" style="padding:var(--space-3);" onclick="event.stopPropagation(); ProjectsModule.openTaskDetail('${projectId}', '${t.id}')">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
          <span style="font-size:10px; font-weight:700; color:var(--text-muted);">${priorityLabels[t.priority] || 'متوسطة'}</span>
          <div style="display:flex; gap:2px;">
            ${!t.completed && t.status !== 'in_progress' ? `<button class="btn btn-ghost btn-icon btn-sm" style="width:20px; height:20px; padding:0;" onclick="event.stopPropagation(); ProjectsModule.moveTask('${projectId}', '${t.id}', 'in_progress')" title="قيد العمل"><i data-lucide="play" style="width:10px;height:10px;"></i></button>` : ''}
            ${!t.completed && t.status === 'in_progress' ? `<button class="btn btn-ghost btn-icon btn-sm" style="width:20px; height:20px; padding:0;" onclick="event.stopPropagation(); ProjectsModule.moveTask('${projectId}', '${t.id}', 'todo')" title="إيقاف مؤقت"><i data-lucide="square" style="width:10px;height:10px;"></i></button>` : ''}
            <button class="btn btn-ghost btn-icon btn-sm" style="width:20px; height:20px; padding:0; color:var(--color-success);" onclick="event.stopPropagation(); ProjectsModule.toggleTaskCompleted('${projectId}', '${t.id}')" title="مكتمل"><i data-lucide="check" style="width:10px;height:10px;"></i></button>
          </div>
        </div>
        <div style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${t.title}</div>
        ${t.deadline ? `<div style="font-size:10px; color:var(--text-muted); margin-top:var(--space-1);">📅 ${formatDateAr(t.deadline, 'short')}</div>` : ''}
      </div>
    `;
  },

  openAddTask(projectId) {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة مهمة جديدة ✅</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">اسم المهمة</label>
          <input type="text" id="task-title" class="form-control" placeholder="ماذا تريد أن تفعل؟">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">الأولوية</label>
            <select id="task-priority" class="form-control">
              <option value="high">🔴 عالية</option>
              <option value="medium" selected>🟡 متوسطة</option>
              <option value="low">🟢 منخفضة</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">تاريخ الاستحقاق</label>
            <input type="date" id="task-deadline" class="form-control">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="ProjectsModule.saveTask('${projectId}')">إضافة المهمة</button>
      </div>
    `;
    openModal(content);
  },

  saveTask(projectId) {
    const title = document.getElementById('task-title')?.value?.trim();
    if (!title) { Toast.show('يرجى إدخال اسم المهمة', 'error'); return; }

    const projects = DB.getProjects();
    const p = projects.find(x => x.id === projectId);
    if (p) {
      p.tasks.push({
        id: generateId(),
        title,
        priority: document.getElementById('task-priority')?.value || 'medium',
        deadline: document.getElementById('task-deadline')?.value || '',
        status: 'todo',
        completed: false,
        createdAt: new Date().toISOString()
      });
      DB.saveProjects(projects);
      closeTopModal();
      Toast.show('تمت إضافة المهمة!', 'success');
      renderModule('projects');
    }
  },

  moveTask(projectId, taskId, newStatus) {
    const projects = DB.getProjects();
    const p = projects.find(x => x.id === projectId);
    if (p) {
      const t = p.tasks.find(x => x.id === taskId);
      if (t) {
        t.status = newStatus;
        DB.saveProjects(projects);
        renderModule('projects');
      }
    }
  },

  toggleTaskCompleted(projectId, taskId) {
    const projects = DB.getProjects();
    const p = projects.find(x => x.id === projectId);
    if (p) {
      const t = p.tasks.find(x => x.id === taskId);
      if (t) {
        t.completed = !t.completed;
        if (t.completed) t.status = 'done';
        else t.status = 'todo';
        DB.saveProjects(projects);
        Toast.show(t.completed ? 'أحسنت! اكتملت المهمة ✅' : 'تمت إعادة المهمة', 'info');
        renderModule('projects');
      }
    }
  },

  openTaskDetail(projectId, taskId) {
    const projects = DB.getProjects();
    const p = projects.find(x => x.id === projectId);
    if (!p) return;
    const t = p.tasks.find(x => x.id === taskId);
    if (!t) return;

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تفاصيل المهمة</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div style="font-size:var(--font-size-base); font-weight:700; color:var(--text-primary);">${t.title}</div>
        <div style="margin-top:var(--space-3); font-size:var(--font-size-xs); color:var(--text-secondary); display:flex; flex-direction:column; gap:4px;">
          <span>الأولوية: <strong>${t.priority === 'high' ? 'عالية' : t.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</strong></span>
          <span>تاريخ الاستحقاق: <strong>${t.deadline ? formatDateAr(t.deadline, 'short') : 'غير محدد'}</strong></span>
          <span>الحالة: <strong>${t.completed ? 'مكتملة' : t.status === 'in_progress' ? 'قيد العمل' : 'قيد الانتظار'}</strong></span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-danger" onclick="ProjectsModule.deleteTask('${projectId}', '${t.id}')">حذف المهمة</button>
        <button class="btn btn-secondary" onclick="closeTopModal()">إغلاق</button>
      </div>
    `;
    openModal(content);
  },

  deleteTask(projectId, taskId) {
    if (!confirm('هل تريد حذف هذه المهمة؟')) return;
    const projects = DB.getProjects();
    const p = projects.find(x => x.id === projectId);
    if (p) {
      p.tasks = p.tasks.filter(x => x.id !== taskId);
      DB.saveProjects(projects);
      closeTopModal();
      Toast.show('تم حذف المهمة', 'info');
      renderModule('projects');
    }
  },

  updateProjectNotes(id, value) {
    const projects = DB.getProjects();
    const p = projects.find(x => x.id === id);
    if (p) {
      p.notes = value;
      DB.saveProjects(projects);
    }
  },

  openAddFile(projectId) {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة مرفق / رابط 🔗</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">اسم المرفق / الرابط</label>
          <input type="text" id="file-name" class="form-control" placeholder="مثال: مستند التخطيط، كورس فيجما...">
        </div>
        <div class="form-group">
          <label class="form-label required">رابط الويب (URL)</label>
          <input type="url" id="file-url" class="form-control" placeholder="https://...">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="ProjectsModule.saveFile('${projectId}')">إضافة المرفق</button>
      </div>
    `;
    openModal(content);
  },

  saveFile(projectId) {
    const name = document.getElementById('file-name')?.value?.trim();
    const url = document.getElementById('file-url')?.value?.trim();
    if (!name || !url) { Toast.show('يرجى ملء جميع الحقول المطلوبة', 'error'); return; }

    const projects = DB.getProjects();
    const p = projects.find(x => x.id === projectId);
    if (p) {
      if (!p.files) p.files = [];
      p.files.push({ id: generateId(), name, url, createdAt: new Date().toISOString() });
      DB.saveProjects(projects);
      closeTopModal();
      Toast.show('تمت إضافة الرابط بنجاح!', 'success');
      renderModule('projects');
    }
  },

  deleteFile(projectId, fileId) {
    if (!confirm('هل تريد حذف هذا المرفق؟')) return;
    const projects = DB.getProjects();
    const p = projects.find(x => x.id === projectId);
    if (p) {
      p.files = p.files.filter(x => x.id !== fileId);
      DB.saveProjects(projects);
      Toast.show('تم حذف المرفق', 'info');
      renderModule('projects');
    }
  },

  openEditProject(id) {
    const projects = DB.getProjects();
    const p = projects.find(x => x.id === id);
    if (!p) return;

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تعديل بيانات المشروع</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">اسم المشروع</label>
          <input type="text" id="edit-proj-name" class="form-control" value="${p.name}">
        </div>
        <div class="form-group">
          <label class="form-label">الوصف</label>
          <textarea id="edit-proj-desc" class="form-control" rows="3">${p.description || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">التصنيف</label>
            <select id="edit-proj-category" class="form-control">
              <option value="personal" ${p.category==='personal'?'selected':''}>👤 شخصي</option>
              <option value="work" ${p.category==='work'?'selected':''}>💼 عمل</option>
              <option value="university" ${p.category==='university'?'selected':''}>🎓 جامعة</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">تاريخ التسليم</label>
            <input type="date" id="edit-proj-deadline" class="form-control" value="${p.deadline || ''}">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="ProjectsModule.updateProject('${id}')">حفظ التغييرات</button>
      </div>
    `;
    openModal(content);
  },

  updateProject(id) {
    const name = document.getElementById('edit-proj-name')?.value?.trim();
    if (!name) { Toast.show('يرجى إدخال اسم المشروع', 'error'); return; }

    const projects = DB.getProjects();
    const p = projects.find(x => x.id === id);
    if (p) {
      p.name = name;
      p.description = document.getElementById('edit-proj-desc')?.value?.trim() || '';
      p.category = document.getElementById('edit-proj-category')?.value || 'personal';
      p.deadline = document.getElementById('edit-proj-deadline')?.value || '';
      DB.saveProjects(projects);
      closeTopModal();
      Toast.show('تم تعديل المشروع بنجاح!', 'success');
      renderModule('projects');
    }
  },

  deleteProject(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع مهامه ومرفقاته نهائياً.')) return;
    let projects = DB.getProjects();
    projects = projects.filter(x => x.id !== id);
    DB.saveProjects(projects);
    if (this.state.selectedProjectId === id) this.state.selectedProjectId = null;
    Toast.show('تم حذف المشروع بنجاح', 'info');
    renderModule('projects');
  }
};
