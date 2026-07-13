/**
 * LIFE OS — Study Manager Module
 * Subjects, Courses, Certificates, Books, Study Sessions, Exams, Assignments
 */

const StudyModule = {
  state: {
    activeTab: 'subjects',
  },

  render(container) {
    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">📚 إدارة الدراسة</h1>
            <p class="page-subtitle">نظّم موادك، كتبك، جلسات المذاكرة، وتابع إنجازك الأكاديمي</p>
          </div>
          <div class="header-actions" id="study-actions">
            ${this.renderActions()}
          </div>
        </div>

        <!-- View Tabs -->
        <div class="tabs" style="margin-bottom:var(--space-6);">
          <div class="tab-item ${this.state.activeTab==='subjects'?'active':''}" onclick="StudyModule.setTab('subjects')">المواد والمساقات</div>
          <div class="tab-item ${this.state.activeTab==='sessions'?'active':''}" onclick="StudyModule.setTab('sessions')">جلسات الدراسة</div>
          <div class="tab-item ${this.state.activeTab==='books'?'active':''}" onclick="StudyModule.setTab('books')">الكتب والقراءة</div>
          <div class="tab-item ${this.state.activeTab==='exams'?'active':''}" onclick="StudyModule.setTab('exams')">الامتحانات والواجبات</div>
          <div class="tab-item ${this.state.activeTab==='academic'?'active':''}" onclick="StudyModule.setTab('academic')">📅 التقويم الجامعي</div>
        </div>

        <div id="study-content-area">
          ${this.renderTabContent()}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  setTab(tab) {
    this.state.activeTab = tab;
    document.querySelectorAll('.tab-item').forEach((el, i) => {
      const tabs = ['subjects','sessions','books','exams','academic'];
      el.classList.toggle('active', tabs[i] === tab);
    });
    
    const actions = document.getElementById('study-actions');
    if (actions) actions.innerHTML = this.renderActions();
    
    const content = document.getElementById('study-content-area');
    if (content) {
      content.innerHTML = this.renderTabContent();
      if (window.lucide) lucide.createIcons();
    }
  },

  renderActions() {
    switch (this.state.activeTab) {
      case 'subjects':
        return `<button class="btn btn-primary" onclick="StudyModule.openAddSubject()">+ مادة جديدة</button>`;
      case 'sessions':
        return `<button class="btn btn-primary" onclick="StudyModule.openTimerModal()">⏱️ جلسة جديدة</button>`;
      case 'books':
        return `<button class="btn btn-primary" onclick="StudyModule.openAddBook()">+ كتاب جديد</button>`;
      case 'exams':
        return `<button class="btn btn-primary" onclick="StudyModule.openAddExamOrAssignment()">+ إضافة امتحان/واجب</button>`;
      case 'academic':
        return '';
      default:
        return '';
    }
  },

  renderTabContent() {
    switch (this.state.activeTab) {
      case 'subjects': return this.renderSubjects();
      case 'sessions': return this.renderSessions();
      case 'books':    return this.renderBooks();
      case 'exams':    return this.renderExams();
      case 'academic': return this.renderAcademicCalendar();
      default:         return this.renderSubjects();
    }
  },

  // ── Subjects Tab ──
  renderSubjects() {
    const subjects = DB.getSubjects();
    if (subjects.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="book" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد مواد دراسية مضافة</h3>
          <p>أضف موادك الدراسية أو الكورسات لتبدأ تتبع تقدمك وتوثيق ساعات الدراسة.</p>
          <button class="btn btn-primary" onclick="StudyModule.openAddSubject()">أضف مادة الآن</button>
        </div>
      `;
    }

    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--space-4);">
        ${subjects.map(s => {
          const sessions = DB.getStudySessions().filter(sess => sess.subjectId === s.id);
          const totalHours = (sessions.reduce((sum, sess) => sum + (sess.duration || 0), 0) / 60).toFixed(1);
          return `
            <div class="study-subject-card card animate-fade-in" onclick="StudyModule.openSubjectDetail('${s.id}')">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div class="subject-icon" style="background:${s.color || '#7c3aed'}20; color:${s.color || '#7c3aed'}">
                  ${s.icon || '📚'}
                </div>
                <span class="badge ${s.status === 'completed' ? 'badge-green' : 'badge-blue'}">
                  ${s.status === 'completed' ? 'مكتملة' : 'مستمرة'}
                </span>
              </div>
              <div style="margin-top:var(--space-2);">
                <h3 style="font-size:var(--font-size-base); font-weight:700; color:var(--text-primary);">${s.name}</h3>
                <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-top:2px;">${s.code || 'بدون رمز'} | ${s.instructor || 'مدرس المادة'}</p>
              </div>
              <div style="margin-top:var(--space-3); display:flex; justify-content:space-between; font-size:var(--font-size-xs); color:var(--text-secondary);">
                <span>ساعات الدراسة: <strong>${toArabicNumerals(totalHours)} ساعة</strong></span>
                <span>التقدم: <strong>${toArabicNumerals(s.progress || 0)}٪</strong></span>
              </div>
              <div class="progress-bar thin" style="margin-top:var(--space-2);">
                <div class="progress-fill" style="width:${s.progress || 0}%; background:${s.color || 'var(--accent-purple)'};"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  openAddSubject() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة مادة دراسية جديدة 📚</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">اسم المادة / الكورس</label>
          <input type="text" id="subj-name" class="form-control" placeholder="مثال: شبكات الحاسوب، برمجة ويب...">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">رمز المادة</label>
            <input type="text" id="subj-code" class="form-control" placeholder="CCNA, IT202...">
          </div>
          <div class="form-group">
            <label class="form-label">المحاضر / المعلم</label>
            <input type="text" id="subj-instructor" class="form-control" placeholder="اسم الدكتور أو المنصة">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">أيقونة مميزة</label>
            <input type="text" id="subj-icon" class="form-control" value="📚" placeholder="أيقونة إيموجي">
          </div>
          <div class="form-group">
            <label class="form-label">لون المادة</label>
            <input type="color" id="subj-color" class="form-control" value="#7c3aed" style="padding:4px; height:38px;">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">التقدم الأولي (٪)</label>
          <input type="number" id="subj-progress" class="form-control" min="0" max="100" value="0">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="StudyModule.saveSubject()">حفظ المادة</button>
      </div>
    `;
    openModal(content);
  },

  saveSubject() {
    const name = document.getElementById('subj-name')?.value?.trim();
    if (!name) { Toast.show('يرجى إدخال اسم المادة', 'error'); return; }

    const subjects = DB.getSubjects();
    subjects.push({
      id: generateId(),
      name,
      code: document.getElementById('subj-code')?.value?.trim() || '',
      instructor: document.getElementById('subj-instructor')?.value?.trim() || '',
      icon: document.getElementById('subj-icon')?.value || '📚',
      color: document.getElementById('subj-color')?.value || '#7c3aed',
      progress: parseInt(document.getElementById('subj-progress')?.value) || 0,
      status: 'active',
      createdAt: new Date().toISOString()
    });
    DB.saveSubjects(subjects);
    closeTopModal();
    Toast.show('تمت إضافة المادة بنجاح! 📚', 'success');
    this.setTab('subjects');
  },

  openSubjectDetail(id) {
    const subjects = DB.getSubjects();
    const s = subjects.find(x => x.id === id);
    if (!s) return;

    const sessions = DB.getStudySessions().filter(sess => sess.subjectId === id);
    const totalHours = (sessions.reduce((sum, sess) => sum + (sess.duration || 0), 0) / 60).toFixed(1);

    const content = `
      <div class="modal-header">
        <div>
          <span style="font-size:32px;">${s.icon || '📚'}</span>
          <h3 class="modal-title" style="margin-top:4px;">${s.name}</h3>
        </div>
        <div style="display:flex; gap:var(--space-2);">
          <button class="btn btn-secondary btn-sm" onclick="StudyModule.openEditSubject('${s.id}')">تعديل</button>
          <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
      </div>
      <div class="modal-body">
        <div style="display:flex; justify-content:space-between; font-size:var(--font-size-sm); color:var(--text-secondary);">
          <span>الرمز: <strong>${s.code || 'لا يوجد'}</strong></span>
          <span>المعلم: <strong>${s.instructor || 'لا يوجد'}</strong></span>
          <span>إجمالي ساعات الدراسة: <strong>${toArabicNumerals(totalHours)} ساعة</strong></span>
        </div>
        <div style="margin-top:var(--space-4);">
          <label class="form-label">نسبة التقدم: ${toArabicNumerals(s.progress || 0)}٪</label>
          <input type="range" min="0" max="100" value="${s.progress || 0}" style="width:100%;" 
                 oninput="StudyModule.updateSubjectProgress('${s.id}', this.value)">
        </div>

        <div style="margin-top:var(--space-4);">
          <h4 style="font-size:var(--font-size-sm); font-weight:700; margin-bottom:var(--space-2);">سجل الجلسات الأخيرة</h4>
          ${sessions.length === 0 ? `<p style="font-size:var(--font-size-xs); color:var(--text-muted);">لم تسجل أي جلسة مذاكرة لهذه المادة بعد.</p>` : `
            <div style="display:flex; flex-direction:column; gap:var(--space-2); max-height:150px; overflow-y:auto;">
              ${sessions.map(sess => `
                <div style="display:flex; justify-content:between; font-size:var(--font-size-xs); padding:var(--space-2); background:var(--bg-secondary); border-radius:var(--radius-sm);">
                  <span>📅 ${formatDateAr(sess.date, 'short')}</span>
                  <span>⏱️ ${toArabicNumerals(sess.duration)} دقيقة</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-danger" onclick="StudyModule.deleteSubject('${s.id}')">حذف المادة</button>
        <button class="btn btn-secondary" onclick="closeTopModal()">إغلاق</button>
        ${s.status !== 'completed' ? `<button class="btn btn-success" onclick="StudyModule.completeSubject('${s.id}')">تعليم كمكتملة</button>` : ''}
      </div>
    `;
    openModal(content);
  },

  updateSubjectProgress(id, val) {
    const subjects = DB.getSubjects();
    const s = subjects.find(x => x.id === id);
    if (s) {
      s.progress = parseInt(val);
      if (s.progress === 100) s.status = 'completed';
      DB.saveSubjects(subjects);
      // Update ui inside details if open
      const labels = document.querySelectorAll('.form-label');
      labels.forEach(l => {
        if (l.textContent.includes('نسبة التقدم')) {
          l.textContent = `نسبة التقدم: ${toArabicNumerals(val)}٪`;
        }
      });
    }
  },

  completeSubject(id) {
    const subjects = DB.getSubjects();
    const s = subjects.find(x => x.id === id);
    if (s) {
      s.status = 'completed';
      s.progress = 100;
      DB.saveSubjects(subjects);
      closeTopModal();
      Toast.show('🎉 مبارك إكمال المادة الدراسية!', 'success');
      this.setTab('subjects');
    }
  },

  deleteSubject(id) {
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟ سيتم مسحها فقط ولن تضيع جلسات المذاكرة المسجلة.')) return;
    let subjects = DB.getSubjects();
    subjects = subjects.filter(x => x.id !== id);
    DB.saveSubjects(subjects);
    closeTopModal();
    Toast.show('تم حذف المادة الدراسية', 'info');
    this.setTab('subjects');
  },

  // ── Sessions Tab (Timer & Manual entry) ──
  renderSessions() {
    const sessions = DB.getStudySessions().sort((a,b) => new Date(b.date) - new Date(a.date));
    const subjects = DB.getSubjects();
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return `
      <div style="display:grid; grid-template-columns:1fr 2fr; gap:var(--space-6);">
        <!-- Active Timer Widget -->
        <div>
          <div class="card" style="text-align:center; padding:var(--space-6); background:linear-gradient(145deg, var(--bg-card), var(--bg-elevated));">
            <h3 style="font-size:var(--font-size-base); font-weight:700; margin-bottom:var(--space-4);">⏱️ مؤقت التركيز (البومودورو)</h3>
            <div style="font-size:var(--font-size-4xl); font-weight:800; color:var(--accent-purple-light); font-feature-settings:'tnum'; margin:var(--space-4) 0;" id="study-timer-display">
              ${toArabicNumerals('25:00')}
            </div>
            <div style="margin-bottom:var(--space-4);">
              <select id="timer-subject-select" class="form-control" style="max-width:200px; margin:0 auto;">
                <option value="">اختر المادة الدراسية...</option>
                ${subjects.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex; justify-content:center; gap:var(--space-3);">
              <button class="btn btn-primary" id="study-timer-btn" onclick="StudyModule.toggleTimer()">بدء التركيز</button>
              <button class="btn btn-secondary" onclick="StudyModule.resetTimer()">إعادة ضبط</button>
            </div>
          </div>
          
          <div class="card" style="margin-top:var(--space-4); text-align:center;">
            <div style="font-size:var(--font-size-3xl); font-weight:800; color:var(--accent-emerald);">${toArabicNumerals(totalHours)}</div>
            <div style="font-size:var(--font-size-xs); color:var(--text-muted);">إجمالي ساعات المذاكرة المسجلة</div>
          </div>
        </div>

        <!-- Sessions Log -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📜 سجل جلسات المذاكرة</h3>
            <button class="btn btn-ghost btn-sm" onclick="StudyModule.openManualSession()">إدخال يدوي</button>
          </div>
          ${sessions.length === 0 ? `<div class="empty-state"><p>لا توجد جلسات مذاكرة مسجلة بعد. ابدأ المؤقت الآن!</p></div>` : `
            <div style="display:flex; flex-direction:column; gap:var(--space-2); max-height:400px; overflow-y:auto;">
              ${sessions.map(s => {
                const sub = subjects.find(x => x.id === s.subjectId);
                return `
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-3); background:var(--bg-secondary); border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                    <div style="display:flex; align-items:center; gap:var(--space-2);">
                      <span style="font-size:20px;">${sub?.icon || '📚'}</span>
                      <div>
                        <div style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${sub?.name || 'مذاكرة عامة'}</div>
                        <div style="font-size:var(--font-size-xs); color:var(--text-muted);">${formatDateAr(s.date, 'datetime')}</div>
                      </div>
                    </div>
                    <div style="text-align:left;">
                      <span style="font-size:var(--font-size-sm); font-weight:700; color:var(--accent-purple-light);">${toArabicNumerals(s.duration)} دقيقة</span>
                      <button class="btn btn-ghost btn-icon btn-sm" onclick="StudyModule.deleteSession('${s.id}')" style="margin-right:var(--space-2); color:var(--accent-rose);"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  // Study timer state variables
  timerInterval: null,
  timerSecondsLeft: 25 * 60,
  timerRunning: false,

  toggleTimer() {
    const btn = document.getElementById('study-timer-btn');
    const select = document.getElementById('timer-subject-select');
    
    if (this.timerRunning) {
      // Pause timer
      clearInterval(this.timerInterval);
      this.timerRunning = false;
      if (btn) btn.textContent = 'استئناف';
      Toast.show('تم إيقاف المؤقت مؤقتاً', 'info');
    } else {
      // Start timer
      const subjectId = select?.value;
      this.timerRunning = true;
      if (btn) btn.textContent = 'إيقاف مؤقت';
      
      this.timerInterval = setInterval(() => {
        this.timerSecondsLeft--;
        this.updateTimerDisplay();
        
        if (this.timerSecondsLeft <= 0) {
          clearInterval(this.timerInterval);
          this.timerRunning = false;
          this.timerSecondsLeft = 25 * 60;
          this.updateTimerDisplay();
          if (btn) btn.textContent = 'بدء التركيز';
          
          // Save session automatically
          this.saveStudySessionDirect(subjectId, 25);
          Toast.show('🎉 أحسنت! اكتملت جلسة التركيز (٢٥ دقيقة). تم حفظ الجلسة!', 'success', 5000);
          
          // Re-render
          this.setTab('sessions');
        }
      }, 1000);
      Toast.show('بدأت الجلسة، ركّز الآن! ⏳', 'success');
    }
  },

  resetTimer() {
    clearInterval(this.timerInterval);
    this.timerRunning = false;
    this.timerSecondsLeft = 25 * 60;
    this.updateTimerDisplay();
    const btn = document.getElementById('study-timer-btn');
    if (btn) btn.textContent = 'بدء التركيز';
  },

  updateTimerDisplay() {
    const display = document.getElementById('study-timer-display');
    if (!display) return;
    const m = Math.floor(this.timerSecondsLeft / 60);
    const s = this.timerSecondsLeft % 60;
    const formatted = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    display.textContent = toArabicNumerals(formatted);
  },

  saveStudySessionDirect(subjectId, durationMinutes) {
    const sessions = DB.getStudySessions();
    sessions.push({
      id: generateId(),
      subjectId: subjectId || '',
      duration: durationMinutes,
      date: new Date().toISOString()
    });
    DB.saveStudySessions(sessions);
  },

  openManualSession() {
    const subjects = DB.getSubjects();
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تسجيل جلسة يدوياً 📝</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">المادة الدراسية</label>
          <select id="manual-session-subj" class="form-control">
            <option value="">مذاكرة عامة / أخرى</option>
            ${subjects.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">المدة (بالدقائق)</label>
            <input type="number" id="manual-session-duration" class="form-control" min="1" value="30">
          </div>
          <div class="form-group">
            <label class="form-label">التاريخ والوقت</label>
            <input type="datetime-local" id="manual-session-date" class="form-control" value="${new Date().toISOString().slice(0,16)}">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="StudyModule.saveManualSession()">حفظ الجلسة</button>
      </div>
    `;
    openModal(content);
  },

  saveManualSession() {
    const duration = parseInt(document.getElementById('manual-session-duration')?.value);
    if (!duration || duration <= 0) { Toast.show('يرجى إدخال مدة صحيحة', 'error'); return; }

    const sessions = DB.getStudySessions();
    sessions.push({
      id: generateId(),
      subjectId: document.getElementById('manual-session-subj')?.value || '',
      duration,
      date: new Date(document.getElementById('manual-session-date')?.value || new Date()).toISOString()
    });
    DB.saveStudySessions(sessions);
    closeTopModal();
    Toast.show('تم تسجيل الجلسة بنجاح! ⏱️', 'success');
    this.setTab('sessions');
  },

  deleteSession(id) {
    if (!confirm('هل تريد حذف هذه الجلسة المسجلة؟')) return;
    let sessions = DB.getStudySessions();
    sessions = sessions.filter(x => x.id !== id);
    DB.saveStudySessions(sessions);
    Toast.show('تم حذف الجلسة الدراسية', 'info');
    this.setTab('sessions');
  },

  // ── Books Tab ──
  renderBooks() {
    const books = DB.getBooks();
    if (books.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="book-open" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد كتب دراسية أو قراءة مضافة</h3>
          <p>أضف الكتب الدراسية أو المراجع والكتب الشخصية لتتبع الصفحات المتبقية ومعدل القراءة.</p>
          <button class="btn btn-primary" onclick="StudyModule.openAddBook()">أضف كتاباً الآن</button>
        </div>
      `;
    }

    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--space-4);">
        ${books.map(b => {
          const progressPct = b.totalPages > 0 ? Math.round((b.currentPage / b.totalPages) * 100) : 0;
          return `
            <div class="card animate-fade-in" style="display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <span style="font-size:28px;">📖</span>
                  <div style="display:flex; gap:var(--space-1);">
                    <button class="btn btn-ghost btn-icon btn-sm" onclick="StudyModule.openEditBook('${b.id}')"><i data-lucide="edit-2" style="width:14px;height:14px;"></i></button>
                    <button class="btn btn-danger btn-icon btn-sm" onclick="StudyModule.deleteBook('${b.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                  </div>
                </div>
                <h3 style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary); margin-top:var(--space-2);">${b.title}</h3>
                <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-top:2px;">الكاتب: ${b.author || 'غير معروف'}</p>
              </div>
              <div style="margin-top:var(--space-4);">
                <div style="display:flex; justify-content:space-between; font-size:var(--font-size-xs); color:var(--text-secondary); margin-bottom:4px;">
                  <span>الصفحات: ${toArabicNumerals(b.currentPage)} / ${toArabicNumerals(b.totalPages)}</span>
                  <span>${toArabicNumerals(progressPct)}٪</span>
                </div>
                <div class="progress-bar thin">
                  <div class="progress-fill" style="width:${progressPct}%; background:var(--accent-purple);"></div>
                </div>
                <div style="margin-top:var(--space-3); display:flex; gap:var(--space-2);">
                  <input type="number" class="form-control" style="padding:4px 8px; font-size:12px; max-width:80px;" 
                         value="${b.currentPage}" id="book-progress-input-${b.id}" min="0" max="${b.totalPages}">
                  <button class="btn btn-secondary btn-sm" onclick="StudyModule.updateBookPage('${b.id}')">تحديث</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  openAddBook() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة كتاب جديد 📖</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">عنوان الكتاب / المرجع</label>
          <input type="text" id="book-title" class="form-control" placeholder="عنوان الكتاب بالتفصيل">
        </div>
        <div class="form-group">
          <label class="form-label">الكاتب / المؤلف</label>
          <input type="text" id="book-author" class="form-control" placeholder="اسم الكاتب">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">إجمالي الصفحات</label>
            <input type="number" id="book-total-pages" class="form-control" min="1" value="100">
          </div>
          <div class="form-group">
            <label class="form-label">الصفحة الحالية</label>
            <input type="number" id="book-current-page" class="form-control" min="0" value="0">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="StudyModule.saveBook()">حفظ الكتاب</button>
      </div>
    `;
    openModal(content);
  },

  saveBook() {
    const title = document.getElementById('book-title')?.value?.trim();
    const total = parseInt(document.getElementById('book-total-pages')?.value);
    if (!title) { Toast.show('يرجى إدخال عنوان الكتاب', 'error'); return; }
    if (!total || total <= 0) { Toast.show('يرجى إدخال إجمالي صفحات صحيح', 'error'); return; }

    const books = DB.getBooks();
    books.push({
      id: generateId(),
      title,
      author: document.getElementById('book-author')?.value?.trim() || '',
      totalPages: total,
      currentPage: parseInt(document.getElementById('book-current-page')?.value) || 0,
      createdAt: new Date().toISOString()
    });
    DB.saveBooks(books);
    closeTopModal();
    Toast.show('تمت إضافة الكتاب بنجاح! 📖', 'success');
    this.setTab('books');
  },

  updateBookPage(id) {
    const input = document.getElementById(`book-progress-input-${id}`);
    const newPage = parseInt(input?.value);
    if (isNaN(newPage) || newPage < 0) { Toast.show('يرجى إدخال رقم صفحة صحيح', 'error'); return; }

    const books = DB.getBooks();
    const b = books.find(x => x.id === id);
    if (b) {
      if (newPage > b.totalPages) { Toast.show('الصفحة الحالية لا يمكن أن تتجاوز إجمالي الصفحات', 'error'); return; }
      b.currentPage = newPage;
      DB.saveBooks(books);
      Toast.show('تم تحديث تقدم القراءة 📖', 'success');
      this.setTab('books');
    }
  },

  deleteBook(id) {
    if (!confirm('هل تريد حذف هذا الكتاب من القائمة؟')) return;
    let books = DB.getBooks();
    books = books.filter(x => x.id !== id);
    DB.saveBooks(books);
    Toast.show('تم حذف الكتاب', 'info');
    this.setTab('books');
  },

  // ── Exams & Assignments Tab ──
  renderExams() {
    // We will save exam data in the calendar events with tags or a custom field. Or a separate DB key.
    // Let's use a custom key for Exams/Assignments in study manager. We can fetch them.
    const exams = Storage.get('study_exams', []).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    if (exams.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="calendar" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد امتحانات أو واجبات قادمة</h3>
          <p>أضف تواريخ تسليم التكليفات ومواعيد الاختبارات لكي لا تفوتك وتتلقى التذكيرات.</p>
          <button class="btn btn-primary" onclick="StudyModule.openAddExamOrAssignment()">أضف أول اختبار/واجب</button>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-3);">
        ${exams.map(ex => {
          const isExam = ex.type === 'exam';
          const dateDiff = Math.ceil((new Date(ex.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
          const urgencyBadge = dateDiff <= 2 ? 'badge-rose' : dateDiff <= 7 ? 'badge-amber' : 'badge-green';
          const urgencyText = dateDiff < 0 ? 'متاخر' : dateDiff === 0 ? 'اليوم' : `متبقي ${toArabicNumerals(dateDiff)} يوم`;

          return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-4); background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg);" class="animate-fade-in">
              <div style="display:flex; align-items:center; gap:var(--space-3);">
                <span style="font-size:24px;">${isExam ? '📝' : '✏️'}</span>
                <div>
                  <h4 style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${ex.title}</h4>
                  <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-top:2px;">المادة: ${ex.subjectName || 'عام'} | الموعد: ${formatDateAr(ex.dueDate, 'datetime')}</p>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:var(--space-3);">
                <span class="badge ${urgencyBadge}">${urgencyText}</span>
                <span class="badge ${ex.completed ? 'badge-green' : 'badge-gray'}">${ex.completed ? 'مكتمل' : 'قائم'}</span>
                <button class="btn btn-ghost btn-icon btn-sm" onclick="StudyModule.toggleExamCompleted('${ex.id}')"><i data-lucide="${ex.completed ? 'rotate-ccw' : 'check'}" style="width:14px;height:14px;"></i></button>
                <button class="btn btn-danger btn-icon btn-sm" onclick="StudyModule.deleteExam('${ex.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  openAddExamOrAssignment() {
    const subjects = DB.getSubjects();
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة اختبار أو واجب جديد 📝</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">العنوان</label>
          <input type="text" id="exam-title" class="form-control" placeholder="مثال: واجب برمجة الويب 1، امتحان الميدتيرم...">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">النوع</label>
            <select id="exam-type" class="form-control">
              <option value="assignment">✏️ واجب / تكليف</option>
              <option value="exam">📝 اختبار / امتحان</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">المادة الدراسية</label>
            <select id="exam-subject" class="form-control">
              <option value="">عام / غير محدد</option>
              ${subjects.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label required">تاريخ التسليم / الامتحان</label>
          <input type="datetime-local" id="exam-date" class="form-control" value="${new Date().toISOString().slice(0,16)}">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="StudyModule.saveExam()">إضافة</button>
      </div>
    `;
    openModal(content);
  },

  saveExam() {
    const title = document.getElementById('exam-title')?.value?.trim();
    const dueDate = document.getElementById('exam-date')?.value;
    if (!title) { Toast.show('يرجى إدخال العنوان', 'error'); return; }
    if (!dueDate) { Toast.show('يرجى إدخال تاريخ استحقاق صحيح', 'error'); return; }

    const subjectId = document.getElementById('exam-subject')?.value;
    const subjects = DB.getSubjects();
    const sub = subjects.find(x => x.id === subjectId);

    const exams = Storage.get('study_exams', []);
    exams.push({
      id: generateId(),
      title,
      type: document.getElementById('exam-type')?.value || 'assignment',
      subjectId: subjectId || '',
      subjectName: sub ? sub.name : 'عام',
      dueDate: new Date(dueDate).toISOString(),
      completed: false,
      createdAt: new Date().toISOString()
    });
    Storage.set('study_exams', exams);
    closeTopModal();
    Toast.show('تمت إضافة التكليف/الامتحان بنجاح! 📝', 'success');
    this.setTab('exams');
  },

  toggleExamCompleted(id) {
    const exams = Storage.get('study_exams', []);
    const ex = exams.find(x => x.id === id);
    if (ex) {
      ex.completed = !ex.completed;
      Storage.set('study_exams', exams);
      Toast.show(ex.completed ? 'أحسنت! تم إنجاز التكليف ✅' : 'تمت إعادة التكليف للوضع النشط', 'info');
      this.setTab('exams');
    }
  },

  deleteExam(id) {
    if (!confirm('هل تريد حذف هذا التكليف/الامتحان؟')) return;
    let exams = Storage.get('study_exams', []);
    exams = exams.filter(x => x.id !== id);
    Storage.set('study_exams', exams);
    Toast.show('تم حذف التكليف/الامتحان', 'info');
    this.setTab('exams');
  },

  // ── Academic Calendar (Sept 1 – June 30) ──
  renderAcademicCalendar() {
    const now = new Date();
    const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    const semStart = new Date(year, 8, 1);       // Sept 1
    const midtermStart = new Date(year, 11, 1);  // Dec 1 (approx midterms)
    const sem2Start = new Date(year + 1, 1, 1);  // Feb 1
    const finalsStart = new Date(year + 1, 4, 15); // May 15 (approx finals)
    const semEnd = new Date(year + 1, 5, 30);    // June 30

    const totalDays = Math.ceil((semEnd - semStart) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.max(0, Math.ceil((now - semStart) / (1000 * 60 * 60 * 24)));
    const semProgress = Math.min(100, Math.round((daysPassed / totalDays) * 100));

    const studyWeekNumber = Math.max(0, Math.ceil((now - semStart) / (7 * 24 * 60 * 60 * 1000)));
    const daysToEnd = Math.max(0, Math.ceil((semEnd - now) / (1000 * 60 * 60 * 24)));

    // Upcoming exams
    const upcomingExams = Storage.get('study_exams', [])
      .filter(e => !e.completed && new Date(e.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    const milestones = [
      { label: 'بداية الفصل الدراسي', date: semStart, icon: '🏫', color: 'var(--accent-blue)' },
      { label: 'الاختبارات المنتصفية (تقريباً)', date: midtermStart, icon: '📝', color: 'var(--accent-amber)' },
      { label: 'بداية الفصل الثاني', date: sem2Start, icon: '📚', color: 'var(--accent-purple)' },
      { label: 'الاختبارات النهائية (تقريباً)', date: finalsStart, icon: '📋', color: 'var(--accent-rose)' },
      { label: 'نهاية السنة الدراسية', date: semEnd, icon: '🎓', color: 'var(--accent-emerald)' },
    ];

    const formatDaysLeft = (d) => {
      const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      if (diff < 0) return `<span style="color:var(--accent-emerald);">✅ مضى</span>`;
      if (diff === 0) return `<span style="color:var(--accent-rose);">اليوم!</span>`;
      return `<span style="color:var(--text-muted);">بعد ${diff} يوم</span>`;
    };

    return `
      <div style="max-width:900px;">
        <!-- Academic Year Overview -->
        <div class="card" style="margin-bottom:var(--space-5); background:linear-gradient(135deg, rgba(59,130,246,0.06), rgba(124,58,237,0.04)); border-color:rgba(59,130,246,0.2);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4); flex-wrap:wrap; gap:var(--space-3);">
            <div>
              <div style="font-size:1.3rem; font-weight:800; color:var(--text-primary);">🏫 السنة الدراسية ${year} — ${year+1}</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">من 1 سبتمبر إلى 30 يونيو</div>
            </div>
            <div style="display:flex; gap:var(--space-5); text-align:center;">
              <div>
                <div style="font-size:1.5rem; font-weight:900; color:var(--accent-blue);">أسبوع ${studyWeekNumber}</div>
                <div style="font-size:11px; color:var(--text-muted);">الأسبوع الحالي</div>
              </div>
              <div>
                <div style="font-size:1.5rem; font-weight:900; color:var(--accent-purple);">${semProgress}٪</div>
                <div style="font-size:11px; color:var(--text-muted);">تقدم السنة</div>
              </div>
              <div>
                <div style="font-size:1.5rem; font-weight:900; color:var(--accent-amber);">${daysToEnd}</div>
                <div style="font-size:11px; color:var(--text-muted);">يوم متبقي</div>
              </div>
            </div>
          </div>
          <div class="progress-bar" style="height:12px; border-radius:99px;">
            <div class="progress-fill hero" style="width:${semProgress}%; border-radius:99px; background:linear-gradient(90deg, var(--accent-blue), var(--accent-purple));"></div>
          </div>
        </div>

        <!-- Milestones Timeline -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="card-header">
            <div class="card-title">📍 أحداث السنة الدراسية</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:var(--space-3); padding-top:var(--space-2);">
            ${milestones.map((m, i) => {
              const isPast = m.date < now;
              const isNear = !isPast && Math.ceil((m.date - now) / (1000*60*60*24)) <= 30;
              return `
              <div style="display:flex; align-items:center; gap:var(--space-4); padding:var(--space-3); background:${isPast ? 'rgba(16,185,129,0.04)' : isNear ? 'rgba(245,158,11,0.05)' : 'var(--bg-secondary)'}; border-radius:var(--radius-md); border:1px solid ${isPast ? 'rgba(16,185,129,0.15)' : isNear ? 'rgba(245,158,11,0.2)' : 'var(--border-subtle)'};">
                <div style="font-size:24px; flex-shrink:0;">${m.icon}</div>
                <div style="flex:1;">
                  <div style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${m.label}</div>
                  <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${formatDateAr(m.date, 'full')}</div>
                </div>
                <div style="text-align:center; min-width:80px; font-size:12px; font-weight:700;">${formatDaysLeft(m.date)}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Upcoming Exams -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📋 المهام والامتحانات القادمة</div>
            <button class="btn btn-primary btn-sm" onclick="StudyModule.setTab('exams')">عرض الكل</button>
          </div>
          ${upcomingExams.length === 0 ? `
            <div style="text-align:center; padding:var(--space-6); color:var(--text-muted);">
              <div style="font-size:32px; margin-bottom:var(--space-3);">✅</div>
              <div style="font-size:var(--font-size-sm); font-weight:600;">لا توجد مهام أو امتحانات قادمة</div>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:var(--space-2); margin-top:var(--space-3);">
              ${upcomingExams.map(ex => {
                const dueDate = new Date(ex.dueDate);
                const daysLeft = Math.ceil((dueDate - now) / (1000*60*60*24));
                const urgentColor = daysLeft <= 3 ? 'var(--accent-rose)' : daysLeft <= 7 ? 'var(--accent-amber)' : 'var(--accent-blue)';
                return `
                <div style="display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3); background:var(--bg-secondary); border-radius:var(--radius-md); border-right:3px solid ${urgentColor};">
                  <div style="font-size:20px;">${ex.type === 'exam' ? '📝' : ex.type === 'midterm' ? '📋' : ex.type === 'final' ? '🎯' : '📌'}</div>
                  <div style="flex:1;">
                    <div style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${ex.title}</div>
                    <div style="font-size:11px; color:var(--text-muted);">${ex.subjectName || 'عام'} · ${formatDateAr(dueDate, 'short')}</div>
                  </div>
                  <div style="font-size:12px; font-weight:800; color:${urgentColor}; min-width:60px; text-align:center;">${daysLeft === 0 ? 'اليوم!' : 'بعد ' + daysLeft + ' يوم'}</div>
                </div>`;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },
};
