/**
 * LIFE OS — Health Tracker Module
 * Height, Weight, BMI, Workout logs, Calories, Sleep, Water cups, Mood history
 */

const HealthModule = {
  state: {
    activeTab: 'summary',
  },

  render(container) {
    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">💪 الصحة واللياقة</h1>
            <p class="page-subtitle">تتبع مؤشرات جسمك الحيوية، تمارينك، شرب الماء، وجودة النوم</p>
          </div>
          <div class="header-actions" id="health-actions">
            ${this.renderActions()}
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs" style="margin-bottom:var(--space-6); max-width:500px;">
          <div class="tab-item ${this.state.activeTab === 'summary' ? 'active' : ''}" onclick="HealthModule.setTab('summary')">ملخص اليوم</div>
          <div class="tab-item ${this.state.activeTab === 'workouts' ? 'active' : ''}" onclick="HealthModule.setTab('workouts')">التمارين الرياضية</div>
          <div class="tab-item ${this.state.activeTab === 'sleep' ? 'active' : ''}" onclick="HealthModule.setTab('sleep')">سجل النوم والوزن</div>
        </div>

        <div id="health-content-area">
          ${this.renderTabContent()}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  setTab(tab) {
    this.state.activeTab = tab;
    document.querySelectorAll('.tab-item').forEach((el, i) => {
      const tabs = ['summary','workouts','sleep'];
      el.classList.toggle('active', tabs[i] === tab);
    });

    const actions = document.getElementById('health-actions');
    if (actions) actions.innerHTML = this.renderActions();

    const content = document.getElementById('health-content-area');
    if (content) {
      content.innerHTML = this.renderTabContent();
      if (window.lucide) lucide.createIcons();
    }
  },

  renderActions() {
    switch (this.state.activeTab) {
      case 'workouts':
        return `<button class="btn btn-primary" onclick="HealthModule.openAddWorkout()">+ تسجيل تمرين</button>`;
      case 'sleep':
        return `<button class="btn btn-primary" onclick="HealthModule.openAddSleepWeight()">+ تحديث البيانات</button>`;
      default:
        return '';
    }
  },

  renderTabContent() {
    switch (this.state.activeTab) {
      case 'summary':  return this.renderSummary();
      case 'workouts': return this.renderWorkouts();
      case 'sleep':    return this.renderSleepWeight();
      default:         return this.renderSummary();
    }
  },

  // ── Summary Tab ──
  renderSummary() {
    const logs = DB.getHealthLogs();
    const todayLog = logs.find(l => l.date === todayKey()) || {
      weight: 70,
      height: 175,
      sleepHours: 8,
      waterCups: 0,
      calories: 2000,
    };

    const workouts = DB.getWorkouts().filter(w => w.date === todayKey());
    const burnedCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

    const bmi = calculateBMI(todayLog.weight || 70, todayLog.height || 175);

    return `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-6);">
        <!-- Column 1: BMI & Core Stats -->
        <div style="display:flex; flex-direction:column; gap:var(--space-4);">
          <!-- BMI Card -->
          <div class="health-metric-card card">
            <h3 class="card-title" style="justify-content:center;">🩺 مؤشر كتلة الجسم (BMI)</h3>
            <div class="bmi-display" style="color:${bmi.color}; margin-top:var(--space-2);">${toArabicNumerals(bmi.value)}</div>
            <div class="bmi-category" style="background:${bmi.color}20; color:${bmi.color};">${bmi.category}</div>
            <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-top:var(--space-2);">
              الوزن الحالي: ${toArabicNumerals(todayLog.weight || 70)} كجم | الطول: ${toArabicNumerals(todayLog.height || 175)} سم
            </p>
          </div>

          <!-- Calories Card -->
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h3 class="card-title">🔥 السعرات الحرارية اليوم</h3>
              <span style="font-size:var(--font-size-xs); color:var(--text-muted);">المحروقة بالتمارين</span>
            </div>
            <div style="display:flex; justify-content:space-around; align-items:center; margin-top:var(--space-3);">
              <div style="text-align:center;">
                <div style="font-size:var(--font-size-2xl); font-weight:800; color:var(--accent-amber);">${toArabicNumerals(todayLog.calories || 2000)}</div>
                <div style="font-size:10px; color:var(--text-muted);">السعرات المستهلكة</div>
              </div>
              <div style="font-size:24px; color:var(--text-muted);">➜</div>
              <div style="text-align:center;">
                <div style="font-size:var(--font-size-2xl); font-weight:800; color:var(--accent-rose);">${toArabicNumerals(burnedCalories)}</div>
                <div style="font-size:10px; color:var(--text-muted);">السعرات المحروقة</div>
              </div>
            </div>
            <div style="margin-top:var(--space-4); text-align:center;">
              <button class="btn btn-secondary btn-sm" onclick="HealthModule.openUpdateCalories()">تعديل السعرات المستهلكة</button>
            </div>
          </div>
        </div>

        <!-- Column 2: Water & Sleep -->
        <div style="display:flex; flex-direction:column; gap:var(--space-4);">
          <!-- Water Tracker -->
          <div class="card">
            <h3 class="card-title" style="margin-bottom:var(--space-2);">💧 شرب الماء اليوم</h3>
            <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-bottom:var(--space-4);">
              الهدف اليومي: ٨ أكواب (٢.٥ لتر) | تم شرب: <strong>${toArabicNumerals(todayLog.waterCups || 0)}/٨</strong>
            </p>
            <div class="water-tracker">
              ${Array.from({length: 8}, (_, i) => {
                const filled = i < (todayLog.waterCups || 0);
                return `
                  <div class="water-cup ${filled ? 'filled' : ''}" onclick="HealthModule.toggleWaterCup(${i})">
                    💧
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Sleep Card -->
          <div class="card">
            <h3 class="card-title">😴 جودة النوم</h3>
            <div style="display:flex; align-items:center; gap:var(--space-4); margin-top:var(--space-3);">
              <div style="font-size:40px;">🛌</div>
              <div>
                <div style="font-size:var(--font-size-xl); font-weight:800; color:var(--accent-purple-light);">
                  ${toArabicNumerals(todayLog.sleepHours || 0)} ساعات
                </div>
                <p style="font-size:var(--font-size-xs); color:var(--text-muted);">نوم هانئ ومريح ليلة أمس</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  toggleWaterCup(index) {
    const logs = DB.getHealthLogs();
    let today = logs.find(l => l.date === todayKey());
    if (!today) {
      today = { date: todayKey(), weight: 70, height: 175, sleepHours: 8, waterCups: 0, calories: 2000 };
      logs.push(today);
    }

    // Toggle cup count
    today.waterCups = index + 1 === today.waterCups ? index : index + 1;
    DB.saveHealthLogs(logs);
    Toast.show(`تم تسجيل شرب الماء! 💧 (${toArabicNumerals(today.waterCups)} أكواب)`, 'success');
    this.setTab('summary');
  },

  openUpdateCalories() {
    const logs = DB.getHealthLogs();
    const today = logs.find(l => l.date === todayKey()) || { calories: 2000 };

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تحديث السعرات الحرارية المستهلكة 🍎</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">السعرات الحرارية المستهلكة اليوم (كربوهيدرات/طعام)</label>
          <input type="number" id="calorie-input" class="form-control" value="${today.calories || 2000}" min="0">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="HealthModule.saveCalories()">تحديث</button>
      </div>
    `;
    openModal(content);
  },

  saveCalories() {
    const val = parseInt(document.getElementById('calorie-input')?.value);
    if (isNaN(val) || val < 0) { Toast.show('يرجى إدخال قيمة صحيحة', 'error'); return; }

    const logs = DB.getHealthLogs();
    let today = logs.find(l => l.date === todayKey());
    if (!today) {
      today = { date: todayKey(), weight: 70, height: 175, sleepHours: 8, waterCups: 0, calories: 2000 };
      logs.push(today);
    }
    today.calories = val;
    DB.saveHealthLogs(logs);
    closeTopModal();
    Toast.show('تم تحديث السعرات بنجاح! 🍎', 'success');
    this.setTab('summary');
  },

  // ── Workouts Tab ──
  renderWorkouts() {
    const workouts = DB.getWorkouts().sort((a,b) => new Date(b.date) - new Date(a.date));
    if (workouts.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="dumbbell" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد تمارين مسجلة</h3>
          <p>سجّل تمارينك الرياضية لحرق السعرات وتابع تقدمك ولياقتك البدنية.</p>
          <button class="btn btn-primary" onclick="HealthModule.openAddWorkout()">سجّل أول تمرين</button>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-3);">
        ${workouts.map(w => `
          <div class="animate-fade-in" style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-4); background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg);">
            <div style="display:flex; align-items:center; gap:var(--space-3);">
              <span style="font-size:24px;">🏋️</span>
              <div>
                <h4 style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${w.type}</h4>
                <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-top:2px;">📅 ${formatDateAr(w.date, 'datetime')} | المدة: ${toArabicNumerals(w.duration)} دقيقة</p>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:var(--space-3);">
              <span style="font-size:var(--font-size-sm); font-weight:700; color:var(--accent-rose);">🔥 ${toArabicNumerals(w.calories)} سعرة</span>
              <button class="btn btn-danger btn-icon btn-sm" onclick="HealthModule.deleteWorkout('${w.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  openAddWorkout() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تسجيل تمرين رياضي جديد 🏋️</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">نوع التمرين</label>
          <input type="text" id="workout-type" class="form-control" placeholder="مثال: جري، حديد، ملاكمة...">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">المدة (بالدقائق)</label>
            <input type="number" id="workout-duration" class="form-control" min="1" value="30">
          </div>
          <div class="form-group">
            <label class="form-label required">السعرات المحروقة</label>
            <input type="number" id="workout-calories" class="form-control" min="1" value="250">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">التاريخ والوقت</label>
          <input type="datetime-local" id="workout-date" class="form-control" value="${new Date().toISOString().slice(0,16)}">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="HealthModule.saveWorkout()">تسجيل التمرين</button>
      </div>
    `;
    openModal(content);
  },

  saveWorkout() {
    const type = document.getElementById('workout-type')?.value?.trim();
    const duration = parseInt(document.getElementById('workout-duration')?.value);
    const calories = parseInt(document.getElementById('workout-calories')?.value);
    if (!type) { Toast.show('يرجى إدخال نوع التمرين', 'error'); return; }
    if (!duration || duration <= 0 || !calories || calories <= 0) { Toast.show('يرجى إدخال قيم صحيحة', 'error'); return; }

    const workouts = DB.getWorkouts();
    workouts.push({
      id: generateId(),
      type,
      duration,
      calories,
      date: new Date(document.getElementById('workout-date')?.value || new Date()).toISOString()
    });
    DB.saveWorkouts(workouts);
    closeTopModal();
    Toast.show('تم تسجيل التمرين بنجاح! 💪', 'success');
    this.setTab('workouts');
  },

  deleteWorkout(id) {
    if (!confirm('هل تريد حذف هذا التمرين المسجل؟')) return;
    let workouts = DB.getWorkouts();
    workouts = workouts.filter(x => x.id !== id);
    DB.saveWorkouts(workouts);
    Toast.show('تم حذف التمرين', 'info');
    this.setTab('workouts');
  },

  // ── Sleep & Weight Tab ──
  renderSleepWeight() {
    const logs = DB.getHealthLogs().sort((a,b) => new Date(b.date) - new Date(a.date));

    if (logs.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="scale" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد سجلات وزن أو نوم</h3>
          <p>سجّل وزنك وجودة نومك بانتظام لتتبع صحة جسمك على المدى الطويل.</p>
          <button class="btn btn-primary" onclick="HealthModule.openAddSleepWeight()">أضف سجلاً جديداً</button>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-3);">
        ${logs.map(l => `
          <div class="animate-fade-in" style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-4); background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg);">
            <div style="display:flex; align-items:center; gap:var(--space-3);">
              <span style="font-size:24px;">⚖️</span>
              <div>
                <h4 style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">الوزن: ${toArabicNumerals(l.weight)} كجم | الطول: ${toArabicNumerals(l.height)} سم</h4>
                <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-top:2px;">📅 التاريخ: ${formatDateAr(l.date, 'short')} | ساعات النوم: ${toArabicNumerals(l.sleepHours)} ساعات</p>
              </div>
            </div>
            <div>
              <span class="badge badge-purple">BMI: ${toArabicNumerals(calculateBMI(l.weight, l.height).value)}</span>
              <button class="btn btn-danger btn-icon btn-sm" onclick="HealthModule.deleteLog('${l.date}')" style="margin-right:var(--space-2);"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  openAddSleepWeight() {
    const logs = DB.getHealthLogs();
    const lastLog = logs[logs.length - 1] || { weight: 70, height: 175, sleepHours: 8 };

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تحديث بيانات الجسم والنوم ⚖️</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">الوزن الحالي (كجم)</label>
            <input type="number" id="health-weight" class="form-control" value="${lastLog.weight}" step="0.1" min="10">
          </div>
          <div class="form-group">
            <label class="form-label required">الطول الحالي (سم)</label>
            <input type="number" id="health-height" class="form-control" value="${lastLog.height}" min="50">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">ساعات النوم (ليلة أمس)</label>
            <input type="number" id="health-sleep" class="form-control" value="${lastLog.sleepHours}" step="0.5" min="0" max="24">
          </div>
          <div class="form-group">
            <label class="form-label">التاريخ</label>
            <input type="date" id="health-date" class="form-control" value="${todayKey()}">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="HealthModule.saveSleepWeight()">حفظ البيانات</button>
      </div>
    `;
    openModal(content);
  },

  saveSleepWeight() {
    const weight = parseFloat(document.getElementById('health-weight')?.value);
    const height = parseFloat(document.getElementById('health-height')?.value);
    const sleepHours = parseFloat(document.getElementById('health-sleep')?.value);
    const date = document.getElementById('health-date')?.value || todayKey();

    if (isNaN(weight) || weight <= 0 || isNaN(height) || height <= 0 || isNaN(sleepHours) || sleepHours < 0) {
      Toast.show('يرجى ملء جميع الحقول بقيم صحيحة', 'error');
      return;
    }

    const logs = DB.getHealthLogs();
    const existingIdx = logs.findIndex(l => l.date === date);

    const logEntry = {
      date,
      weight,
      height,
      sleepHours,
      waterCups: existingIdx >= 0 ? logs[existingIdx].waterCups : 0,
      calories: existingIdx >= 0 ? logs[existingIdx].calories : 2000,
    };

    if (existingIdx >= 0) {
      logs[existingIdx] = logEntry;
    } else {
      logs.push(logEntry);
    }

    DB.saveHealthLogs(logs);
    closeTopModal();
    Toast.show('تم حفظ مؤشرات الجسم بنجاح! 🩺', 'success');
    this.setTab('sleep');
  },

  deleteLog(date) {
    if (!confirm('هل تريد حذف سجل القياسات لهذا اليوم؟')) return;
    let logs = DB.getHealthLogs();
    logs = logs.filter(l => l.date !== date);
    DB.saveHealthLogs(logs);
    Toast.show('تم حذف السجل اليومي', 'info');
    this.setTab('sleep');
  }
};
