/**
 * LIFE OS — Weekly Review Module
 * Automatically aggregates metrics (goals, tasks, habits, study hours, finances)
 * and provides a structured workspace for weekly reflections and planning.
 */

const WeeklyReviewModule = {
  state: {
    selectedWeekStart: '', // YYYY-MM-DD (Saturday start date)
  },

  getRecentWeeks() {
    const weeks = [];
    let current = new Date();
    // Get last 8 weeks
    for (let i = 0; i < 8; i++) {
      const range = getWeekRange(current);
      weeks.push(range);
      // Move to previous week by subtracting 2 days from the start date (Thursday)
      current = new Date(range.start);
      current.setDate(current.getDate() - 2);
    }
    return weeks;
  },

  render(container) {
    const recentWeeks = this.getRecentWeeks();
    
    // Set default selected week if not set
    if (!this.state.selectedWeekStart && recentWeeks.length > 0) {
      this.state.selectedWeekStart = formatDateAr(recentWeeks[0].start, 'iso');
    }

    const selectedStart = new Date(this.state.selectedWeekStart);
    const range = getWeekRange(selectedStart);
    const weekKey = this.state.selectedWeekStart;

    // Fetch stored weekly review data
    const reviews = DB.getWeeklyReviews();
    const savedReview = reviews[weekKey] || {};

    // ── Calculate Quantitative Stats ──
    const stats = this.calculateWeekStats(range);

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">📝 المراجعة الأسبوعية</h1>
            <p class="page-subtitle">قيّم أسبوعك المنصرم، راجع عاداتك وإنجازاتك، وخطط للأسبوع القادم</p>
          </div>
          <div class="header-actions">
            <select id="weekly-review-select" class="form-control" onchange="WeeklyReviewModule.changeWeek(this.value)" style="min-width:250px; font-weight:700;">
              ${recentWeeks.map(w => {
                const iso = formatDateAr(w.start, 'iso');
                const label = `أسبوع: ${formatDateAr(w.start, 'short')} ← ${formatDateAr(w.end, 'short')}`;
                return `<option value="${iso}" ${iso === weekKey ? 'selected' : ''}>${label}</option>`;
              }).join('')}
            </select>
          </div>
        </div>

        <!-- Stats Grid -->
        <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:var(--space-3); margin-bottom:var(--space-6);">
          <div class="stat-card animate-fade-in" style="border-top:3px solid var(--accent-purple); padding:var(--space-4); text-align:center;">
            <div style="font-size:24px; margin-bottom:4px;">🎯</div>
            <div class="stat-card-value" style="color:var(--accent-purple); font-size:1.8rem; font-weight:800;">${toArabicNumerals(stats.goalsCompleted)}</div>
            <div class="stat-card-label" style="font-size:var(--font-size-xs); color:var(--text-secondary); margin-top:2px;">أهداف مكتملة</div>
            <div class="stat-card-sub" style="font-size:10px; color:var(--text-muted); margin-top:2px;">يومية وأسبوعية</div>
          </div>
          
          <div class="stat-card animate-fade-in delay-1" style="border-top:3px solid var(--accent-blue); padding:var(--space-4); text-align:center;">
            <div style="font-size:24px; margin-bottom:4px;">✅</div>
            <div class="stat-card-value" style="color:var(--accent-blue); font-size:1.8rem; font-weight:800;">${toArabicNumerals(stats.tasksCompleted)}/${toArabicNumerals(stats.tasksTotal)}</div>
            <div class="stat-card-label" style="font-size:var(--font-size-xs); color:var(--text-secondary); margin-top:2px;">المهام المنجزة</div>
            <div class="stat-card-sub" style="font-size:10px; color:var(--text-muted); margin-top:2px;">${stats.tasksPercent}٪ نسبة الإنجاز</div>
          </div>

          <div class="stat-card animate-fade-in delay-2" style="border-top:3px solid var(--accent-emerald); padding:var(--space-4); text-align:center;">
            <div style="font-size:24px; margin-bottom:4px;">🔁</div>
            <div class="stat-card-value" style="color:var(--accent-emerald); font-size:1.8rem; font-weight:800;">${stats.habitRate}٪</div>
            <div class="stat-card-label" style="font-size:var(--font-size-xs); color:var(--text-secondary); margin-top:2px;">التزام العادات</div>
            <div class="stat-card-sub" style="font-size:10px; color:var(--text-muted); margin-top:2px;">${toArabicNumerals(stats.habitCompleted)} تسجيل مكتمل</div>
          </div>

          <div class="stat-card animate-fade-in delay-3" style="border-top:3px solid var(--accent-amber); padding:var(--space-4); text-align:center;">
            <div style="font-size:24px; margin-bottom:4px;">📚</div>
            <div class="stat-card-value" style="color:var(--accent-amber); font-size:1.8rem; font-weight:800;">${toArabicNumerals(stats.studyHours)}</div>
            <div class="stat-card-label" style="font-size:var(--font-size-xs); color:var(--text-secondary); margin-top:2px;">ساعات المذاكرة</div>
            <div class="stat-card-sub" style="font-size:10px; color:var(--text-muted); margin-top:2px;">${toArabicNumerals(stats.studySessionsCount)} جلسات تركيز</div>
          </div>

          <div class="stat-card animate-fade-in delay-4" style="border-top:3px solid var(--accent-rose); padding:var(--space-4); text-align:center;">
            <div style="font-size:24px; margin-bottom:4px;">💰</div>
            <div class="stat-card-value" style="color:var(--accent-rose); font-size:1.8rem; font-weight:800;">${formatNumber(stats.moneySpent)}</div>
            <div class="stat-card-label" style="font-size:var(--font-size-xs); color:var(--text-secondary); margin-top:2px;">المصروفات</div>
            <div class="stat-card-sub" style="font-size:10px; color:var(--text-muted); margin-top:2px;">ج.م هذا الأسبوع</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:3fr 2fr; gap:var(--space-5);">
          <!-- Right side: Reflection Questionnaire -->
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            <div class="card" style="padding:var(--space-5);">
              <div class="card-header" style="margin-bottom:var(--space-4); border-bottom:1px solid var(--border-subtle); padding-bottom:var(--space-3);">
                <h3 class="card-title">📝 استمارة التقييم والخطط الأسبوعية</h3>
              </div>

              <div style="display:flex; flex-direction:column; gap:var(--space-4);">
                <div class="form-group">
                  <label class="form-label required" style="font-weight:700;">🏆 أكبر إنجاز حققته هذا الأسبوع</label>
                  <textarea id="wr-achievement" class="form-control" rows="3" placeholder="ما هو الشيء الأكثر فخراً به في هذا الأسبوع؟">${savedReview.achievement || stats.suggestedWin || ''}</textarea>
                </div>

                <div class="form-group">
                  <label class="form-label required" style="font-weight:700;">⚠️ أكبر تحدٍ واجهته وكيف تعاملت معه</label>
                  <textarea id="wr-challenge" class="form-control" rows="3" placeholder="العقبات، المشاكل، أو الأمور التي عطلت إنتاجيتك...">${savedReview.challenge || ''}</textarea>
                </div>

                <div class="form-group">
                  <label class="form-label required" style="font-weight:700;">📈 نقاط للتحسين والتطوير</label>
                  <textarea id="wr-improvements" class="form-control" rows="3" placeholder="ما هي الأخطاء التي تود تجنبها وما الذي ستحسنه؟">${savedReview.improvements || stats.suggestedImprovement || ''}</textarea>
                </div>

                <div class="form-group">
                  <label class="form-label required" style="font-weight:700;">🌅 خطة الأسبوع القادم والأولويات</label>
                  <textarea id="wr-nextplan" class="form-control" rows="3" placeholder="أهم الأهداف والمهام التي تركز عليها في الأيام السبعة القادمة...">${savedReview.nextplan || ''}</textarea>
                </div>
              </div>

              <div style="margin-top:var(--space-5); display:flex; justify-content:flex-end;">
                <button class="btn btn-primary btn-lg" onclick="WeeklyReviewModule.saveReview()" style="display:flex; align-items:center; gap:8px;">
                  <i data-lucide="save" style="width:18px;height:18px;"></i>
                  حفظ التقرير الأسبوعي
                </button>
              </div>
            </div>
          </div>

          <!-- Left side: References & Charts -->
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            <!-- Charts Card -->
            <div class="card" style="padding:var(--space-4);">
              <h3 class="card-title" style="margin-bottom:var(--space-4); font-size:var(--font-size-sm); border-bottom:1px solid var(--border-subtle); padding-bottom:var(--space-2);">📊 تحليل النشاط والإنتاجية</h3>
              <div style="position:relative; width:100%; height:250px;">
                <canvas id="weekly-productivity-chart"></canvas>
              </div>
            </div>

            <!-- Daily Reflections Reference -->
            <div class="card" style="padding:var(--space-4);">
              <h3 class="card-title" style="margin-bottom:var(--space-3); font-size:var(--font-size-sm); display:flex; align-items:center; gap:6px;">
                📜 أرشيف التأمل اليومي للأسبوع
              </h3>
              <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-bottom:var(--space-3);">
                تأملاتك اليومية التي كتبتها طوال الأيام السبعة الماضية لمساعدتك في صياغة التقرير:
              </p>
              
              <div style="display:flex; flex-direction:column; gap:var(--space-3); max-height:350px; overflow-y:auto; padding-left:4px;">
                ${stats.reflectionsList.length === 0 
                  ? `<div class="empty-state" style="padding:var(--space-4);"><p style="font-size:var(--font-size-xs);">لم تكتب أي تأمل يومي هذا الأسبوع.</p></div>`
                  : stats.reflectionsList.map(r => `
                    <div style="padding:var(--space-3); background:var(--bg-secondary); border-radius:var(--radius-md); border-right:3px solid var(--accent-purple); font-size:var(--font-size-xs);">
                      <div style="font-weight:700; color:var(--accent-purple-light); margin-bottom:4px; display:flex; justify-content:space-between;">
                        <span>${formatDateAr(new Date(r.date), 'weekday')} (${formatDateAr(new Date(r.date), 'day-month')})</span>
                        <span>${r.moodEmoji}</span>
                      </div>
                      ${r.wins ? `<div style="margin-bottom:3px; color:var(--text-primary);"><strong>🏆 إنجاز:</strong> ${r.wins}</div>` : ''}
                      ${r.lessons ? `<div style="margin-bottom:3px; color:var(--text-secondary);"><strong>📖 درس:</strong> ${r.lessons}</div>` : ''}
                      ${r.improvements ? `<div style="color:var(--text-muted);"><strong>📈 تحسين:</strong> ${r.improvements}</div>` : ''}
                    </div>
                  `).join('')
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Render productivity chart after DOM updates
    setTimeout(() => this.initProductivityChart(stats.dailyStats), 100);
  },

  changeWeek(weekStartIso) {
    this.state.selectedWeekStart = weekStartIso;
    this.render(document.getElementById('module-content'));
  },

  calculateWeekStats(range) {
    // 1. Goals Completed
    const dailyGoals = DB.getDailyGoals();
    const completedDaily = dailyGoals.filter(g => {
      if (!g.completed) return false;
      const d = new Date(g.date);
      return d >= range.start && d <= range.end;
    }).length;

    const weeklyGoals = DB.getWeeklyGoals();
    const completedWeekly = weeklyGoals.filter(g => {
      if (g.status !== 'completed') return false;
      const d = new Date(g.updatedAt || g.createdAt);
      return d >= range.start && d <= range.end;
    }).length;

    const goalsCompleted = completedDaily + completedWeekly;

    // 2. Tasks Completed
    const tasks = DB.getTasks();
    const weekTasks = tasks.filter(t => {
      const d = new Date(t.date);
      return d >= range.start && d <= range.end;
    });
    const tasksTotal = weekTasks.length;
    const tasksCompleted = weekTasks.filter(t => t.completed).length;
    const tasksPercent = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

    // 3. Habits Adherence
    const habits = DB.getHabits();
    const logs = DB.getHabitLogs();
    let habitCompleted = 0;
    let habitTotalOpportunities = habits.length * 7;

    let temp = new Date(range.start);
    for (let i = 0; i < 7; i++) {
      const k = temp.toISOString().split('T')[0];
      if (logs[k]) {
        habits.forEach(h => {
          if (logs[k][h.id]) habitCompleted++;
        });
      }
      temp.setDate(temp.getDate() + 1);
    }
    const habitRate = habitTotalOpportunities > 0 ? Math.round((habitCompleted / habitTotalOpportunities) * 100) : 0;

    // 4. Study Hours
    const studySessions = DB.getStudySessions();
    const weekSessions = studySessions.filter(s => {
      const d = new Date(s.date);
      return d >= range.start && d <= range.end;
    });
    const studySessionsCount = weekSessions.length;
    const totalMinutes = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const studyHours = (totalMinutes / 60).toFixed(1);

    // 5. Money Spent (Expenses)
    const transactions = DB.getTransactions();
    const weekExpenses = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      return d >= range.start && d <= range.end;
    });
    const moneySpent = weekExpenses.reduce((sum, t) => sum + (t.amount || 0), 0);

    // 6. Gather Reflections and auto-suggest Win/Improvement
    const reflections = DB.getReflections();
    const reflectionsList = [];
    const wins = [];
    const improvements = [];
    
    let tempRef = new Date(range.start);
    for (let i = 0; i < 7; i++) {
      const k = tempRef.toISOString().split('T')[0];
      if (reflections[k]) {
        const r = reflections[k];
        reflectionsList.push({
          date: k,
          wins: r.wins || '',
          improvements: r.improvements || '',
          lessons: r.lessons || '',
          moodEmoji: r.mood ? ['','😞','😔','😐','🙂','😄'][parseInt(r.mood)] || '😐' : '😐'
        });
        if (r.wins) wins.push(r.wins);
        if (r.improvements) improvements.push(r.improvements);
      }
      tempRef.setDate(tempRef.getDate() + 1);
    }

    const suggestedWin = wins.map(w => `• ${w}`).join('\n');
    const suggestedImprovement = improvements.map(imp => `• ${imp}`).join('\n');

    // 7. Calculate day-by-day task/study stats for the chart
    const dailyStats = [];
    let tempChart = new Date(range.start);
    const daysAr = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    
    for (let i = 0; i < 7; i++) {
      const k = tempChart.toISOString().split('T')[0];
      
      // Tasks completed on this day
      const dayTasks = tasks.filter(t => t.date === k);
      const dayTasksCompleted = dayTasks.filter(t => t.completed).length;

      // Study minutes on this day
      const dayStudy = studySessions.filter(s => {
        const sDate = s.date.split('T')[0];
        return sDate === k;
      });
      const dayStudyHours = (dayStudy.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);

      dailyStats.push({
        label: daysAr[i],
        tasks: dayTasksCompleted,
        studyHours: parseFloat(dayStudyHours.toFixed(1))
      });

      tempChart.setDate(tempChart.getDate() + 1);
    }

    return {
      goalsCompleted,
      tasksCompleted,
      tasksTotal,
      tasksPercent,
      habitCompleted,
      habitRate,
      studyHours,
      studySessionsCount,
      moneySpent,
      reflectionsList,
      suggestedWin,
      suggestedImprovement,
      dailyStats
    };
  },

  initProductivityChart(dailyStats) {
    const ctx = document.getElementById('weekly-productivity-chart')?.getContext('2d');
    if (!ctx) return;

    const labels = dailyStats.map(d => d.label);
    const taskData = dailyStats.map(d => d.tasks);
    const studyData = dailyStats.map(d => d.studyHours);

    // Destroy existing chart if any
    if (this.chart) {
      this.chart.destroy();
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#a0aec0' : '#4a5568';

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'المهام المكتملة',
            data: taskData,
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'ساعات الدراسة',
            data: studyData,
            backgroundColor: 'rgba(245, 158, 11, 0.85)',
            borderColor: 'rgb(245, 158, 11)',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { family: 'inherit', size: 11 },
              color: textColor
            }
          },
          tooltip: {
            rtl: true,
            titleFont: { family: 'inherit' },
            bodyFont: { family: 'inherit' }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'inherit' }, color: textColor }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'right', // RTL right
            title: {
              display: true,
              text: 'عدد المهام',
              font: { family: 'inherit', size: 10 },
              color: textColor
            },
            grid: { color: gridColor },
            ticks: {
              stepSize: 1,
              font: { family: 'inherit' },
              color: textColor
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'left', // RTL left
            title: {
              display: true,
              text: 'ساعات المذاكرة',
              font: { family: 'inherit', size: 10 },
              color: textColor
            },
            grid: { drawOnChartArea: false },
            ticks: {
              font: { family: 'inherit' },
              color: textColor
            }
          }
        }
      }
    });
  },

  saveReview() {
    const reviews = DB.getWeeklyReviews();
    const weekKey = this.state.selectedWeekStart;

    const achievement = document.getElementById('wr-achievement')?.value?.trim();
    const challenge = document.getElementById('wr-challenge')?.value?.trim();
    const improvements = document.getElementById('wr-improvements')?.value?.trim();
    const nextplan = document.getElementById('wr-nextplan')?.value?.trim();

    if (!achievement || !challenge || !improvements || !nextplan) {
      Toast.show('يرجى ملء كافة حقول التقييم والخطط المطلوبة لتتمكن من الحفظ.', 'warning');
      return;
    }

    reviews[weekKey] = {
      achievement,
      challenge,
      improvements,
      nextplan,
      savedAt: new Date().toISOString()
    };

    DB.saveWeeklyReviews(reviews);
    Toast.show('تم حفظ التقرير والمراجعة الأسبوعية بنجاح! 💾', 'success');
  }
};
