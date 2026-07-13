/**
 * LIFE OS — Dashboard Module
 * Clearly separates: Goals (where to go) | Tasks (what to do) | Habits (daily repetition) | Priorities (today's focus)
 */

const DashboardModule = {
  render(container) {
    const settings    = DB.getSettings();
    const pYear       = getPersonalYearData();
    const quote       = getDailyQuote();
    const tasks       = DB.getTasks().filter(t => t.date === todayKey() && !t.completed);
    const completedTasks = DB.getTasks().filter(t => t.date === todayKey() && t.completed);
    const habits      = DB.getHabits().filter(h => h.frequency === 'daily');
    const habitLogs   = DB.getHabitLogs();
    const todayKey_   = todayKey();

    // Goal hierarchy data
    const yearlyGoals  = DB.getYearlyGoals().filter(g => g.status === 'active');
    const monthlyGoals = DB.getMonthlyGoals().filter(g => g.status === 'active');
    const weeklyGoals  = DB.getWeeklyGoals().filter(g => g.status === 'active');
    const dailyGoals   = DB.getDailyGoals().filter(g => g.date === todayKey_);

    const priorities  = DB.getPriorities()[todayKey_] || {};
    const challengeData = DB.getChallengeData();
    const now         = new Date();
    const time        = getLiveTime();

    // Greeting
    const hour = now.getHours();
    let greeting = 'مرحباً،';
    if (hour < 5)       greeting = 'سهرت؟ 🌙';
    else if (hour < 12) greeting = 'صباح الخير،';
    else if (hour < 17) greeting = 'مرحباً،';
    else if (hour < 21) greeting = 'مساء الخير،';
    else                greeting = 'مساء النور،';

    // Habit stats
    const completedHabits = habits.filter(h => habitLogs[todayKey_]?.[h.id]).length;
    const habitStreaks = habits.map(h => calculateStreak(habitLogs, h.id));
    const maxStreak = habitStreaks.length > 0 ? Math.max(...habitStreaks) : 0;

    // Daily goals stats
    const dailyDone = dailyGoals.filter(d => d.completed).length;
    const medals = ['🥇', '🥈', '🥉'];

    // Latest goals across all levels
    const latestGoals = [
      ...DB.getYearlyGoals().map(g => ({...g, _type:'yearly',  _typeAr:'سنوي',  _color:'var(--accent-purple)'})),
      ...DB.getMonthlyGoals().map(g => ({...g, _type:'monthly', _typeAr:'شهري',  _color:'var(--accent-blue)'})),
      ...DB.getWeeklyGoals().map(g => ({...g, _type:'weekly',  _typeAr:'أسبوعي', _color:'var(--accent-emerald)'})),
    ].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

    // Challenge Widget Data
    let challengeHtml = '';
    if (challengeData.startDate) {
      const cStartDate = new Date(challengeData.startDate);
      const cMsDiff = now.getTime() - cStartDate.getTime();
      let cDayNumber = Math.floor(cMsDiff / (1000 * 60 * 60 * 24)) + 1;
      if (cDayNumber > 90) cDayNumber = 90;
      const cDaysRemaining = 90 - cDayNumber;
      const cProgress = cDayNumber > 0 ? Math.round((cDayNumber / 90) * 100) : 0;
      const cTodayLog = challengeData.logs.find(l => l.date === todayKey_);
      const quote = ChallengeModule.getQuote().text;

      challengeHtml = `
        <div class="card animate-fade-in" style="margin-bottom:var(--space-5); border-left:4px solid var(--accent-emerald); background:linear-gradient(90deg, rgba(16,185,129,0.05), transparent);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:var(--space-3);">
              <div style="font-size:32px;">🛡️</div>
              <div>
                <h3 style="color:var(--accent-emerald); font-size:1.1rem; margin-bottom:4px;">تحدي الـ 90 يوم</h3>
                <div style="font-size:var(--font-size-sm); color:var(--text-muted); max-width:400px; font-style:italic;">"${quote}"</div>
              </div>
            </div>
            <div style="display:flex; gap:var(--space-5); text-align:center;">
              <div>
                <div style="font-size:12px; color:var(--text-muted);">اليوم</div>
                <div style="font-size:1.2rem; font-weight:800; color:var(--text-primary);">${cDayNumber} / 90</div>
              </div>
              <div>
                <div style="font-size:12px; color:var(--text-muted);">السلسلة</div>
                <div style="font-size:1.2rem; font-weight:800; color:var(--accent-amber);">🔥 ${challengeData.currentStreak}</div>
              </div>
              <div>
                ${cTodayLog ? 
                  `<div style="color:var(--accent-emerald); font-weight:700; margin-top:8px;">✅ سجلت اليوم</div>` : 
                  `<button class="btn btn-primary btn-sm" onclick="navigateTo('challenge'); setTimeout(() => ChallengeModule.openCheckIn(), 300)">تسجيل اليوم</button>`
                }
              </div>
            </div>
          </div>
          <div class="progress-bar" style="height:6px; margin-top:var(--space-3);">
            <div class="progress-fill" style="width:${cProgress}%; background:var(--accent-emerald);"></div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="page-content" style="padding-top:var(--space-4);">

        <!-- ═══ HERO BANNER ═══ -->
        <div class="dashboard-hero animate-fade-in" style="margin-bottom:var(--space-5);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:var(--space-4);">
            <div>
              <div class="hero-greeting">${greeting}</div>
              <div class="hero-title">${settings.name || 'صديقي'} 👋</div>
              <div class="hero-subtitle">${formatDateAr(now, 'full')}</div>
              ${priorities.mission ? `
                <div style="margin-top:var(--space-3);padding:var(--space-3) var(--space-4);background:rgba(124,58,237,0.1);border-radius:var(--radius-md);border:1px solid rgba(124,58,237,0.2);max-width:450px;">
                  <div style="font-size:var(--font-size-xs);color:var(--accent-purple-light);font-weight:700;margin-bottom:4px;">🎯 مهمة اليوم</div>
                  <div style="font-size:var(--font-size-sm);color:var(--text-primary);font-weight:600;">${priorities.mission}</div>
                </div>
              ` : `
                <div style="margin-top:var(--space-3);">
                  <button class="btn btn-ghost btn-sm" onclick="navigateTo('priorities')">+ تحديد مهمة اليوم</button>
                </div>
              `}
            </div>
            <div style="text-align:center;">
              <div class="hero-time" id="live-time">${time.display}</div>
              <div class="hero-date" style="font-size:var(--font-size-xs);color:var(--text-muted);">${time.period}</div>
              <div style="margin-top:var(--space-2);">
                <span class="badge badge-purple">العمر: ${toArabicNumerals(pYear.age)} سنة</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ YEAR PROGRESS ═══ -->
        <div class="card animate-fade-in" style="margin-bottom:var(--space-4);background:linear-gradient(135deg,rgba(124,58,237,0.06),rgba(59,130,246,0.04));border-color:rgba(124,58,237,0.15);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
            <div>
              <div style="font-weight:700;font-size:var(--font-size-sm);">⏳ تقدم سنتك الشخصية</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">من ${formatDateAr(pYear.lastBirthday,'day-month')} إلى ${formatDateAr(pYear.nextBirthday,'day-month')}</div>
            </div>
            <div style="display:flex;gap:var(--space-4);text-align:center;">
              <div>
                <div style="font-size:var(--font-size-lg);font-weight:800;color:var(--accent-rose);">${toArabicNumerals(pYear.daysUntil)}</div>
                <div style="font-size:10px;color:var(--text-muted);">يوم لعيد ميلادك</div>
              </div>
              <div>
                <div style="font-size:var(--font-size-lg);font-weight:800;color:var(--accent-purple);">${formatPercent(pYear.percentCompleted, 1)}</div>
                <div style="font-size:10px;color:var(--text-muted);">مكتملة من السنة</div>
              </div>
            </div>
          </div>
          <div class="progress-bar" style="height:10px;border-radius:99px;">
            <div class="progress-fill hero" style="width:${pYear.percentCompleted}%;border-radius:99px;"></div>
          </div>
        </div>

        <!-- ═══ FOUR QUICK STATS ═══ -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);margin-bottom:var(--space-6);">
          <div class="stat-card animate-fade-in delay-1" style="cursor:pointer;border-top:3px solid var(--accent-purple);" onclick="navigateTo('goals')">
            <div style="font-size:22px;">🏆</div>
            <div class="stat-card-value" style="color:var(--accent-purple);">${toArabicNumerals(yearlyGoals.length + monthlyGoals.length + weeklyGoals.length)}</div>
            <div class="stat-card-label">أهداف بعيدة المدى</div>
            <div class="stat-card-sub">${toArabicNumerals(yearlyGoals.length)} سنوي • ${toArabicNumerals(monthlyGoals.length)} شهري • ${toArabicNumerals(weeklyGoals.length)} أسبوعي</div>
          </div>
          <div class="stat-card animate-fade-in delay-2" style="cursor:pointer;border-top:3px solid var(--accent-blue);" onclick="navigateTo('priorities')">
            <div style="font-size:22px;">📋</div>
            <div class="stat-card-value" style="color:var(--accent-blue);">${toArabicNumerals(completedTasks.length)}/${toArabicNumerals(tasks.length + completedTasks.length)}</div>
            <div class="stat-card-label">مهام اليوم</div>
            <div class="stat-card-sub">${tasks.length > 0 ? `${tasks.length} متبقية اليوم` : completedTasks.length > 0 ? 'أنجزتها جميعاً 🎉' : 'لا مهام اليوم'}</div>
          </div>
          <div class="stat-card animate-fade-in delay-3" style="cursor:pointer;border-top:3px solid var(--accent-emerald);" onclick="navigateTo('habits')">
            <div style="font-size:22px;">🔁</div>
            <div class="stat-card-value" style="color:var(--accent-emerald);">${toArabicNumerals(completedHabits)}/${toArabicNumerals(habits.length)}</div>
            <div class="stat-card-label">عادات اليوم</div>
            <div class="stat-card-sub">أطول سلسلة: ${toArabicNumerals(maxStreak)} يوم 🔥</div>
          </div>
          <div class="stat-card animate-fade-in delay-4" style="cursor:pointer;border-top:3px solid var(--accent-amber);" onclick="navigateTo('priorities')">
            <div style="font-size:22px;">🎯</div>
            <div class="stat-card-value" style="color:var(--accent-amber);">${priorities.mission ? '✅' : '—'}</div>
            <div class="stat-card-label">مهمة اليوم</div>
            <div class="stat-card-sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${priorities.mission ? priorities.mission.substring(0, 28) + '...' : 'لم تحدد مهمتك بعد'}</div>
          </div>
        </div>

        ${challengeHtml}

        <!-- ═══ MAIN CONTENT GRID ═══ -->
        <div style="display:grid;grid-template-columns:7fr 5fr;gap:var(--space-5);">

          <!-- LEFT COLUMN -->
          <div style="display:flex;flex-direction:column;gap:var(--space-5);">

            <!-- ══ SECTION: تخطيط اليوم (Mission + Top 3 Focus) ══ -->
            <div class="card animate-fade-in delay-1" style="border-top:4px solid var(--accent-amber);">
              <div class="card-header">
                <div style="display:flex;align-items:center;gap:var(--space-2);">
                  <div style="width:32px;height:32px;background:rgba(245,158,11,0.12);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
                    <i data-lucide="layout-list" style="width:16px;height:16px;color:var(--accent-amber);"></i>
                  </div>
                  <div>
                    <div class="card-title" style="color:var(--accent-amber);">📋 تخطيط اليوم</div>
                    <div style="font-size:10px;color:var(--text-muted);">مهمة اليوم + أهم ٣ تركيزات + مهام + عادات</div>
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="navigateTo('priorities')">فتح تخطيط اليوم</button>
              </div>

              ${priorities.mission ? `
                <div style="background:linear-gradient(135deg,rgba(124,58,237,0.06),rgba(59,130,246,0.04));border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3);border-right:3px solid var(--accent-purple);">
                  <div style="font-size:10px;font-weight:700;color:var(--accent-purple);margin-bottom:4px;">🎯 مهمة اليوم</div>
                  <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${priorities.mission}</div>
                </div>
              ` : ''}

              ${priorities.priority1 || priorities.priority2 || priorities.priority3 ? `
                <div style="margin-bottom:var(--space-2);font-size:10px;font-weight:700;color:var(--text-muted);">🔥 أهم ٣ تركيزات</div>
                <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                  ${[1,2,3].filter(n => priorities[`priority${n}`]).map(n => `
                    <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-3);background:var(--bg-secondary);border-radius:var(--radius-md);">
                      <div style="width:24px;height:24px;border-radius:50%;background:${n===1?'linear-gradient(135deg,#f59e0b,#ef4444)':n===2?'linear-gradient(135deg,#8b5cf6,#6366f1)':'linear-gradient(135deg,#10b981,#059669)'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;flex-shrink:0;">
                        ${n}
                      </div>
                      <span style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">${priorities[`priority${n}`]}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="text-align:center;padding:var(--space-4);">
                  <div style="font-size:28px;margin-bottom:var(--space-2);">📋</div>
                  <p style="color:var(--text-muted);font-size:var(--font-size-sm);margin-bottom:var(--space-3);">لم تبدأ تخطيط يومك بعد</p>
                  <button class="btn btn-primary btn-sm" onclick="navigateTo('priorities')">ابدأ تخطيط اليوم الآن →</button>
                </div>
              `}
            </div>

            <!-- ══ SECTION: مهام اليوم ══ (removed daily goals — they live in Goals only) -->
            <div class="card animate-fade-in delay-2" style="border-top:4px solid var(--accent-blue);">
              <div class="card-header">
                <div style="display:flex;align-items:center;gap:var(--space-2);">
                  <div style="width:32px;height:32px;background:rgba(59,130,246,0.12);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
                    <i data-lucide="check-square" style="width:16px;height:16px;color:var(--accent-blue);"></i>
                  </div>
                  <div>
                    <div class="card-title" style="color:var(--accent-blue);">✅ مهام اليوم</div>
                    <div style="font-size:10px;color:var(--text-muted);">أفعال محددة تُنجز اليوم — تُشطب عند الإنجاز</div>
                  </div>
                </div>
                <div style="display:flex;gap:var(--space-1);">
                  <button class="btn btn-ghost btn-sm" onclick="navigateTo('tasks')">عرض الكل</button>
                  <button class="btn btn-primary btn-sm" onclick="openQuickTask()">+ مهمة</button>
                </div>
              </div>

              ${tasks.length === 0 && completedTasks.length === 0 ? `
                <div style="text-align:center;padding:var(--space-4);">
                  <p style="color:var(--text-muted);font-size:var(--font-size-sm);margin-bottom:var(--space-3);">لا توجد مهام لهذا اليوم</p>
                  <button class="btn btn-ghost btn-sm" onclick="openQuickTask()">أضف مهمة</button>
                </div>
              ` : `
                <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                  ${tasks.slice(0,6).map(task => `
                    <div class="task-item" style="cursor:pointer;" onclick="DashboardModule.toggleTask('${task.id}')">
                      <div class="habit-check"></div>
                      <div class="priority-dot ${task.priority || 'medium'}"></div>
                      <span class="task-text">${task.title}</span>
                      ${task.dueTime ? `<span style="font-size:10px;color:var(--text-muted);margin-right:auto;">⏱️ ${task.dueTime}</span>` : ''}
                    </div>
                  `).join('')}
                  ${completedTasks.length > 0 ? `
                    <div style="border-top:1px solid var(--border-subtle);padding-top:var(--space-2);margin-top:var(--space-1);">
                      <div style="font-size:10px;color:var(--text-muted);margin-bottom:var(--space-2);">✅ منجزة (${toArabicNumerals(completedTasks.length)})</div>
                      ${completedTasks.slice(0,3).map(task => `
                        <div class="task-item completed" style="cursor:pointer;" onclick="DashboardModule.toggleTask('${task.id}')">
                          <div class="habit-check checked"><i data-lucide="check" style="width:12px;height:12px;"></i></div>
                          <span class="task-text" style="text-decoration:line-through;color:var(--text-muted);">${task.title}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `}
            </div>

            <!-- ══ SECTION: عادات اليوم ══ -->
            <div class="card animate-fade-in delay-4" style="border-top:4px solid var(--accent-emerald);">
              <div class="card-header">
                <div style="display:flex;align-items:center;gap:var(--space-2);">
                  <div style="width:32px;height:32px;background:rgba(16,185,129,0.12);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
                    <i data-lucide="repeat" style="width:16px;height:16px;color:var(--accent-emerald);"></i>
                  </div>
                  <div>
                    <div class="card-title" style="color:var(--accent-emerald);">عادات اليوم</div>
                    <div style="font-size:10px;color:var(--text-muted);">سلوكيات يومية متكررة — ليست مهاماً</div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:var(--space-2);">
                  <span style="font-size:var(--font-size-xs);font-weight:700;color:var(--accent-emerald);">${toArabicNumerals(completedHabits)}/${toArabicNumerals(habits.length)}</span>
                  <button class="btn btn-ghost btn-sm" onclick="navigateTo('habits')">عرض الكل</button>
                </div>
              </div>

              ${habits.length === 0 ? `
                <div style="text-align:center;padding:var(--space-4);">
                  <p style="color:var(--text-muted);font-size:var(--font-size-sm);margin-bottom:var(--space-3);">لا توجد عادات بعد</p>
                  <button class="btn btn-primary btn-sm" onclick="navigateTo('habits')">ابدأ بإضافة عادة</button>
                </div>
              ` : `
                <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                  ${habits.slice(0,7).map(habit => {
                    const done   = habitLogs[todayKey_]?.[habit.id];
                    const streak = calculateStreak(habitLogs, habit.id);
                    return `
                      <div class="habit-row" style="cursor:pointer;" onclick="DashboardModule.toggleHabit('${habit.id}')">
                        <div class="habit-icon-wrapper">
                          <span style="font-size:20px;">${habit.emoji || '⭐'}</span>
                        </div>
                        <div class="habit-info">
                          <div class="habit-name">${habit.name}</div>
                          <div class="habit-meta">
                            <span class="habit-streak">🔥 ${toArabicNumerals(streak)} يوم متتالي</span>
                          </div>
                        </div>
                        <div class="habit-check ${done ? 'checked' : ''}" data-habit-id="${habit.id}">
                          ${done ? '<i data-lucide="check" style="width:14px;height:14px;"></i>' : ''}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- Habit completion bar -->
                <div style="margin-top:var(--space-3);">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:11px;color:var(--text-muted);">إنجاز اليوم</span>
                    <span style="font-size:11px;font-weight:700;color:var(--accent-emerald);">${habits.length > 0 ? toArabicNumerals(Math.round((completedHabits/habits.length)*100)) : '٠'}٪</span>
                  </div>
                  <div class="progress-bar" style="height:6px;border-radius:99px;">
                    <div class="progress-fill" style="width:${habits.length > 0 ? Math.round((completedHabits/habits.length)*100) : 0}%;background:linear-gradient(90deg,var(--accent-emerald),var(--accent-blue));border-radius:99px;"></div>
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div style="display:flex;flex-direction:column;gap:var(--space-5);">

            <!-- ══ SECTION: الأهداف الحالية (Current Goals) ══ -->
            <div class="card animate-fade-in" style="border-top:4px solid var(--accent-purple);">
              <div class="card-header">
                <div style="display:flex;align-items:center;gap:var(--space-2);">
                  <div style="width:32px;height:32px;background:rgba(124,58,237,0.12);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
                    <i data-lucide="target" style="width:16px;height:16px;color:var(--accent-purple);"></i>
                  </div>
                  <div>
                    <div class="card-title" style="color:var(--accent-purple);">الأهداف الحالية</div>
                    <div style="font-size:10px;color:var(--text-muted);">أين أريد الوصول؟ — ليست مهاماً</div>
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="navigateTo('goals')">عرض الكل</button>
              </div>

              ${yearlyGoals.length === 0 && monthlyGoals.length === 0 && weeklyGoals.length === 0 ? `
                <div style="text-align:center;padding:var(--space-4);">
                  <div style="font-size:28px;margin-bottom:var(--space-2);">🎯</div>
                  <p style="color:var(--text-muted);font-size:var(--font-size-sm);margin-bottom:var(--space-3);">لا توجد أهداف نشطة</p>
                  <button class="btn btn-primary btn-sm" onclick="navigateTo('goals')">ابدأ بإضافة هدف</button>
                </div>
              ` : `
                <div style="display:flex;flex-direction:column;gap:var(--space-3);">
                  ${yearlyGoals.slice(0,2).map(g => `
                    <div style="padding:var(--space-3);background:rgba(124,58,237,0.04);border-radius:var(--radius-md);border:1px solid rgba(124,58,237,0.12);cursor:pointer;" onclick="navigateTo('goals')">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:10px;font-weight:700;color:var(--accent-purple);">🏆 سنوي</span>
                        <span style="font-size:11px;font-weight:700;color:var(--accent-purple);">${toArabicNumerals(g.progress||0)}٪</span>
                      </div>
                      <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-2);">${g.title}</div>
                      <div class="progress-bar" style="height:4px;">
                        <div class="progress-fill" style="width:${g.progress||0}%;background:var(--accent-purple);"></div>
                      </div>
                    </div>
                  `).join('')}
                  ${monthlyGoals.slice(0,2).map(g => `
                    <div style="padding:var(--space-3);background:rgba(59,130,246,0.04);border-radius:var(--radius-md);border:1px solid rgba(59,130,246,0.12);cursor:pointer;" onclick="navigateTo('goals')">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:10px;font-weight:700;color:var(--accent-blue);">📅 شهري</span>
                        <span style="font-size:11px;font-weight:700;color:var(--accent-blue);">${toArabicNumerals(g.progress||0)}٪</span>
                      </div>
                      <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-2);">${g.title}</div>
                      <div class="progress-bar" style="height:4px;">
                        <div class="progress-fill" style="width:${g.progress||0}%;background:var(--accent-blue);"></div>
                      </div>
                    </div>
                  `).join('')}
                  ${weeklyGoals.slice(0,1).map(g => `
                    <div style="padding:var(--space-3);background:rgba(16,185,129,0.04);border-radius:var(--radius-md);border:1px solid rgba(16,185,129,0.12);cursor:pointer;" onclick="navigateTo('goals')">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:10px;font-weight:700;color:var(--accent-emerald);">📆 أسبوعي</span>
                        <span style="font-size:11px;font-weight:700;color:var(--accent-emerald);">${toArabicNumerals(g.progress||0)}٪</span>
                      </div>
                      <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-2);">${g.title}</div>
                      <div class="progress-bar" style="height:4px;">
                        <div class="progress-fill" style="width:${g.progress||0}%;background:var(--accent-emerald);"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- ══ SECTION: أحدث الأهداف (Latest Goals) ══ -->
            <div class="card animate-fade-in delay-1" style="border-top:4px solid var(--accent-cyan);">
              <div class="card-header">
                <div style="display:flex;align-items:center;gap:var(--space-2);">
                  <div style="width:32px;height:32px;background:rgba(6,182,212,0.12);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
                    <i data-lucide="bell" style="width:16px;height:16px;color:var(--accent-cyan);"></i>
                  </div>
                  <div>
                    <div class="card-title" style="color:var(--accent-cyan);">أحدث الأهداف</div>
                    <div style="font-size:10px;color:var(--text-muted);">آخر أهداف تمت إضافتها</div>
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="navigateTo('goals');setTimeout(()=>GoalsModule.setTab('latest'),200)">عرض الكل</button>
              </div>

              ${latestGoals.length === 0 ? `
                <p style="text-align:center;color:var(--text-muted);font-size:var(--font-size-sm);padding:var(--space-4);">لا توجد أهداف بعد</p>
              ` : `
                <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                  ${latestGoals.map(g => `
                    <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-md);cursor:pointer;" onclick="navigateTo('goals')">
                      <div style="width:36px;height:36px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;font-size:18px;background:${g._color}22;border:1px solid ${g._color}44;flex-shrink:0;">
                        ${g._type==='yearly'?'🏆':g._type==='monthly'?'📅':'📆'}
                      </div>
                      <div style="flex:1;overflow:hidden;">
                        <div style="font-size:var(--font-size-xs);font-weight:700;color:${g._color};">${g._typeAr}</div>
                        <div style="font-size:var(--font-size-xs);font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${g.title}</div>
                      </div>
                      <div style="text-align:center;min-width:40px;">
                        <div style="font-size:11px;font-weight:700;color:${g._color};">${toArabicNumerals(g.progress||0)}٪</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- ══ SECTION: Quote ══ -->
            <div class="quote-card animate-fade-in delay-2" style="position:relative; display:flex; flex-direction:column; gap:8px;">
              <button onclick="DashboardModule.toggleFavQuote(${quote.index})" style="position:absolute; top:12px; left:12px; border:none; background:none; cursor:pointer; font-size:18px; color:${quote.isFavorite ? 'var(--accent-rose)' : 'var(--text-muted)'}; padding:0; transition:transform 0.2s;" title="تفضيل القول">
                ${quote.isFavorite ? '❤️' : '🤍'}
              </button>
              <div class="quote-text" style="padding-left:24px;">"${quote.text}"</div>
              <div class="quote-author">— ${quote.author}</div>
              
              <!-- Encouragement Message -->
              <div style="margin-top:var(--space-2); padding-top:var(--space-2); border-top:1px dashed var(--border-subtle); font-size:11px; color:var(--accent-purple-light); font-weight:700;">
                📢 ${getProgressEncouragement(completedTasks.length, completedHabits, challengeData.currentStreak)}
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  toggleHabit(habitId) {
    const logs  = DB.getHabitLogs();
    const key   = todayKey();
    if (!logs[key]) logs[key] = {};
    logs[key][habitId] = !logs[key][habitId];
    DB.saveHabitLogs(logs);

    const checkEl = document.querySelector(`[data-habit-id="${habitId}"]`);
    if (checkEl) {
      checkEl.classList.toggle('checked', logs[key][habitId]);
      checkEl.innerHTML = logs[key][habitId]
        ? '<i data-lucide="check" style="width:14px;height:14px;"></i>'
        : '';
      if (window.lucide) lucide.createIcons();
    }
    Toast.show(logs[key][habitId] ? 'أحسنت! تم تسجيل العادة 🎉' : 'تم إلغاء التسجيل', logs[key][habitId] ? 'success' : 'info');
  },

  toggleTask(taskId) {
    const tasks = DB.getTasks();
    const task  = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed    = !task.completed;
      task.completedAt  = task.completed ? new Date().toISOString() : null;
      DB.saveTasks(tasks);
      renderModule('dashboard');
      Toast.show(task.completed ? 'أحسنت! تم إنجاز المهمة ✅' : 'تم إلغاء الإنجاز', task.completed ? 'success' : 'info');
    }
  },

  toggleDailyGoal(id) {
    const daily = DB.getDailyGoals();
    const d = daily.find(x => x.id === id);
    if (d) {
      d.completed = !d.completed;
      if (d.completed) d.completedAt = new Date().toISOString();
      DB.saveDailyGoals(daily);
      if (d.weeklyGoalId && typeof GoalsModule !== 'undefined') {
        GoalsModule.syncWeeklyDailyProgress(d.weeklyGoalId);
      }
      renderModule('dashboard');
      Toast.show(d.completed ? '🎉 رائع! أنجزت هدف اليوم!' : 'تم التحديث', 'success');
    }
  },

  toggleFavQuote(quoteIndex) {
    const isFav = toggleFavoriteQuote(quoteIndex);
    renderModule('dashboard');
  },
};
