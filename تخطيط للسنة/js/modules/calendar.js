/**
 * LIFE OS — Premium Calendar Module
 * Daily, Weekly, Monthly, Yearly Planning & Tracking
 */

const CalendarModule = {
  state: {
    view: 'monthly',
    currentDate: new Date(),
    selectedDate: new Date(),
    autoCarryTasks: false,
    filterMode: 'all', // all, tasks, habits, events
  },

  render(container) {
    container.innerHTML = `
      <div class="page-content" style="max-width:1200px; margin: 0 auto;">
        <div class="page-header" style="align-items:flex-start; margin-bottom:var(--space-6);">
          <div>
            <h1 class="page-title" style="font-size:2.5rem;">📅 التقويم</h1>
            <p class="page-subtitle" style="font-size:1.1rem; margin-top:var(--space-2);">خطط لحياتك، تتبع أيامك، وابنِ عاداتك باستمرارية</p>
          </div>
          <div class="header-actions" style="display:flex; gap:var(--space-3); flex-wrap:wrap;">
            <button class="btn btn-secondary" onclick="CalendarModule.goToToday()">اليوم</button>
            <button class="btn btn-primary" onclick="CalendarModule.openAddEvent()">+ حدث جديد</button>
          </div>
        </div>

        <!-- View Tabs -->
        <div class="tabs" style="margin-bottom:var(--space-6); background:var(--bg-secondary); padding:var(--space-2); border-radius:var(--radius-lg); display:inline-flex;">
          <div class="tab-item ${this.state.view==='daily'?'active':''}" onclick="CalendarModule.setView('daily')">اليوم</div>
          <div class="tab-item ${this.state.view==='weekly'?'active':''}" onclick="CalendarModule.setView('weekly')">الأسبوع</div>
          <div class="tab-item ${this.state.view==='monthly'?'active':''}" onclick="CalendarModule.setView('monthly')">الشهر</div>
          <div class="tab-item ${this.state.view==='yearly'?'active':''}" onclick="CalendarModule.setView('yearly')">السنة</div>
          <div class="tab-item ${this.state.view==='stats'?'active':''}" onclick="CalendarModule.setView('stats')">الإحصائيات</div>
        </div>

        <div id="calendar-view-container">
          ${this.renderView()}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    if (this.state.view === 'stats') this.initStatsCharts();
  },

  renderView() {
    switch (this.state.view) {
      case 'daily':   return this.renderDaily();
      case 'weekly':  return this.renderWeekly();
      case 'monthly': return this.renderMonthly();
      case 'yearly':  return this.renderYearly();
      case 'stats':   return this.renderStats();
      default:        return this.renderMonthly();
    }
  },

  setView(view) {
    this.state.view = view;
    this.refreshView();
    const tabs = document.querySelectorAll('.tab-item');
    if (tabs.length) {
      const views = ['daily','weekly','monthly','yearly','stats'];
      tabs.forEach((tab, i) => { tab.classList.toggle('active', views[i] === view); });
    }
  },

  refreshView() {
    const container = document.getElementById('calendar-view-container');
    if (container) {
      container.innerHTML = this.renderView();
      if (window.lucide) lucide.createIcons();
      if (this.state.view === 'stats') setTimeout(() => this.initStatsCharts(), 100);
    }
  },

  // ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
  getDayStatus(dateStr) {
    const cDays = DB.getCalendarDays();
    if (cDays[dateStr]?.completed) return 'completed';

    const tasks = DB.getTasks().filter(t => t.date === dateStr);
    const habits = DB.getHabits().filter(h => h.frequency === 'daily');
    const logs = DB.getHabitLogs()[dateStr] || {};
    
    const tasksDone = tasks.filter(t => t.completed).length;
    const habitsDone = habits.filter(h => logs[h.id]).length;
    
    const totalItems = tasks.length + habits.length;
    const totalDone = tasksDone + habitsDone;

    const targetDate = new Date(dateStr);
    targetDate.setHours(23,59,59,999); // end of that day
    const isPast = targetDate < new Date();

    if (totalItems === 0) return isPast ? 'no-data' : 'no-data';
    if (totalDone === totalItems) return 'completed'; // auto-complete
    if (totalDone > 0) return 'partial';
    return isPast ? 'missed' : 'no-data';
  },

  getStatusColor(status) {
    switch(status) {
      case 'completed': return 'var(--color-success)'; // 🟢
      case 'partial': return 'var(--accent-amber)'; // 🟡
      case 'missed': return 'var(--color-danger)'; // 🔴
      default: return 'var(--border-subtle)'; // ⚪
    }
  },

  // ─── DAILY VIEW ──────────────────────────────────────────────────────────────
  renderDaily() {
    const date = this.state.selectedDate;
    const dateStr = date.toISOString().split('T')[0];
    const isToday_ = isSameDay(date, new Date());
    
    if (this.state.autoCarryTasks && isToday_) {
      this.carryOverTasks(dateStr);
    }

    const cDays = DB.getCalendarDays();
    const dayData = cDays[dateStr] || {};
    const status = this.getDayStatus(dateStr);
    const statusColor = this.getStatusColor(status);

    let filteredTasks = DB.getTasks().filter(t => t.date === dateStr);
    let filteredEvents = DB.getEvents().filter(e => e.date === dateStr);
    let filteredHabits = DB.getHabits().filter(h => h.frequency === 'daily');

    if (this.state.filterMode === 'tasks') { filteredEvents = []; filteredHabits = []; }
    if (this.state.filterMode === 'events') { filteredTasks = []; filteredHabits = []; }
    if (this.state.filterMode === 'habits') { filteredTasks = []; filteredEvents = []; }

    const dayLog = DB.getHabitLogs()[dateStr] || {};
    const jEntries = DB.getJournalEntries().filter(j => j.createdAt.startsWith(dateStr));
    
    const progressPct = this.calculateDayProgress(dateStr);

    return `
      <div class="calendar-container animate-fade-in" style="background:transparent; border:none; padding:0;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); background:var(--bg-secondary); padding:var(--space-4); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
          <div style="display:flex; align-items:center; gap:var(--space-4);">
            <button class="btn btn-secondary btn-icon" onclick="CalendarModule.prevDay()"><i data-lucide="chevron-right" style="width:20px;height:20px;"></i></button>
            <div style="text-align:center;">
              <h2 style="font-size:2rem; margin:0; font-weight:800; color:${isToday_ ? 'var(--accent-purple-light)' : 'var(--text-primary)'};">${formatDateAr(date, 'full')}</h2>
              ${isToday_ ? '<span style="background:var(--accent-purple); color:white; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700;">اليوم</span>' : ''}
            </div>
            <button class="btn btn-secondary btn-icon" onclick="CalendarModule.nextDay()"><i data-lucide="chevron-left" style="width:20px;height:20px;"></i></button>
          </div>
          
          <div style="display:flex; align-items:center; gap:var(--space-4);">
            <div style="text-align:left; display:flex; flex-direction:column; align-items:flex-end;">
              <div style="font-size:var(--font-size-sm); color:var(--text-muted); margin-bottom:4px;">معدل إنجاز اليوم</div>
              <div style="display:flex; align-items:center; gap:var(--space-2);">
                <div class="progress-bar" style="width:120px; height:8px; margin:0;"><div class="progress-fill green" style="width:${progressPct}%; background:${statusColor};"></div></div>
                <span style="font-weight:700; color:${statusColor}; font-size:1.1rem;">${progressPct}%</span>
              </div>
            </div>
            <button class="btn ${dayData.completed ? 'btn-ghost' : 'btn-primary'}" style="${dayData.completed ? 'color:var(--color-success); border:1px solid var(--color-success);' : ''}" onclick="CalendarModule.toggleDayComplete('${dateStr}')">
              ${dayData.completed ? '✔️ يوم مكتمل بنجاح' : '✔️ تعيين كمكتمل'}
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:3fr 2fr; gap:var(--space-6);">
          
          <!-- Left Column (Tasks, Habits, Events) -->
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            <!-- Filters & Auto-carry -->
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-secondary); padding:var(--space-3) var(--space-4); border-radius:var(--radius-md);">
              <div style="display:flex; gap:var(--space-2);">
                <select class="form-control" style="width:auto; padding:4px 8px; height:auto; font-size:12px;" onchange="CalendarModule.setFilter(this.value)">
                  <option value="all" ${this.state.filterMode==='all'?'selected':''}>الكل</option>
                  <option value="tasks" ${this.state.filterMode==='tasks'?'selected':''}>المهام فقط</option>
                  <option value="habits" ${this.state.filterMode==='habits'?'selected':''}>العادات فقط</option>
                  <option value="events" ${this.state.filterMode==='events'?'selected':''}>الأحداث فقط</option>
                </select>
              </div>
              <label style="display:flex; align-items:center; gap:var(--space-2); font-size:13px; color:var(--text-muted); cursor:pointer;">
                <input type="checkbox" ${this.state.autoCarryTasks ? 'checked' : ''} onchange="CalendarModule.toggleAutoCarry()" style="accent-color:var(--accent-purple);">
                ترحيل المهام غير المكتملة تلقائياً لليوم
              </label>
            </div>

            <!-- Tasks -->
            ${this.state.filterMode==='all' || this.state.filterMode==='tasks' ? `
            <div class="card" style="border-top: 3px solid var(--accent-blue);">
              <div class="card-header" style="padding-bottom:var(--space-2); border-bottom:1px solid var(--border-subtle); margin-bottom:var(--space-3);">
                <div class="card-title" style="display:flex; align-items:center; gap:var(--space-2);">✅ مهام اليوم <span style="font-size:12px; background:var(--bg-body); padding:2px 8px; border-radius:10px;">${filteredTasks.length}</span></div>
                <button class="btn btn-ghost btn-sm" onclick="openQuickTask()">+ إضافة مهمة</button>
              </div>
              <div style="display:flex; flex-direction:column; gap:var(--space-2);">
                ${filteredTasks.length === 0 ? `<div style="text-align:center; padding:var(--space-4); color:var(--text-muted); font-size:13px;">لا توجد مهام</div>` : 
                  filteredTasks.map(t => `
                  <div class="task-item ${t.completed?'completed':''}" style="padding:var(--space-3); background:var(--bg-body); border-radius:var(--radius-md); transition:0.2s;" onclick="CalendarModule.toggleDayTask('${t.id}')">
                    <div class="habit-check ${t.completed?'checked':''}">
                      ${t.completed ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : ''}
                    </div>
                    <div class="priority-dot ${t.priority||'medium'}"></div>
                    <span class="task-text" style="font-weight:600;">${t.title}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Habits -->
            ${this.state.filterMode==='all' || this.state.filterMode==='habits' ? `
            <div class="card" style="border-top: 3px solid var(--color-success);">
              <div class="card-header" style="padding-bottom:var(--space-2); border-bottom:1px solid var(--border-subtle); margin-bottom:var(--space-3);">
                <div class="card-title" style="display:flex; align-items:center; gap:var(--space-2);">⚡ العادات <span style="font-size:12px; background:var(--bg-body); padding:2px 8px; border-radius:10px;">${filteredHabits.length}</span></div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3);">
                ${filteredHabits.length === 0 ? `<div style="grid-column:span 2; text-align:center; padding:var(--space-4); color:var(--text-muted); font-size:13px;">لا توجد عادات</div>` : 
                  filteredHabits.map(h => {
                    const done = dayLog[h.id];
                    return `
                    <div class="habit-row" style="background:var(--bg-body); border-radius:var(--radius-md); padding:var(--space-2) var(--space-3);" onclick="CalendarModule.toggleDayHabit('${h.id}','${dateStr}')">
                      <span style="font-size:24px;">${h.emoji||'⭐'}</span>
                      <div class="habit-info"><div class="habit-name" style="font-weight:600;">${h.name}</div></div>
                      <div class="habit-check ${done?'checked':''}">
                        ${done ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : ''}
                      </div>
                    </div>
                  `}).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Events -->
            ${this.state.filterMode==='all' || this.state.filterMode==='events' ? `
            <div class="card" style="border-top: 3px solid var(--accent-amber);">
              <div class="card-header" style="padding-bottom:var(--space-2); border-bottom:1px solid var(--border-subtle); margin-bottom:var(--space-3);">
                <div class="card-title" style="display:flex; align-items:center; gap:var(--space-2);">🗓 الأحداث والمواعيد <span style="font-size:12px; background:var(--bg-body); padding:2px 8px; border-radius:10px;">${filteredEvents.length}</span></div>
                <button class="btn btn-ghost btn-sm" onclick="CalendarModule.openAddEvent('${dateStr}')">+ حدث</button>
              </div>
              <div style="display:flex; flex-direction:column; gap:var(--space-2);">
                ${filteredEvents.length === 0 ? `<div style="text-align:center; padding:var(--space-4); color:var(--text-muted); font-size:13px;">لا توجد أحداث</div>` : 
                  filteredEvents.map(e => `
                  <div class="task-item" style="background:var(--bg-body); border-radius:var(--radius-md); padding:var(--space-3);">
                    <span style="font-size:20px;">${e.emoji||'🗓'}</span>
                    <div>
                      <div class="task-text" style="font-weight:700;">${e.title}</div>
                      <div class="task-meta" style="color:var(--text-muted); font-size:11px;">${e.time||'طوال اليوم'} ${e.description ? '· ' + e.description : ''}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Right Column (Planning, Notes, Reflection) -->
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            <div class="card" style="background:var(--bg-body); height:100%; display:flex; flex-direction:column;">
              <h3 style="font-size:1.1rem; margin-bottom:var(--space-3); display:flex; align-items:center; gap:var(--space-2);">📝 تخطيط وملاحظات اليوم</h3>
              <textarea class="form-control" style="flex:1; min-height:150px; resize:vertical; font-family:inherit; line-height:1.6;" placeholder="اكتب خطتك لهذا اليوم، أفكارك، أو أي ملاحظات..."
                onchange="CalendarModule.saveDayField('${dateStr}', 'notes', this.value)"
              >${dayData.notes || ''}</textarea>
              
              <h3 style="font-size:1.1rem; margin-top:var(--space-4); margin-bottom:var(--space-3); display:flex; align-items:center; gap:var(--space-2);">🧘 تأمل اليوم (Reflection)</h3>
              <textarea class="form-control" style="min-height:100px; resize:vertical; font-family:inherit; line-height:1.6;" placeholder="كيف كان يومك؟ ما الذي تعلمته؟"
                onchange="CalendarModule.saveDayField('${dateStr}', 'reflection', this.value)"
              >${dayData.reflection || ''}</textarea>
              
              ${jEntries.length > 0 ? `
              <div style="margin-top:var(--space-4); padding-top:var(--space-3); border-top:1px solid var(--border-subtle);">
                <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:var(--space-2);">📔 مرتبط باليوميات:</div>
                ${jEntries.map(j => `<div style="font-size:13px; background:var(--bg-secondary); padding:var(--space-2); border-radius:4px; margin-bottom:4px;">${j.content.substring(0,60)}...</div>`).join('')}
              </div>` : ''}
            </div>
          </div>
          
        </div>
      </div>
    `;
  },

  // ─── WEEKLY VIEW ─────────────────────────────────────────────────────────────
  renderWeekly() {
    const { start, end } = getWeekRange(this.state.currentDate);
    const planKey = `week_${start.toISOString().split('T')[0]}`;
    const plans = DB.getCalendarPlans();
    const weekPlan = plans[planKey] || {};

    const days = [];
    let d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }

    let completedDaysInWeek = 0;
    const daysHtml = days.map(day => {
      const dateStr = day.toISOString().split('T')[0];
      const status = this.getDayStatus(dateStr);
      if (status === 'completed') completedDaysInWeek++;
      const color = this.getStatusColor(status);
      const isToday_ = isToday(day);
      
      const dayTasks = DB.getTasks().filter(t => t.date === dateStr);
      
      return `
        <div class="card" style="cursor:pointer; padding:var(--space-3); text-align:center; position:relative; overflow:hidden; border:2px solid transparent; ${isToday_ ? 'border-color:var(--accent-purple); background:rgba(124,58,237,0.05);' : ''}"
             onclick="CalendarModule.selectDay('${dateStr}')">
          <div style="position:absolute; top:0; left:0; right:0; height:4px; background:${color};"></div>
          <div style="font-size:var(--font-size-xs); color:var(--text-muted); font-weight:700; margin-top:8px;">${formatDateAr(day,'weekday-short')}</div>
          <div style="font-size:2rem; font-weight:800; color:${isToday_ ? 'var(--accent-purple)' : 'var(--text-primary)'}; margin:var(--space-2) 0;">
            ${toArabicNumerals(day.getDate())}
          </div>
          <div style="font-size:10px; color:var(--text-muted); margin-bottom:var(--space-2);">${status === 'completed' ? '✔️ مكتمل' : status === 'partial' ? '🟡 جزئي' : status === 'missed' ? '🔴 فائت' : '⚪ لم يحدد'}</div>
          
          <div style="text-align:right; margin-top:var(--space-3);">
            ${dayTasks.slice(0,3).map(t => `
              <div style="font-size:10px; padding:3px 6px; background:var(--bg-secondary); border-radius:4px; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-decoration:${t.completed?'line-through':''}; opacity:${t.completed?0.5:1};">
                ${t.title}
              </div>
            `).join('')}
            ${dayTasks.length > 3 ? `<div style="font-size:10px; color:var(--text-muted); text-align:center;">+${dayTasks.length-3} مهام أخرى</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const progressPct = Math.round((completedDaysInWeek / 7) * 100);

    return `
      <div class="calendar-container animate-fade-in" style="background:transparent; border:none; padding:0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); background:var(--bg-secondary); padding:var(--space-4); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
          <div style="display:flex; align-items:center; gap:var(--space-4);">
            <button class="btn btn-secondary btn-icon" onclick="CalendarModule.prevWeek()"><i data-lucide="chevron-right" style="width:20px;height:20px;"></i></button>
            <div style="text-align:center;">
              <h2 style="font-size:1.8rem; margin:0; font-weight:800; color:var(--text-primary);">${formatDateAr(start, 'day-month')} - ${formatDateAr(end, 'day-month')}</h2>
            </div>
            <button class="btn btn-secondary btn-icon" onclick="CalendarModule.nextWeek()"><i data-lucide="chevron-left" style="width:20px;height:20px;"></i></button>
          </div>
          
          <div style="text-align:left; display:flex; flex-direction:column; align-items:flex-end;">
            <div style="font-size:var(--font-size-sm); color:var(--text-muted); margin-bottom:4px;">إنجاز الأسبوع (${completedDaysInWeek}/7 أيام)</div>
            <div style="display:flex; align-items:center; gap:var(--space-2);">
              <div class="progress-bar" style="width:150px; height:8px; margin:0;"><div class="progress-fill green" style="width:${progressPct}%;"></div></div>
              <span style="font-weight:700; color:var(--color-success); font-size:1.1rem;">${progressPct}%</span>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:var(--space-3); margin-bottom:var(--space-6);">
          ${daysHtml}
        </div>
        
        <div class="card" style="background:var(--bg-secondary);">
          <h3 style="font-size:1.2rem; margin-bottom:var(--space-3); display:flex; align-items:center; gap:var(--space-2);">🎯 خطة وأهداف الأسبوع</h3>
          <textarea class="form-control" style="width:100%; min-height:120px; font-family:inherit; background:var(--bg-body);" placeholder="اكتب أولوياتك لهذا الأسبوع..."
            onchange="CalendarModule.savePlanField('${planKey}', 'goals', this.value)"
          >${weekPlan.goals || ''}</textarea>
        </div>
      </div>
    `;
  },

  // ─── MONTHLY VIEW ────────────────────────────────────────────────────────────
  renderMonthly() {
    const date = this.state.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    const planKey = `month_${year}_${month}`;
    const plans = DB.getCalendarPlans();
    const monthPlan = plans[planKey] || {};

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 1) % 7; // Shift to Saturday start
    const daysInMonth = lastDay.getDate();

    let dayCells = '';
    let completedDaysInMonth = 0;

    for (let i = 0; i < startDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startDayOfWeek + i + 1);
      dayCells += `<div class="calendar-day other-month" style="opacity:0.3;"><div class="day-number">${toArabicNumerals(prevDate.getDate())}</div></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const dateStr = dayDate.toISOString().split('T')[0];
      const isToday_ = isSameDay(dayDate, new Date());
      const isSelected = isSameDay(dayDate, this.state.selectedDate);

      const status = this.getDayStatus(dateStr);
      if (status === 'completed') completedDaysInMonth++;
      const color = this.getStatusColor(status);

      const dayEvents = DB.getEvents().filter(e => e.date === dateStr);

      dayCells += `
        <div class="calendar-day ${isToday_ ? 'today' : ''} ${isSelected ? 'selected' : ''}"
             style="cursor:pointer; position:relative; border:1px solid var(--border-subtle); padding:var(--space-2);"
             onclick="CalendarModule.selectDay('${dateStr}')">
          <div style="position:absolute; top:0; left:0; right:0; height:4px; background:${color};"></div>
          <div class="day-number ${isToday_ ? 'today-num' : ''}" style="margin-top:6px; font-weight:800;">${toArabicNumerals(d)}</div>
          
          <div class="day-events" style="margin-top:var(--space-2);">
            ${dayEvents.slice(0,2).map(e => `
              <div style="font-size:9px; background:rgba(245,158,11,0.15); color:var(--accent-amber); border-radius:3px; padding:2px 4px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.title}</div>
            `).join('')}
            ${status === 'completed' ? `<div style="text-align:center; font-size:12px; margin-top:4px;">✔️</div>` : ''}
          </div>
        </div>
      `;
    }

    const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;
    let nextDay = 1;
    for (let i = startDayOfWeek + daysInMonth; i < totalCells; i++) {
      dayCells += `<div class="calendar-day other-month" style="opacity:0.3;"><div class="day-number">${toArabicNumerals(nextDay++)}</div></div>`;
    }

    const progressPct = Math.round((completedDaysInMonth / daysInMonth) * 100);

    return `
      <div class="calendar-container animate-fade-in" style="background:transparent; border:none; padding:0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); background:var(--bg-secondary); padding:var(--space-4); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
          <div style="display:flex; align-items:center; gap:var(--space-4);">
            <button class="btn btn-secondary btn-icon" onclick="CalendarModule.prevMonth()"><i data-lucide="chevron-right" style="width:20px;height:20px;"></i></button>
            <div style="text-align:center;">
              <h2 style="font-size:1.8rem; margin:0; font-weight:800; color:var(--text-primary);">${formatDateAr(date, 'month-year')}</h2>
            </div>
            <button class="btn btn-secondary btn-icon" onclick="CalendarModule.nextMonth()"><i data-lucide="chevron-left" style="width:20px;height:20px;"></i></button>
          </div>
          
          <div style="text-align:left; display:flex; flex-direction:column; align-items:flex-end;">
            <div style="font-size:var(--font-size-sm); color:var(--text-muted); margin-bottom:4px;">إنجاز الشهر (${completedDaysInMonth}/${daysInMonth})</div>
            <div style="display:flex; align-items:center; gap:var(--space-2);">
              <div class="progress-bar" style="width:150px; height:8px; margin:0;"><div class="progress-fill green" style="width:${progressPct}%;"></div></div>
              <span style="font-weight:700; color:var(--color-success); font-size:1.1rem;">${progressPct}%</span>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div style="display:flex;gap:var(--space-4);margin-bottom:var(--space-3);flex-wrap:wrap; justify-content:center; background:var(--bg-secondary); padding:var(--space-2); border-radius:var(--radius-md);">
          <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-size-sm);font-weight:600;"><div style="width:12px;height:12px;border-radius:50%;background:var(--color-success);"></div> 🟢 مكتمل تماماً</div>
          <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-size-sm);font-weight:600;"><div style="width:12px;height:12px;border-radius:50%;background:var(--accent-amber);"></div> 🟡 مكتمل جزئياً</div>
          <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-size-sm);font-weight:600;"><div style="width:12px;height:12px;border-radius:50%;background:var(--color-danger);"></div> 🔴 فائت</div>
          <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-size-sm);font-weight:600;"><div style="width:12px;height:12px;border-radius:50%;background:var(--border-subtle);"></div> ⚪ مستقبلي/فارغ</div>
        </div>

        <div style="display:grid; grid-template-columns:3fr 1fr; gap:var(--space-4);">
          <div class="card" style="padding:0; overflow:hidden;">
            <div class="calendar-grid" style="border:none;">
              <div class="calendar-weekdays" style="background:var(--bg-secondary); border-bottom:1px solid var(--border-subtle);">
                ${['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map(d => `<div class="weekday-label" style="font-weight:800; padding:var(--space-3) 0;">${d}</div>`).join('')}
              </div>
              <div class="calendar-days" style="grid-auto-rows: minmax(100px, auto);">${dayCells}</div>
            </div>
          </div>
          
          <div class="card" style="background:var(--bg-secondary); height:100%; display:flex; flex-direction:column;">
            <h3 style="font-size:1.2rem; margin-bottom:var(--space-3); display:flex; align-items:center; gap:var(--space-2);">🌟 خطة وأهداف الشهر</h3>
            <textarea class="form-control" style="flex:1; width:100%; min-height:300px; font-family:inherit; background:var(--bg-body);" placeholder="اكتب أهدافك الكبرى لهذا الشهر..."
              onchange="CalendarModule.savePlanField('${planKey}', 'goals', this.value)"
            >${monthPlan.goals || ''}</textarea>
          </div>
        </div>
      </div>
    `;
  },

  // ─── YEARLY & PERSONAL YEAR VIEW ─────────────────────────────────────────────
  renderYearly() {
    const year = this.state.currentDate.getFullYear();
    const months = Array.from({length: 12}, (_, i) => i);
    const planKey = `year_${year}`;
    const plans = DB.getCalendarPlans();
    const yearPlan = plans[planKey] || {};

    // Personal Year Calculation
    const settings = DB.getSettings();
    const bdayStr = settings.birthday || "2000-01-01";
    const today = new Date();
    const bdayParts = bdayStr.split('-');
    const bMonth = parseInt(bdayParts[1]) - 1;
    const bDate = parseInt(bdayParts[2]);

    let pyStart = new Date(today.getFullYear(), bMonth, bDate);
    if (today < pyStart) {
      pyStart = new Date(today.getFullYear() - 1, bMonth, bDate);
    }
    const pyEnd = new Date(pyStart.getFullYear() + 1, pyStart.getMonth(), pyStart.getDate());
    
    const personalYearDays = Math.floor((pyEnd - pyStart) / (1000 * 60 * 60 * 24));
    const daysPassedInPY = Math.floor((today - pyStart) / (1000 * 60 * 60 * 24));
    const pyProgress = Math.min(100, Math.max(0, Math.round((daysPassedInPY / personalYearDays) * 100)));

    return `
      <div class="calendar-container animate-fade-in" style="background:transparent; border:none; padding:0;">
        <!-- Personal Year Tracker -->
        <div class="card" style="margin-bottom:var(--space-6); background:linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.1)); border:1px solid rgba(124,58,237,0.2);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-3);">
            <div>
              <h3 style="font-size:1.4rem; font-weight:800; display:flex; align-items:center; gap:var(--space-2);">🎂 سنتك الشخصية (Personal Year)</h3>
              <p style="font-size:var(--font-size-sm); color:var(--text-muted); margin-top:4px;">من يوم ميلادك (${formatDateAr(pyStart, 'day-month')}) إلى يوم ميلادك القادم (${formatDateAr(pyEnd, 'day-month')})</p>
            </div>
            <div style="text-align:center;">
              <div style="font-size:2.5rem; font-weight:900; color:var(--accent-purple);">${pyProgress}%</div>
            </div>
          </div>
          <div class="progress-bar" style="height:12px; margin-bottom:var(--space-2);">
            <div class="progress-fill" style="width:${pyProgress}%; background:linear-gradient(90deg, var(--accent-blue), var(--accent-purple));"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); font-weight:700;">
            <span>مر: ${daysPassedInPY} يوم</span>
            <span>متبقي: ${personalYearDays - daysPassedInPY} يوم</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); background:var(--bg-secondary); padding:var(--space-4); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
          <div style="display:flex; align-items:center; gap:var(--space-4);">
            <button class="btn btn-secondary btn-icon" onclick="CalendarModule.prevYear()"><i data-lucide="chevron-right" style="width:20px;height:20px;"></i></button>
            <div style="text-align:center;">
              <h2 style="font-size:2rem; margin:0; font-weight:800; color:var(--text-primary);">${toArabicNumerals(year)}</h2>
            </div>
            <button class="btn btn-secondary btn-icon" onclick="CalendarModule.nextYear()"><i data-lucide="chevron-left" style="width:20px;height:20px;"></i></button>
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:3fr 1fr;gap:var(--space-4);">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);">
            ${months.map(m => {
              const monthDate = new Date(year, m, 1);
              const isCurrentMonth = m === new Date().getMonth() && year === new Date().getFullYear();
              return `
                <div class="card" style="cursor:pointer; padding:var(--space-4); text-align:center; transition:0.2s; ${isCurrentMonth ? 'border-color:var(--accent-purple); background:rgba(124,58,237,0.05); transform:scale(1.02);' : ''}"
                     onclick="CalendarModule.goToMonth(${m})">
                  <div style="font-size:1.5rem; font-weight:800; color:${isCurrentMonth?'var(--accent-purple)':'var(--text-primary)'};">
                    ${formatDateAr(monthDate, 'month')}
                  </div>
                  <div style="font-size:var(--font-size-sm); color:var(--text-muted); margin-top:8px;">
                    ${toArabicNumerals(new Date(year, m+1, 0).getDate())} يوم
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="card" style="background:var(--bg-secondary); display:flex; flex-direction:column;">
            <h3 style="font-size:1.2rem; margin-bottom:var(--space-3); display:flex; align-items:center; gap:var(--space-2);">🎯 خطة العام ${year}</h3>
            <textarea class="form-control" style="flex:1; width:100%; min-height:400px; font-family:inherit; background:var(--bg-body); line-height:1.6;" placeholder="ما هي أهدافك الكبرى لهذا العام؟ ما هي الإنجازات التي تريد تحقيقها؟"
              onchange="CalendarModule.savePlanField('${planKey}', 'goals', this.value)"
            >${yearPlan.goals || ''}</textarea>
          </div>
        </div>
      </div>
    `;
  },

  // ─── STATISTICS & HEATMAP ───────────────────────────────────────────────────
  renderStats() {
    const cDays = DB.getCalendarDays();
    const today = new Date();
    
    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Sort all completed dates
    const completedDates = Object.keys(cDays)
      .filter(d => cDays[d].completed)
      .sort((a,b) => new Date(a) - new Date(b));

    if (completedDates.length > 0) {
      let lastDate = new Date(completedDates[0]);
      tempStreak = 1; longestStreak = 1;
      
      for (let i = 1; i < completedDates.length; i++) {
        const currDate = new Date(completedDates[i]);
        const diffDays = (currDate - lastDate) / (1000*60*60*24);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        lastDate = currDate;
      }
      
      // Current streak check
      const lastCompleted = new Date(completedDates[completedDates.length-1]);
      const diffFromToday = Math.floor((today - lastCompleted) / (1000*60*60*24));
      if (diffFromToday <= 1) currentStreak = tempStreak;
    }

    const totalCompleted = completedDates.length;
    
    // This month and week counts
    const currentMonthStr = today.toISOString().substring(0,7);
    const completedThisMonth = completedDates.filter(d => d.startsWith(currentMonthStr)).length;
    
    const { start, end } = getWeekRange(today);
    const completedThisWeek = completedDates.filter(d => {
      const dd = new Date(d);
      return dd >= start && dd <= end;
    }).length;

    return `
      <div class="calendar-container animate-fade-in" style="background:transparent; border:none; padding:0;">
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:var(--space-4); margin-bottom:var(--space-6);">
          <div class="stat-card" style="border-right:4px solid var(--color-success);">
            <div style="font-size:2rem; font-weight:900; color:var(--color-success);">${toArabicNumerals(totalCompleted)}</div>
            <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-top:4px;">إجمالي الأيام المكتملة</div>
          </div>
          <div class="stat-card" style="border-right:4px solid var(--accent-amber);">
            <div style="font-size:2rem; font-weight:900; color:var(--accent-amber);">${toArabicNumerals(longestStreak)}</div>
            <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-top:4px;">أطول سلسلة التزام (أيام)</div>
          </div>
          <div class="stat-card" style="border-right:4px solid var(--accent-blue);">
            <div style="font-size:2rem; font-weight:900; color:var(--accent-blue);">${toArabicNumerals(completedThisMonth)}</div>
            <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-top:4px;">أيام مكتملة هذا الشهر</div>
          </div>
          <div class="stat-card" style="border-right:4px solid var(--accent-purple);">
            <div style="font-size:2rem; font-weight:900; color:var(--accent-purple);">${toArabicNumerals(completedThisWeek)} / 7</div>
            <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-top:4px;">أيام مكتملة هذا الأسبوع</div>
          </div>
        </div>

        <div class="card" style="margin-bottom:var(--space-6);">
          <h3 class="card-title" style="margin-bottom:var(--space-4);">🔥 خريطة الاستمرارية (Heatmap)</h3>
          <div id="heatmap-container" style="display:flex; gap:4px; flex-wrap:wrap;">
            <!-- Rendered via JS -->
          </div>
        </div>
      </div>
    `;
  },

  initStatsCharts() {
    const container = document.getElementById('heatmap-container');
    if (!container) return;
    
    const cDays = DB.getCalendarDays();
    const today = new Date();
    let html = '';
    
    // Last 100 days
    for (let i = 99; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const status = this.getDayStatus(dStr);
      let color = 'var(--bg-secondary)'; // no data
      if (status === 'completed') color = 'var(--color-success)';
      else if (status === 'partial') color = 'var(--accent-amber)';
      else if (status === 'missed') color = 'var(--color-danger)';
      
      html += `<div title="${dStr} - ${status}" style="width:14px; height:14px; border-radius:3px; background:${color};"></div>`;
    }
    container.innerHTML = html;
  },

  // ─── ACTION LOGIC ───────────────────────────────────────────────────────────
  toggleDayComplete(dateStr) {
    const cDays = DB.getCalendarDays();
    if (!cDays[dateStr]) cDays[dateStr] = {};
    cDays[dateStr].completed = !cDays[dateStr].completed;
    DB.saveCalendarDays(cDays);
    this.refreshView();
    if (cDays[dateStr].completed) Toast.show('بطل! يوم رائع ومكتمل ✔️', 'success');
  },

  saveDayField(dateStr, field, val) {
    const cDays = DB.getCalendarDays();
    if (!cDays[dateStr]) cDays[dateStr] = {};
    cDays[dateStr][field] = val;
    DB.saveCalendarDays(cDays);
  },

  savePlanField(planKey, field, val) {
    const plans = DB.getCalendarPlans();
    if (!plans[planKey]) plans[planKey] = {};
    plans[planKey][field] = val;
    DB.saveCalendarPlans(plans);
  },

  toggleAutoCarry() {
    this.state.autoCarryTasks = !this.state.autoCarryTasks;
    this.refreshView();
    if (this.state.autoCarryTasks) Toast.show('تم تفعيل ترحيل المهام تلقائياً', 'info');
  },

  setFilter(mode) {
    this.state.filterMode = mode;
    this.refreshView();
  },

  carryOverTasks(todayStr) {
    let tasks = DB.getTasks();
    let changed = false;
    tasks.forEach(t => {
      if (!t.completed && t.date < todayStr && t.date !== 'recurring') {
        t.date = todayStr;
        changed = true;
      }
    });
    if (changed) {
      DB.saveTasks(tasks);
    }
  },

  calculateDayProgress(dateStr) {
    const tasks = DB.getTasks().filter(t => t.date === dateStr);
    const habits = DB.getHabits().filter(h => h.frequency === 'daily');
    const logs = DB.getHabitLogs()[dateStr] || {};
    
    const tasksDone = tasks.filter(t => t.completed).length;
    const habitsDone = habits.filter(h => logs[h.id]).length;
    
    const totalItems = tasks.length + habits.length;
    const totalDone = tasksDone + habitsDone;
    
    if (totalItems === 0) return 0;
    return Math.round((totalDone / totalItems) * 100);
  },

  // ─── NAVIGATORS & REUSE ─────────────────────────────────────────────────────
  goToToday() {
    this.state.currentDate = new Date();
    this.state.selectedDate = new Date();
    this.refreshView();
  },
  prevMonth() { this.state.currentDate = new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth()-1, 1); this.refreshView(); },
  nextMonth() { this.state.currentDate = new Date(this.state.currentDate.getFullYear(), this.state.currentDate.getMonth()+1, 1); this.refreshView(); },
  prevWeek()  { this.state.currentDate = addDays(this.state.currentDate, -7); this.refreshView(); },
  nextWeek()  { this.state.currentDate = addDays(this.state.currentDate, 7); this.refreshView(); },
  prevDay()   { this.state.selectedDate = addDays(this.state.selectedDate, -1); this.state.currentDate = new Date(this.state.selectedDate); this.refreshView(); },
  nextDay()   { this.state.selectedDate = addDays(this.state.selectedDate, 1); this.state.currentDate = new Date(this.state.selectedDate); this.refreshView(); },
  prevYear()  { this.state.currentDate = new Date(this.state.currentDate.getFullYear()-1, 0, 1); this.refreshView(); },
  nextYear()  { this.state.currentDate = new Date(this.state.currentDate.getFullYear()+1, 0, 1); this.refreshView(); },
  goToMonth(m){ this.state.currentDate = new Date(this.state.currentDate.getFullYear(), m, 1); this.state.view = 'monthly'; this.refreshView(); },

  selectDay(dateStr) {
    this.state.selectedDate = new Date(dateStr);
    this.state.currentDate = new Date(dateStr);
    this.setView('daily');
  },

  toggleDayTask(taskId) {
    const tasks = DB.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      DB.saveTasks(tasks);
      this.refreshView();
    }
  },

  toggleDayHabit(habitId, dateStr) {
    const logs = DB.getHabitLogs();
    if (!logs[dateStr]) logs[dateStr] = {};
    logs[dateStr][habitId] = !logs[dateStr][habitId];
    DB.saveHabitLogs(logs);
    this.refreshView();
  },

  openAddEvent(dateStr = null) {
    const defaultDate = dateStr || todayKey();
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">حدث جديد 🗓</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">العنوان</label>
          <input type="text" id="event-title" class="form-control" placeholder="عنوان الحدث" autofocus>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">التاريخ</label>
            <input type="date" id="event-date" class="form-control" value="${defaultDate}">
          </div>
          <div class="form-group">
            <label class="form-label">الوقت</label>
            <input type="time" id="event-time" class="form-control">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">الرمز (Emoji)</label>
            <input type="text" id="event-emoji" class="form-control" placeholder="🗓" maxlength="2">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">الوصف التفصيلي</label>
          <textarea id="event-desc" class="form-control" placeholder="تفاصيل الحدث، روابط، أو ملاحظات..." rows="3"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="CalendarModule.saveEvent()">حفظ الحدث</button>
      </div>
    `;
    openModal(content);
  },

  saveEvent() {
    const title = document.getElementById('event-title')?.value?.trim();
    if (!title) { Toast.show('الرجاء إدخال عنوان الحدث', 'error'); return; }
    const events = DB.getEvents();
    events.push({
      id: generateId(),
      title,
      date: document.getElementById('event-date')?.value || todayKey(),
      time: document.getElementById('event-time')?.value || '',
      emoji: document.getElementById('event-emoji')?.value || '🗓',
      description: document.getElementById('event-desc')?.value || '',
      createdAt: new Date().toISOString(),
    });
    DB.saveEvents(events);
    closeTopModal();
    Toast.show('تمت إضافة الحدث بنجاح! 🗓', 'success');
    this.refreshView();
  },
};
