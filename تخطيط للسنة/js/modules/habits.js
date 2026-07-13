/**
 * LIFE OS — Habits Module
 * Full habit tracking with streaks, graphs, calendar view
 */

const HabitsModule = {
  state: {
    activeTab: 'today',
    activeFreq: 'daily',
  },

  render(container) {
    const habits = DB.getHabits();
    const habitLogs = DB.getHabitLogs();
    const today = todayKey();

    // Stats
    const dailyHabits = habits.filter(h => h.frequency === 'daily');
    const completedToday = dailyHabits.filter(h => habitLogs[today]?.[h.id]).length;
    const totalStreaks = habits.reduce((sum, h) => sum + calculateStreak(habitLogs, h.id), 0);

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">⚡ العادات</h1>
            <p class="page-subtitle">بنِ عادات إيجابية وتابع تقدمك يومياً</p>
          </div>
          <button class="btn btn-primary" onclick="HabitsModule.openAddHabit()">
            <i data-lucide="plus" style="width:16px;height:16px;"></i>
            عادة جديدة
          </button>
        </div>

        <!-- Stats -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);margin-bottom:var(--space-6);">
          <div class="stat-card">
            <div style="font-size:24px;">⚡</div>
            <div class="stat-card-value">${toArabicNumerals(habits.length)}</div>
            <div class="stat-card-label">إجمالي العادات</div>
          </div>
          <div class="stat-card">
            <div style="font-size:24px;">✅</div>
            <div class="stat-card-value" style="color:var(--color-success);">${toArabicNumerals(completedToday)}/${toArabicNumerals(dailyHabits.length)}</div>
            <div class="stat-card-label">أكملت اليوم</div>
          </div>
          <div class="stat-card">
            <div style="font-size:24px;">🔥</div>
            <div class="stat-card-value" style="color:var(--accent-amber);">${toArabicNumerals(Math.max(...habits.map(h => calculateStreak(habitLogs, h.id)), 0))}</div>
            <div class="stat-card-label">أطول سلسلة</div>
          </div>
          <div class="stat-card">
            <div style="font-size:24px;">📊</div>
            <div class="stat-card-value" style="color:var(--accent-blue);">
              ${dailyHabits.length > 0 ? formatPercent((completedToday/dailyHabits.length)*100) : '٠٪'}
            </div>
            <div class="stat-card-label">إنجاز اليوم</div>
          </div>
        </div>

        <!-- View Tabs -->
        <div class="tabs" style="margin-bottom:var(--space-4);max-width:500px;">
          <div class="tab-item ${this.state.activeTab==='today'?'active':''}" onclick="HabitsModule.setTab('today')">اليوم</div>
          <div class="tab-item ${this.state.activeTab==='weekly'?'active':''}" onclick="HabitsModule.setTab('weekly')">أسبوعي</div>
          <div class="tab-item ${this.state.activeTab==='manage'?'active':''}" onclick="HabitsModule.setTab('manage')">إدارة العادات</div>
        </div>

        <div id="habits-content">
          ${this.renderTab()}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  renderTab() {
    switch (this.state.activeTab) {
      case 'today':   return this.renderToday();
      case 'weekly':  return this.renderWeekly();
      case 'manage':  return this.renderManage();
      default:        return this.renderToday();
    }
  },

  setTab(tab) {
    this.state.activeTab = tab;
    document.querySelectorAll('.tab-item').forEach((el, i) => {
      const tabs = ['today','weekly','manage'];
      el.classList.toggle('active', tabs[i] === tab);
    });
    const c = document.getElementById('habits-content');
    if (c) {
      c.innerHTML = this.renderTab();
      if (window.lucide) lucide.createIcons();
    }
  },

  renderToday() {
    const habits = DB.getHabits();
    const habitLogs = DB.getHabitLogs();
    const today = todayKey();
    const dayLog = habitLogs[today] || {};

    if (habits.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="repeat" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد عادات بعد</h3>
          <p>ابدأ ببناء عاداتك الإيجابية</p>
          <button class="btn btn-primary" onclick="HabitsModule.openAddHabit()">أضف عادة الآن</button>
        </div>
      `;
    }

    const byFreq = { daily: [], weekly: [], monthly: [] };
    habits.forEach(h => {
      if (byFreq[h.frequency]) byFreq[h.frequency].push(h);
      else byFreq.daily.push(h);
    });

    return `
      <div style="display:flex;flex-direction:column;gap:var(--space-6);">
        ${Object.entries(byFreq).filter(([,h]) => h.length > 0).map(([freq, freqHabits]) => `
          <div>
            <div class="section-header">
              <div class="section-title">
                ${{ daily:'🌅 يومية', weekly:'📅 أسبوعية', monthly:'🗓️ شهرية' }[freq] || freq}
              </div>
              <span class="badge badge-gray">${toArabicNumerals(freqHabits.length)} عادة</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:var(--space-2);">
              ${freqHabits.map(habit => {
                const done = dayLog[habit.id];
                const streak = calculateStreak(habitLogs, habit.id);
                const longestStreak = this.getLongestStreak(habitLogs, habit.id);

                return `
                  <div class="habit-row" style="cursor:pointer;" onclick="HabitsModule.toggleToday('${habit.id}')">
                    <div class="habit-icon-wrapper" style="background:${habit.color || 'rgba(124,58,237,0.15)'}25;font-size:20px;width:44px;height:44px;">
                      ${habit.emoji || '⭐'}
                    </div>
                    <div class="habit-info">
                      <div class="habit-name">${habit.name}</div>
                      <div class="habit-meta">
                        <span class="habit-streak">🔥 ${toArabicNumerals(streak)}</span>
                        <span>أطول: ${toArabicNumerals(longestStreak)}</span>
                        <span>${habit.category || ''}</span>
                      </div>
                    </div>
                    <div class="habit-check ${done ? 'checked' : ''}" data-habit-id="${habit.id}">
                      ${done ? '<i data-lucide="check" style="width:16px;height:16px;"></i>' : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderWeekly() {
    const habits = DB.getHabits().filter(h => h.frequency === 'daily');
    const habitLogs = DB.getHabitLogs();

    // Get last 7 days
    const days = Array.from({length: 7}, (_, i) => {
      const d = addDays(new Date(), -6 + i);
      return { date: d, key: d.toISOString().split('T')[0] };
    });

    if (habits.length === 0) {
      return `<div class="empty-state"><h3>أضف عادات أولاً</h3></div>`;
    }

    return `
      <div class="card" style="overflow-x:auto;">
        <div style="min-width:600px;">
          <!-- Header -->
          <div style="display:grid;grid-template-columns:200px repeat(7,1fr);gap:var(--space-1);margin-bottom:var(--space-2);">
            <div></div>
            ${days.map(d => `
              <div style="text-align:center;">
                <div style="font-size:var(--font-size-xs);font-weight:700;color:var(--text-muted);">${formatDateAr(d.date,'weekday-short')}</div>
                <div style="font-size:var(--font-size-xs);color:${isToday(d.date)?'var(--accent-purple-light)':'var(--text-secondary)'};">${toArabicNumerals(d.date.getDate())}</div>
              </div>
            `).join('')}
          </div>

          <!-- Habit Rows -->
          ${habits.map(habit => `
            <div style="display:grid;grid-template-columns:200px repeat(7,1fr);gap:var(--space-1);align-items:center;margin-bottom:var(--space-1);">
              <div style="display:flex;align-items:center;gap:var(--space-2);">
                <span style="font-size:18px;">${habit.emoji||'⭐'}</span>
                <span style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${habit.name}</span>
              </div>
              ${days.map(d => {
                const done = habitLogs[d.key]?.[habit.id];
                const isPast = d.date < new Date() && !isToday(d.date);
                return `
                  <div style="display:flex;justify-content:center;">
                    <div class="habit-week-dot ${done ? 'done' : isPast ? 'missed' : ''}"
                         style="cursor:pointer;"
                         onclick="HabitsModule.toggleDay('${habit.id}','${d.key}')">
                      ${done ? '✓' : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderManage() {
    const habits = DB.getHabits();

    if (habits.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="repeat" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد عادات</h3>
          <button class="btn btn-primary" onclick="HabitsModule.openAddHabit()">أضف أول عادة</button>
        </div>
      `;
    }

    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--space-4);">
        ${habits.map(habit => this.renderHabitCard(habit)).join('')}
      </div>
    `;
  },

  renderHabitCard(habit) {
    const habitLogs = DB.getHabitLogs();
    const streak = calculateStreak(habitLogs, habit.id);
    const longestStreak = this.getLongestStreak(habitLogs, habit.id);
    const completionRate = this.getCompletionRate(habitLogs, habit.id);

    return `
      <div class="card" style="position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-3);">
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <div style="font-size:32px;">${habit.emoji || '⭐'}</div>
            <div>
              <div style="font-size:var(--font-size-base);font-weight:700;color:var(--text-primary);">${habit.name}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">${{ daily:'يومية', weekly:'أسبوعية', monthly:'شهرية' }[habit.frequency] || habit.frequency}</div>
            </div>
          </div>
          <div style="display:flex;gap:var(--space-1);">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="HabitsModule.openEditHabit('${habit.id}')">
              <i data-lucide="edit-2" style="width:14px;height:14px;"></i>
            </button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="HabitsModule.deleteHabit('${habit.id}')">
              <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-2);text-align:center;">
          <div style="background:rgba(245,158,11,0.1);border-radius:var(--radius-md);padding:var(--space-2);">
            <div style="font-size:var(--font-size-xl);font-weight:800;color:var(--accent-amber);">🔥${toArabicNumerals(streak)}</div>
            <div style="font-size:10px;color:var(--text-muted);">السلسلة الحالية</div>
          </div>
          <div style="background:rgba(124,58,237,0.1);border-radius:var(--radius-md);padding:var(--space-2);">
            <div style="font-size:var(--font-size-xl);font-weight:800;color:var(--accent-purple-light);">⭐${toArabicNumerals(longestStreak)}</div>
            <div style="font-size:10px;color:var(--text-muted);">الأطول</div>
          </div>
          <div style="background:rgba(16,185,129,0.1);border-radius:var(--radius-md);padding:var(--space-2);">
            <div style="font-size:var(--font-size-xl);font-weight:800;color:var(--color-success);">${formatPercent(completionRate)}</div>
            <div style="font-size:10px;color:var(--text-muted);">إنجاز ٣٠ يوم</div>
          </div>
        </div>

        <!-- 7-day view -->
        <div style="display:flex;gap:4px;margin-top:var(--space-3);">
          ${Array.from({length: 7}, (_, i) => {
            const d = addDays(new Date(), -6 + i);
            const key = d.toISOString().split('T')[0];
            const done = DB.getHabitLogs()[key]?.[habit.id];
            return `<div style="flex:1;height:6px;border-radius:3px;background:${done ? 'var(--color-success)' : d < new Date() && !isToday(d) ? 'var(--accent-rose)' : 'var(--bg-elevated)'};"></div>`;
          }).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-muted);margin-top:2px;">
          <span>٧ أيام</span><span>اليوم</span>
        </div>
      </div>
    `;
  },

  getLongestStreak(logs, habitId) {
    const allDays = Object.keys(logs).sort();
    let longest = 0, current = 0;
    allDays.forEach(key => {
      if (logs[key]?.[habitId]) { current++; longest = Math.max(longest, current); }
      else current = 0;
    });
    return longest;
  },

  getCompletionRate(logs, habitId) {
    let total = 0, done = 0;
    for (let i = 0; i < 30; i++) {
      const d = addDays(new Date(), -i);
      const key = d.toISOString().split('T')[0];
      total++;
      if (logs[key]?.[habitId]) done++;
    }
    return total > 0 ? (done / total) * 100 : 0;
  },

  toggleToday(habitId) {
    const logs = DB.getHabitLogs();
    const key = todayKey();
    if (!logs[key]) logs[key] = {};
    logs[key][habitId] = !logs[key][habitId];
    DB.saveHabitLogs(logs);

    const el = document.querySelector(`[data-habit-id="${habitId}"]`);
    if (el) {
      const done = logs[key][habitId];
      el.classList.toggle('checked', done);
      el.innerHTML = done ? '<i data-lucide="check" style="width:16px;height:16px;"></i>' : '';
      if (window.lucide) lucide.createIcons();
    }
    Toast.show(logs[key][habitId] ? '🔥 أحسنت! عادة مكتملة!' : 'تم إلغاء التسجيل', logs[key][habitId] ? 'success' : 'info');
  },

  toggleDay(habitId, dateStr) {
    const logs = DB.getHabitLogs();
    if (!logs[dateStr]) logs[dateStr] = {};
    logs[dateStr][habitId] = !logs[dateStr][habitId];
    DB.saveHabitLogs(logs);
    this.setTab('weekly');
  },

  openAddHabit() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">عادة جديدة ⚡</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">اسم العادة</label>
          <input type="text" id="habit-name" class="form-control" placeholder="مثال: الصلاة، القراءة...">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">الرمز</label>
            <div style="display:flex;flex-wrap:wrap;gap:var(--space-1);">
              ${HABIT_EMOJIS.map(e => `
                <button class="btn btn-ghost" style="font-size:20px;padding:4px 8px;border-radius:var(--radius-sm);"
                        onclick="document.getElementById('habit-emoji').value='${e}';this.parentElement.querySelectorAll('.selected-emoji').forEach(x=>x.classList.remove('selected-emoji'));this.style.background='rgba(124,58,237,0.2)';">
                  ${e}
                </button>
              `).join('')}
            </div>
            <input type="text" id="habit-emoji" class="form-control" placeholder="🌟" maxlength="2" style="margin-top:var(--space-2);">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">التكرار</label>
            <select id="habit-frequency" class="form-control">
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الفئة</label>
            <select id="habit-category" class="form-control">
              ${CATEGORIES.map(c => `<option value="${c.ar}">${c.icon} ${c.ar}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">اللون</label>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            ${['#7c3aed','#3b82f6','#10b981','#f59e0b','#f43f5e','#06b6d4','#f97316','#8b5cf6'].map(c => `
              <div style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:2px solid transparent;"
                   onclick="document.getElementById('habit-color').value='${c}';document.querySelectorAll('.color-swatch').forEach(s=>s.style.border='2px solid transparent');this.style.border='2px solid white';"
                   class="color-swatch"></div>
            `).join('')}
            <input type="color" id="habit-color" value="#7c3aed" style="width:28px;height:28px;border-radius:50%;cursor:pointer;border:none;padding:0;">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">تذكير (اختياري)</label>
          <input type="time" id="habit-reminder" class="form-control">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="HabitsModule.saveHabit()">حفظ العادة</button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
  },

  saveHabit() {
    const name = document.getElementById('habit-name')?.value?.trim();
    if (!name) { Toast.show('الرجاء إدخال اسم العادة', 'error'); return; }

    const habits = DB.getHabits();
    habits.push({
      id: generateId(),
      name,
      emoji: document.getElementById('habit-emoji')?.value || '⭐',
      frequency: document.getElementById('habit-frequency')?.value || 'daily',
      category: document.getElementById('habit-category')?.value || '',
      color: document.getElementById('habit-color')?.value || '#7c3aed',
      reminder: document.getElementById('habit-reminder')?.value || '',
      createdAt: new Date().toISOString(),
    });
    DB.saveHabits(habits);
    closeTopModal();
    Toast.show('تمت إضافة العادة! ⚡', 'success');
    renderModule('habits');
  },

  deleteHabit(habitId) {
    if (!confirm('هل أنت متأكد من حذف هذه العادة؟')) return;
    let habits = DB.getHabits();
    habits = habits.filter(h => h.id !== habitId);
    DB.saveHabits(habits);
    Toast.show('تم حذف العادة', 'info');
    renderModule('habits');
  },

  openEditHabit(habitId) {
    const habits = DB.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تعديل العادة</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">اسم العادة</label>
          <input type="text" id="edit-habit-name" class="form-control" value="${habit.name}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">الرمز</label>
            <input type="text" id="edit-habit-emoji" class="form-control" value="${habit.emoji || '⭐'}" maxlength="2">
          </div>
          <div class="form-group">
            <label class="form-label">التكرار</label>
            <select id="edit-habit-frequency" class="form-control">
              <option value="daily" ${habit.frequency==='daily'?'selected':''}>يومي</option>
              <option value="weekly" ${habit.frequency==='weekly'?'selected':''}>أسبوعي</option>
              <option value="monthly" ${habit.frequency==='monthly'?'selected':''}>شهري</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="HabitsModule.updateHabit('${habitId}')">حفظ</button>
      </div>
    `;
    openModal(content);
  },

  updateHabit(habitId) {
    const name = document.getElementById('edit-habit-name')?.value?.trim();
    if (!name) { Toast.show('الرجاء إدخال اسم العادة', 'error'); return; }
    const habits = DB.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      habit.name = name;
      habit.emoji = document.getElementById('edit-habit-emoji')?.value || habit.emoji;
      habit.frequency = document.getElementById('edit-habit-frequency')?.value || habit.frequency;
      DB.saveHabits(habits);
    }
    closeTopModal();
    Toast.show('تم تحديث العادة!', 'success');
    renderModule('habits');
  },
};
