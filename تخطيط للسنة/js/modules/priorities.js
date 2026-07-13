/**
 * LIFE OS — Daily Planning Module (تخطيط اليوم)
 * A unified, clear daily planning hub:
 *   🎯 Today's Mission  — the one most important outcome
 *   🔥 Top 3 Focus Areas — NOT tasks, just focus points
 *   ✅ Today's Tasks     — actionable checklist
 *   🔁 Today's Habits   — recurring daily rituals
 *
 * Long-Term Goals live ONLY in the Goals module (not here).
 */

const PrioritiesModule = {

  // ─── Main Render ────────────────────────────────────────────────────────────
  render(container) {
    const key = todayKey();
    const priorities = DB.getPriorities()[key] || {};
    const tasks = DB.getTasks().filter(t => t.date === key);
    const habits = DB.getHabits().filter(h => h.frequency === 'daily');
    const habitLogs = DB.getHabitLogs()[key] || {};

    const doneHabits = habits.filter(h => habitLogs[h.id]).length;
    const doneTasks = tasks.filter(t => t.completed).length;
    const totalItems = tasks.length + habits.length;
    const doneItems = doneTasks + doneHabits;
    const dayPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

    container.innerHTML = `
      <div class="page-content" style="max-width:900px; margin:0 auto;">

        <!-- Header -->
        <div class="page-header" style="margin-bottom:var(--space-6); align-items:flex-start;">
          <div>
            <h1 class="page-title" style="font-size:2.2rem;">📋 تخطيط اليوم</h1>
            <p class="page-subtitle" style="margin-top:var(--space-1);">${formatDateAr(new Date(), 'full')}</p>
          </div>
          <div style="text-align:left;">
            <div style="font-size:13px; color:var(--text-muted); font-weight:700; margin-bottom:6px;">إنجاز اليوم</div>
            <div style="display:flex; align-items:center; gap:var(--space-3);">
              <div class="progress-bar" style="width:160px; height:10px; margin:0; border-radius:99px;">
                <div class="progress-fill green" style="width:${dayPct}%; border-radius:99px;"></div>
              </div>
              <span style="font-size:1.4rem; font-weight:900; color:var(--color-success);">${dayPct}%</span>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════ -->
        <!-- QUOTE OF THE DAY                                                  -->
        <!-- ══════════════════════════════════════════════════════════════════ -->
        ${(() => {
          const q = getDailyQuote();
          if (!q) return '';
          const isFav = q.isFavorite;
          return `
          <div style="background:linear-gradient(135deg, rgba(124,58,237,0.07), rgba(16,185,129,0.04)); border:1px solid rgba(124,58,237,0.15); border-radius:var(--radius-lg); padding:var(--space-4); margin-bottom:var(--space-6); display:flex; align-items:flex-start; gap:var(--space-4); position:relative;">
            <div style="font-size:32px; opacity:0.25; color:var(--accent-purple); line-height:1; flex-shrink:0;">❝</div>
            <div style="flex:1;">
              <div style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary); font-style:italic; line-height:1.6;">${q.text}</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:6px;">— ${q.author}</div>
            </div>
            <button onclick="PrioritiesModule.toggleQuoteFav(${q.index})" id="pri-fav-quote-btn" style="position:absolute; top:10px; left:12px; border:none; background:none; cursor:pointer; font-size:16px; color:${isFav ? 'var(--accent-rose)' : 'var(--text-muted)'}; padding:0;" title="تفضيل الاقتباس">${isFav ? '❤️' : '🤍'}</button>
          </div>`;
        })()}

        <!-- ══════════════════════════════════════════════════════════════════ -->
        <!-- SECTION 1: Today's Mission                                       -->
        <!-- ══════════════════════════════════════════════════════════════════ -->
        <div style="margin-bottom:var(--space-8);">
          <div style="display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-3);">
            <div style="width:40px; height:40px; background:linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:20px;">🎯</div>
            <div>
              <div style="font-size:1.1rem; font-weight:800; color:var(--text-primary);">مهمة اليوم</div>
              <div style="font-size:12px; color:var(--text-muted);">جملة واحدة تصف أهم شيء تريد إنجازه اليوم — ليست مهمة، بل نتيجة</div>
            </div>
          </div>
          <div style="background:linear-gradient(135deg, rgba(124,58,237,0.08), rgba(59,130,246,0.05)); border:1px solid rgba(124,58,237,0.2); border-radius:var(--radius-lg); padding:var(--space-4);">
            <input type="text" id="today-mission" class="form-control"
                   style="font-size:1.2rem; font-weight:700; background:transparent; border:none; padding:var(--space-2) 0; color:var(--text-primary);"
                   placeholder="مثال: أنهي دراسة فصل CCNA كامل وأفهمه جيداً"
                   value="${priorities.mission || ''}"
                   onchange="PrioritiesModule.autoSave()">
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════ -->
        <!-- SECTION 2: Top 3 Priorities (Focus Areas, NOT Tasks)             -->
        <!-- ══════════════════════════════════════════════════════════════════ -->
        <div style="margin-bottom:var(--space-8);">
          <div style="display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-3);">
            <div style="width:40px; height:40px; background:linear-gradient(135deg, #f59e0b, #ef4444); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:20px;">🔥</div>
            <div>
              <div style="font-size:1.1rem; font-weight:800; color:var(--text-primary);">أهم ٣ تركيزات اليوم</div>
              <div style="font-size:12px; color:var(--text-muted);">ما هي مجالات التركيز التي ستجعل يومك ناجحاً؟ — ليست مهاماً للتشطيب، بل مناطق انتباه</div>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:var(--space-3);">
            ${[
              { n: 1, color: 'linear-gradient(135deg, #f59e0b, #ef4444)', label: 'الأولوية الأولى (الأهم على الإطلاق)' },
              { n: 2, color: 'linear-gradient(135deg, #8b5cf6, #6366f1)', label: 'الأولوية الثانية' },
              { n: 3, color: 'linear-gradient(135deg, #10b981, #059669)', label: 'الأولوية الثالثة' },
            ].map(p => `
              <div style="display:flex; align-items:center; gap:var(--space-4); background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:var(--space-4);">
                <div style="width:44px; height:44px; background:${p.color}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem; font-weight:900; color:white; flex-shrink:0;">${p.n}</div>
                <div style="flex:1;">
                  <div style="font-size:11px; color:var(--text-muted); font-weight:700; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em;">${p.label}</div>
                  <input type="text" id="priority-${p.n}" class="form-control"
                         style="background:transparent; border:none; padding:0; font-size:var(--font-size-base); font-weight:600; color:var(--text-primary);"
                         placeholder="مثال: التركيز على الدراسة والفهم العميق"
                         value="${priorities[`priority${p.n}`] || ''}"
                         onchange="PrioritiesModule.autoSave()">
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════ -->
        <!-- SECTION 3: Today's Tasks (Checklist — one-time actions)          -->
        <!-- ══════════════════════════════════════════════════════════════════ -->
        <div style="margin-bottom:var(--space-8);">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-3);">
            <div style="display:flex; align-items:center; gap:var(--space-3);">
              <div style="width:40px; height:40px; background:linear-gradient(135deg, #3b82f6, #06b6d4); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:20px;">✅</div>
              <div>
                <div style="font-size:1.1rem; font-weight:800; color:var(--text-primary);">مهام اليوم</div>
                <div style="font-size:12px; color:var(--text-muted);">أفعال محددة تُنجز اليوم — لها بداية ونهاية وتُشطب عند الإنجاز</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:var(--space-3);">
              <span style="font-size:13px; color:var(--text-muted); font-weight:700;">${doneTasks}/${tasks.length} مكتملة</span>
              <button class="btn btn-primary btn-sm" onclick="PrioritiesModule.openAddTask()">+ إضافة مهمة</button>
            </div>
          </div>

          <div id="tasks-list-container">
            ${this.renderTasksList(tasks)}
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════ -->
        <!-- SECTION 4: Today's Habits (Recurring — auto every day)           -->
        <!-- ══════════════════════════════════════════════════════════════════ -->
        <div style="margin-bottom:var(--space-8);">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-3);">
            <div style="display:flex; align-items:center; gap:var(--space-3);">
              <div style="width:40px; height:40px; background:linear-gradient(135deg, #10b981, #059669); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:20px;">🔁</div>
              <div>
                <div style="font-size:1.1rem; font-weight:800; color:var(--text-primary);">عادات اليوم</div>
                <div style="font-size:12px; color:var(--text-muted);">سلوكيات تتكرر كل يوم تلقائياً — تُبنى مع الوقت لتصنع شخصك</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:var(--space-3);">
              <span style="font-size:13px; color:var(--text-muted); font-weight:700;">${doneHabits}/${habits.length} مكتملة</span>
              <button class="btn btn-ghost btn-sm" onclick="navigateTo('habits')">إدارة العادات →</button>
            </div>
          </div>

          <div id="habits-list-container">
            ${this.renderHabitsList(habits, habitLogs, key)}
          </div>
        </div>

        <!-- ── Notice: Long-Term Goals live in the Goals page ─────────────── -->
        <div style="background:rgba(124,58,237,0.05); border:1px dashed rgba(124,58,237,0.25); border-radius:var(--radius-lg); padding:var(--space-4); display:flex; align-items:center; gap:var(--space-4);">
          <div style="font-size:32px; flex-shrink:0;">🏆</div>
          <div>
            <div style="font-weight:800; font-size:var(--font-size-sm); color:var(--text-primary); margin-bottom:4px;">أهداف الحياة والأهداف طويلة المدى</div>
            <div style="font-size:12px; color:var(--text-muted);">الأهداف السنوية والشهرية والأسبوعية موجودة في قسم "الأهداف" مستقل لإبقاء هذه الصفحة بسيطة وواضحة.</div>
          </div>
          <button class="btn btn-ghost btn-sm" style="flex-shrink:0; white-space:nowrap;" onclick="navigateTo('goals')">عرض الأهداف →</button>
        </div>

        <!-- History -->
        <div style="margin-top:var(--space-8);">
          <div style="font-size:var(--font-size-sm); font-weight:800; color:var(--text-muted); margin-bottom:var(--space-4); display:flex; align-items:center; gap:var(--space-2);">
            📜 سجل التخطيط للأيام السابقة
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:var(--space-3);">
            ${this.renderPastDays()}
          </div>
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  // ─── Render Task List ────────────────────────────────────────────────────
  renderTasksList(tasks) {
    if (tasks.length === 0) {
      return `
        <div style="background:var(--bg-secondary); border:2px dashed var(--border-subtle); border-radius:var(--radius-lg); padding:var(--space-6); text-align:center; color:var(--text-muted);">
          <div style="font-size:32px; margin-bottom:var(--space-3);">📋</div>
          <div style="font-size:var(--font-size-sm); font-weight:600;">لا توجد مهام لهذا اليوم بعد</div>
          <div style="font-size:12px; margin-top:var(--space-1);">اضغط "+ إضافة مهمة" لبدء قائمة مهامك</div>
        </div>
      `;
    }

    const pending = tasks.filter(t => !t.completed);
    const done = tasks.filter(t => t.completed);
    const priorityColors = { high: 'var(--color-danger)', medium: 'var(--accent-amber)', low: 'var(--color-success)' };
    const priorityLabels = { high: '🔴 عالية', medium: '🟡 متوسطة', low: '🟢 منخفضة' };
    const catLabels = { work: '💼 عمل', personal: '👤 شخصي', study: '📚 دراسة', health: '💪 صحة', finance: '💰 مالية' };

    const renderTask = (t) => `
      <div style="display:flex; align-items:flex-start; gap:var(--space-3); padding:var(--space-4); background:var(--bg-secondary); border-radius:var(--radius-lg); border:1px solid var(--border-subtle); border-right:4px solid ${priorityColors[t.priority] || 'var(--border-subtle)'}; opacity:${t.completed ? '0.6' : '1'}; transition:0.2s;" id="task-row-${t.id}">
        <div class="habit-check ${t.completed ? 'checked' : ''}" style="flex-shrink:0; cursor:pointer; margin-top:2px;"
             onclick="PrioritiesModule.toggleTask('${t.id}')">
          ${t.completed ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : ''}
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary); ${t.completed ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${t.title}</div>
          <div style="display:flex; flex-wrap:wrap; gap:var(--space-2); margin-top:var(--space-2);">
            ${t.dueTime ? `<span style="font-size:10px; background:rgba(124,58,237,0.1); color:var(--accent-purple); padding:2px 8px; border-radius:10px; font-weight:700;">⏱️ ${t.dueTime}</span>` : ''}
            ${t.category ? `<span style="font-size:10px; background:var(--bg-body); color:var(--text-muted); padding:2px 8px; border-radius:10px; font-weight:600;">${catLabels[t.category] || t.category}</span>` : ''}
            ${t.priority ? `<span style="font-size:10px; padding:2px 8px; border-radius:10px; font-weight:600; background:${priorityColors[t.priority]}22; color:${priorityColors[t.priority]};">${priorityLabels[t.priority]}</span>` : ''}
          </div>
          ${t.notes ? `<p style="font-size:11px; color:var(--text-muted); margin-top:var(--space-2); line-height:1.5;">📝 ${t.notes}</p>` : ''}
        </div>
        <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--text-muted); flex-shrink:0;" onclick="PrioritiesModule.deleteTask('${t.id}')">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        </button>
      </div>
    `;

    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-3);">
        ${pending.map(renderTask).join('')}
        ${done.length > 0 ? `
          <div style="font-size:11px; font-weight:700; color:var(--text-muted); padding:var(--space-2) 0; display:flex; align-items:center; gap:var(--space-2);">
            <div style="flex:1; height:1px; background:var(--border-subtle);"></div>
            ✅ تم إنجازها (${done.length})
            <div style="flex:1; height:1px; background:var(--border-subtle);"></div>
          </div>
          ${done.map(renderTask).join('')}
        ` : ''}
      </div>
    `;
  },

  // ─── Render Habits List ──────────────────────────────────────────────────
  renderHabitsList(habits, logs, dateKey) {
    if (habits.length === 0) {
      return `
        <div style="background:var(--bg-secondary); border:2px dashed var(--border-subtle); border-radius:var(--radius-lg); padding:var(--space-6); text-align:center; color:var(--text-muted);">
          <div style="font-size:32px; margin-bottom:var(--space-3);">🔁</div>
          <div style="font-size:var(--font-size-sm); font-weight:600;">لا توجد عادات مضافة بعد</div>
          <div style="font-size:12px; margin-top:var(--space-1);">اذهب لصفحة "العادات" لإضافة عاداتك اليومية</div>
          <button class="btn btn-ghost btn-sm" style="margin-top:var(--space-3);" onclick="navigateTo('habits')">الذهاب لصفحة العادات</button>
        </div>
      `;
    }

    return `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:var(--space-3);">
        ${habits.map(h => {
          const done = logs[h.id];
          const streak = calculateStreak(DB.getHabitLogs(), h.id);
          return `
            <div style="display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3) var(--space-4); background:${done ? 'rgba(16,185,129,0.06)' : 'var(--bg-secondary)'}; border:1px solid ${done ? 'rgba(16,185,129,0.25)' : 'var(--border-subtle)'}; border-radius:var(--radius-lg); cursor:pointer; transition:all 0.2s;"
                 onclick="PrioritiesModule.toggleHabit('${h.id}', '${dateKey}')">
              <span style="font-size:28px; flex-shrink:0;">${h.emoji || '⭐'}</span>
              <div style="flex:1; min-width:0;">
                <div style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${h.name}</div>
                ${streak > 0 ? `<div style="font-size:10px; color:var(--accent-amber); font-weight:700; margin-top:2px;">🔥 ${streak} يوم متتالي</div>` : ''}
              </div>
              <div class="habit-check ${done ? 'checked' : ''}">
                ${done ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // ─── Past Days Archive ───────────────────────────────────────────────────
  renderPastDays() {
    const allPriorities = DB.getPriorities();
    const today = todayKey();
    const pastDays = Object.entries(allPriorities)
      .filter(([k]) => k !== today)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6);

    if (pastDays.length === 0) {
      return `<div style="color:var(--text-muted); font-size:var(--font-size-sm);">لا يوجد سجل سابق</div>`;
    }

    return pastDays.map(([dateStr, p]) => `
      <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:var(--space-4);">
        <div style="font-size:11px; color:var(--accent-purple); font-weight:800; margin-bottom:var(--space-2);">${formatDateAr(new Date(dateStr), 'short')}</div>
        ${p.mission ? `<div style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary); margin-bottom:var(--space-2);">🎯 ${p.mission}</div>` : ''}
        ${[1,2,3].filter(n => p[`priority${n}`]).map(n => `
          <div style="font-size:11px; color:var(--text-secondary); display:flex; align-items:center; gap:var(--space-1); margin-bottom:2px;">
            <span style="font-weight:800; color:var(--text-muted); font-size:10px; width:12px;">${n}.</span> ${p[`priority${n}`]}
          </div>
        `).join('')}
      </div>
    `).join('');
  },

  // ─── Actions ─────────────────────────────────────────────────────────────
  autoSave() {
    const key = todayKey();
    const allPriorities = DB.getPriorities();
    allPriorities[key] = {
      ...allPriorities[key],
      mission:    document.getElementById('today-mission')?.value?.trim() || '',
      priority1:  document.getElementById('priority-1')?.value?.trim() || '',
      priority2:  document.getElementById('priority-2')?.value?.trim() || '',
      priority3:  document.getElementById('priority-3')?.value?.trim() || '',
      savedAt: new Date().toISOString(),
    };
    DB.savePriorities(allPriorities);
  },

  // Kept for backward compatibility with old save button in dashboard
  savePriorities() { this.autoSave(); Toast.show('تم الحفظ بنجاح ✅', 'success'); },

  openAddTask() {
    const today = todayKey();
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة مهمة جديدة ✅</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">عنوان المهمة</label>
          <input type="text" id="dp-task-title" class="form-control" placeholder="مثال: مراجعة مادة الشبكات فصل 3" autofocus>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3);">
          <div class="form-group">
            <label class="form-label">الأولوية</label>
            <select id="dp-task-priority" class="form-control">
              <option value="high">🔴 عالية (مهمة جداً)</option>
              <option value="medium" selected>🟡 متوسطة (مهمة)</option>
              <option value="low">🟢 منخفضة (إذا توفر وقت)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">التصنيف</label>
            <select id="dp-task-category" class="form-control">
              <option value="personal">👤 شخصي</option>
              <option value="work">💼 عمل</option>
              <option value="study">📚 دراسة</option>
              <option value="health">💪 صحة</option>
              <option value="finance">💰 مالية</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">موعد الإنجاز (اختياري)</label>
          <input type="time" id="dp-task-time" class="form-control">
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات (اختياري)</label>
          <textarea id="dp-task-notes" class="form-control" rows="2" placeholder="أي تفاصيل إضافية عن المهمة..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="PrioritiesModule.saveNewTask()">إضافة المهمة ✅</button>
      </div>
    `;
    openModal(content);
  },

  saveNewTask() {
    const title = document.getElementById('dp-task-title')?.value?.trim();
    if (!title) { Toast.show('الرجاء إدخال عنوان المهمة', 'error'); return; }

    const tasks = DB.getTasks();
    tasks.push({
      id: generateId(),
      title,
      priority:  document.getElementById('dp-task-priority')?.value || 'medium',
      category:  document.getElementById('dp-task-category')?.value || 'personal',
      date:      todayKey(),
      dueTime:   document.getElementById('dp-task-time')?.value || '',
      notes:     document.getElementById('dp-task-notes')?.value?.trim() || '',
      completed: false,
      createdAt: new Date().toISOString(),
    });
    DB.saveTasks(tasks);
    closeTopModal();
    Toast.show('تمت إضافة المهمة! ✅', 'success');
    this.refreshTasksSection();
  },

  toggleTask(taskId) {
    const tasks = DB.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      DB.saveTasks(tasks);
      this.refreshTasksSection();
      Toast.show(task.completed ? 'رائع! تم إنجاز المهمة 🎉' : 'تمت إعادة تعيين المهمة', task.completed ? 'success' : 'info');
    }
  },

  deleteTask(taskId) {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    const tasks = DB.getTasks().filter(t => t.id !== taskId);
    DB.saveTasks(tasks);
    Toast.show('تم حذف المهمة', 'info');
    this.refreshTasksSection();
  },

  toggleHabit(habitId, dateKey) {
    const logs = DB.getHabitLogs();
    if (!logs[dateKey]) logs[dateKey] = {};
    logs[dateKey][habitId] = !logs[dateKey][habitId];
    DB.saveHabitLogs(logs);
    this.refreshHabitsSection(dateKey);
    Toast.show(logs[dateKey][habitId] ? 'أحسنت! عادة مكتملة 🔥' : 'تم إلغاء التسجيل', logs[dateKey][habitId] ? 'success' : 'info');
  },

  refreshTasksSection() {
    const key = todayKey();
    const tasks = DB.getTasks().filter(t => t.date === key);
    const container = document.getElementById('tasks-list-container');
    if (container) {
      container.innerHTML = this.renderTasksList(tasks);
      if (window.lucide) lucide.createIcons();
    }
    this.updateProgressBar();
  },

  refreshHabitsSection(dateKey) {
    const habits = DB.getHabits().filter(h => h.frequency === 'daily');
    const habitLogs = DB.getHabitLogs()[dateKey] || {};
    const container = document.getElementById('habits-list-container');
    if (container) {
      container.innerHTML = this.renderHabitsList(habits, habitLogs, dateKey);
      if (window.lucide) lucide.createIcons();
    }
    this.updateProgressBar();
  },

  updateProgressBar() {
    const key = todayKey();
    const tasks = DB.getTasks().filter(t => t.date === key);
    const habits = DB.getHabits().filter(h => h.frequency === 'daily');
    const habitLogs = DB.getHabitLogs()[key] || {};
    const doneTasks = tasks.filter(t => t.completed).length;
    const doneHabits = habits.filter(h => habitLogs[h.id]).length;
    const total = tasks.length + habits.length;
    const done = doneTasks + doneHabits;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const bar = document.querySelector('.progress-fill.green');
    const label = bar?.parentElement?.nextElementSibling;
    if (bar) bar.style.width = `${pct}%`;
  },

  toggleQuoteFav(quoteIndex) {
    if (typeof MotivationSystem !== 'undefined') {
      const isFav = MotivationSystem.toggleFavorite(quoteIndex);
      const btn = document.getElementById('pri-fav-quote-btn');
      if (btn) {
        btn.textContent = isFav ? '❤️' : '🤍';
        btn.style.color = isFav ? 'var(--accent-rose)' : 'var(--text-muted)';
      }
    } else {
      toggleFavoriteQuote(quoteIndex);
    }
  },
};
