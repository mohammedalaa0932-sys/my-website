/**
 * LIFE OS — Statistics & Analytics Module
 * Interactive charts using Chart.js for Goals, Habits, Study Hours, Workout, Sleep, Reading, Mood
 */

const StatisticsModule = {
  charts: {},

  render(container) {
    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">📊 الإحصائيات والتحليلات</h1>
            <p class="page-subtitle">نظرة عامة ورسوم بيانية لأدائك وعاداتك وإنتاجيتك</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-6);">
          <!-- Study Hours Chart -->
          <div class="card">
            <h3 class="card-title">📚 ساعات الدراسة الأسبوعية</h3>
            <div class="chart-container" style="margin-top:var(--space-4);">
              <canvas id="chart-study-hours"></canvas>
            </div>
          </div>

          <!-- Sleep Quality & Duration Chart -->
          <div class="card">
            <h3 class="card-title">😴 تتبع ساعات وزمن النوم</h3>
            <div class="chart-container" style="margin-top:var(--space-4);">
              <canvas id="chart-sleep"></canvas>
            </div>
          </div>

          <!-- Habits Completion Rate Chart -->
          <div class="card">
            <h3 class="card-title">⚡ معدلات إنجاز العادات اليومية</h3>
            <div class="chart-container" style="margin-top:var(--space-4);">
              <canvas id="chart-habits"></canvas>
            </div>
          </div>

          <!-- Mood History Chart -->
          <div class="card">
            <h3 class="card-title">😄 سجل الحالة المزاجية (آخر ٧ أيام)</h3>
            <div class="chart-container" style="margin-top:var(--space-4);">
              <canvas id="chart-mood"></canvas>
            </div>
          </div>

          <!-- Workout Calories Burned Chart -->
          <div class="card">
            <h3 class="card-title">🔥 حرق السعرات الحرارية بالتمارين</h3>
            <div class="chart-container" style="margin-top:var(--space-4);">
              <canvas id="chart-workouts"></canvas>
            </div>
          </div>

          <!-- Goals Status Progress Chart -->
          <div class="card">
            <h3 class="card-title">🎯 تقدم الأهداف وتصنيفاتها</h3>
            <div class="chart-container" style="margin-top:var(--space-4);">
              <canvas id="chart-goals"></canvas>
            </div>
          </div>

          <!-- Expenses Breakdown Chart -->
          <div class="card">
            <h3 class="card-title">💸 تحليل المصروفات والتوزيع</h3>
            <div class="chart-container" style="margin-top:var(--space-4);">
              <canvas id="chart-expenses"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize all Chart.js instances after elements are rendered
    setTimeout(() => {
      this.initCharts();
    }, 200);
  },

  initCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js is not loaded. Cannot display graphs.');
      return;
    }

    // Colors
    const primaryColor = '#7c3aed';
    const secondaryColor = '#3b82f6';
    const successColor = '#10b981';
    const warningColor = '#f59e0b';
    const dangerColor = '#f43f5e';
    const textColor = '#94a3b8';

    // ── 1. Study Hours Chart ──
    const studyCtx = document.getElementById('chart-study-hours')?.getContext('2d');
    if (studyCtx) {
      const studySessions = DB.getStudySessions();
      // Group last 7 days study hours
      const studyData = Array.from({length: 7}, (_, i) => {
        const d = addDays(new Date(), -6 + i);
        const dayStr = d.toISOString().split('T')[0];
        const daySessions = studySessions.filter(s => s.date.startsWith(dayStr));
        const totalMin = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        return { label: formatDateAr(d, 'weekday-short'), hours: (totalMin / 60).toFixed(1) };
      });

      new Chart(studyCtx, {
        type: 'bar',
        data: {
          labels: studyData.map(d => d.label),
          datasets: [{
            label: 'ساعات الدراسة',
            data: studyData.map(d => d.hours),
            backgroundColor: primaryColor,
            borderRadius: 6
          }]
        },
        options: this.getChartOptions(textColor)
      });
    }

    // ── 2. Sleep Hours Chart ──
    const sleepCtx = document.getElementById('chart-sleep')?.getContext('2d');
    if (sleepCtx) {
      const healthLogs = DB.getHealthLogs();
      const sleepData = Array.from({length: 7}, (_, i) => {
        const d = addDays(new Date(), -6 + i);
        const dayStr = d.toISOString().split('T')[0];
        const log = healthLogs.find(l => l.date === dayStr) || { sleepHours: 0 };
        return { label: formatDateAr(d, 'weekday-short'), hours: log.sleepHours };
      });

      new Chart(sleepCtx, {
        type: 'line',
        data: {
          labels: sleepData.map(d => d.label),
          datasets: [{
            label: 'ساعات النوم',
            data: sleepData.map(d => d.hours),
            borderColor: secondaryColor,
            backgroundColor: `${secondaryColor}20`,
            fill: true,
            tension: 0.3
          }]
        },
        options: this.getChartOptions(textColor)
      });
    }

    // ── 3. Habits Completion Rate Chart ──
    const habitsCtx = document.getElementById('chart-habits')?.getContext('2d');
    if (habitsCtx) {
      const habits = DB.getHabits().filter(h => h.frequency === 'daily');
      const logs = DB.getHabitLogs();
      
      const habitsData = Array.from({length: 7}, (_, i) => {
        const d = addDays(new Date(), -6 + i);
        const dayStr = d.toISOString().split('T')[0];
        const completed = habits.filter(h => logs[dayStr]?.[h.id]).length;
        const total = habits.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { label: formatDateAr(d, 'weekday-short'), rate };
      });

      new Chart(habitsCtx, {
        type: 'bar',
        data: {
          labels: habitsData.map(d => d.label),
          datasets: [{
            label: 'نسبة الإنجاز (٪)',
            data: habitsData.map(d => d.rate),
            backgroundColor: successColor,
            borderRadius: 6
          }]
        },
        options: this.getChartOptions(textColor)
      });
    }

    // ── 4. Mood History Chart ──
    const moodCtx = document.getElementById('chart-mood')?.getContext('2d');
    if (moodCtx) {
      const entries = DB.getJournalEntries();
      const moodData = Array.from({length: 7}, (_, i) => {
        const d = addDays(new Date(), -6 + i);
        const dayStr = d.toISOString().split('T')[0];
        // find journal entries for this day
        const dayEntries = entries.filter(e => e.createdAt.startsWith(dayStr));
        const avgMood = dayEntries.length > 0 ? dayEntries.reduce((sum, e) => sum + (e.mood || 3), 0) / dayEntries.length : 3;
        return { label: formatDateAr(d, 'weekday-short'), val: avgMood.toFixed(1) };
      });

      new Chart(moodCtx, {
        type: 'line',
        data: {
          labels: moodData.map(d => d.label),
          datasets: [{
            label: 'المزاج (١-٥)',
            data: moodData.map(d => d.val),
            borderColor: warningColor,
            backgroundColor: 'transparent',
            tension: 0.2,
            borderWidth: 3
          }]
        },
        options: {
          ...this.getChartOptions(textColor),
          scales: {
            y: {
              min: 1,
              max: 5,
              ticks: { stepSize: 1, color: textColor }
            },
            x: { ticks: { color: textColor } }
          }
        }
      });
    }

    // ── 5. Workouts Chart ──
    const workoutsCtx = document.getElementById('chart-workouts')?.getContext('2d');
    if (workoutsCtx) {
      const workouts = DB.getWorkouts();
      const workoutData = Array.from({length: 7}, (_, i) => {
        const d = addDays(new Date(), -6 + i);
        const dayStr = d.toISOString().split('T')[0];
        const dayWorkouts = workouts.filter(w => w.date.startsWith(dayStr));
        const cals = dayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
        return { label: formatDateAr(d, 'weekday-short'), calories: cals };
      });

      new Chart(workoutsCtx, {
        type: 'bar',
        data: {
          labels: workoutData.map(d => d.label),
          datasets: [{
            label: 'السعرات المحروقة',
            data: workoutData.map(d => d.calories),
            backgroundColor: dangerColor,
            borderRadius: 6
          }]
        },
        options: this.getChartOptions(textColor)
      });
    }

    // ── 6. Goals Progress Chart ──
    const goalsCtx = document.getElementById('chart-goals')?.getContext('2d');
    if (goalsCtx) {
      const goals = DB.getGoals();
      const active = goals.filter(g => g.status === 'active').length;
      const completed = goals.filter(g => g.status === 'completed').length;

      new Chart(goalsCtx, {
        type: 'doughnut',
        data: {
          labels: ['أهداف نشطة', 'أهداف مكتملة'],
          datasets: [{
            data: [active, completed],
            backgroundColor: [secondaryColor, successColor],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Cairo' } } }
          }
        }
      });
    }

    // ── 7. Expenses Breakdown Chart ──
    const expensesCtx = document.getElementById('chart-expenses')?.getContext('2d');
    if (expensesCtx) {
      const transactions = DB.getTransactions().filter(t => t.type === 'expense');
      
      const categoriesData = {};
      transactions.forEach(t => {
        const cat = t.category || 'other';
        categoriesData[cat] = (categoriesData[cat] || 0) + (t.amount || 0);
      });

      const catLabels = {
        'health': 'الصحة',
        'family': 'العائلة',
        'finance': 'التزامات',
        'education': 'تعليم',
        'projects': 'مشاريع',
        'other': 'أخرى'
      };

      const labels = Object.keys(categoriesData).map(k => catLabels[k] || k);
      const data = Object.values(categoriesData);

      new Chart(expensesCtx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              primaryColor,
              secondaryColor,
              successColor,
              warningColor,
              dangerColor,
              '#8b5cf6'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Cairo' } } }
          }
        }
      });
    }
  },

  getChartOptions(textColor) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Cairo' } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: textColor, font: { family: 'Cairo' } }
        }
      }
    };
  }
};
