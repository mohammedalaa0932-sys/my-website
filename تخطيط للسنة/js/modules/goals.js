/**
 * LIFE OS — Goals Management System (نظام إدارة الأهداف الهرمي)
 * 4-Level Hierarchy: Yearly → Monthly → Weekly → Daily
 * Auto-sync: completing lower levels updates parent progress automatically
 */

const GoalsModule = {
  state: {
    activeTab: 'yearly', // yearly | monthly | weekly | daily | latest
  },

  // ═══════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════
  render(container) {
    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">🎯 نظام إدارة الأهداف</h1>
            <p class="page-subtitle">هرمية واضحة: سنوي → شهري → أسبوعي → يومي — كل مستوى يُحرّك الذي فوقه</p>
          </div>
          <div class="header-actions" id="goals-header-actions">
            ${this.renderHeaderAction()}
          </div>
        </div>

        <!-- Goal Hierarchy Tabs -->
        <div style="margin-bottom:var(--space-6);">
          <div class="tabs" style="max-width:700px;">
            <div class="tab-item ${this.state.activeTab==='yearly'?'active':''}" onclick="GoalsModule.setTab('yearly')">
              🏆 سنوية
            </div>
            <div class="tab-item ${this.state.activeTab==='monthly'?'active':''}" onclick="GoalsModule.setTab('monthly')">
              📅 شهرية
            </div>
            <div class="tab-item ${this.state.activeTab==='weekly'?'active':''}" onclick="GoalsModule.setTab('weekly')">
              📆 أسبوعية
            </div>
            <div class="tab-item ${this.state.activeTab==='daily'?'active':''}" onclick="GoalsModule.setTab('daily')">
              ⭐ يومية
            </div>
            <div class="tab-item ${this.state.activeTab==='latest'?'active':''}" onclick="GoalsModule.setTab('latest')">
              🔔 أحدث الأهداف
            </div>
          </div>
        </div>

        <!-- Hierarchy Visualizer Bar (always visible) -->
        ${this.renderHierarchyBar()}

        <!-- Tab Content -->
        <div id="goals-tab-content">
          ${this.renderTabContent()}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  // ═══════════════════════════════════════════════════════
  // HIERARCHY VISUALIZER
  // ═══════════════════════════════════════════════════════
  renderHierarchyBar() {
    const yearly  = DB.getYearlyGoals();
    const monthly = DB.getMonthlyGoals();
    const weekly  = DB.getWeeklyGoals();
    const daily   = DB.getDailyGoals().filter(d => d.date === todayKey());

    const yActive  = yearly.filter(g => g.status === 'active').length;
    const mActive  = monthly.filter(g => g.status === 'active').length;
    const wActive  = weekly.filter(g => g.status === 'active').length;
    const dToday   = daily.length;
    const dDone    = daily.filter(d => d.completed).length;

    return `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);margin-bottom:var(--space-6);">
        <div class="stat-card animate-fade-in" style="cursor:pointer;border-top:3px solid var(--accent-purple);" onclick="GoalsModule.setTab('yearly')">
          <div style="font-size:22px;">🏆</div>
          <div class="stat-card-value" style="color:var(--accent-purple);">${toArabicNumerals(yActive)}</div>
          <div class="stat-card-label">هدف سنوي نشط</div>
          <div class="stat-card-sub">${toArabicNumerals(yearly.length)} إجمالي</div>
        </div>
        <div class="stat-card animate-fade-in delay-1" style="cursor:pointer;border-top:3px solid var(--accent-blue);" onclick="GoalsModule.setTab('monthly')">
          <div style="font-size:22px;">📅</div>
          <div class="stat-card-value" style="color:var(--accent-blue);">${toArabicNumerals(mActive)}</div>
          <div class="stat-card-label">هدف شهري نشط</div>
          <div class="stat-card-sub">${toArabicNumerals(monthly.length)} إجمالي</div>
        </div>
        <div class="stat-card animate-fade-in delay-2" style="cursor:pointer;border-top:3px solid var(--accent-emerald);" onclick="GoalsModule.setTab('weekly')">
          <div style="font-size:22px;">📆</div>
          <div class="stat-card-value" style="color:var(--accent-emerald);">${toArabicNumerals(wActive)}</div>
          <div class="stat-card-label">هدف أسبوعي نشط</div>
          <div class="stat-card-sub">${toArabicNumerals(weekly.length)} إجمالي</div>
        </div>
        <div class="stat-card animate-fade-in delay-3" style="cursor:pointer;border-top:3px solid var(--accent-amber);" onclick="GoalsModule.setTab('daily')">
          <div style="font-size:22px;">⭐</div>
          <div class="stat-card-value" style="color:var(--accent-amber);">${toArabicNumerals(dDone)}/${toArabicNumerals(dToday)}</div>
          <div class="stat-card-label">أهداف اليوم</div>
          <div class="stat-card-sub">${dToday === 0 ? 'لا توجد أهداف اليوم' : `${toArabicNumerals(Math.round((dDone/dToday)*100))}٪ مكتمل`}</div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════
  // TAB MANAGEMENT
  // ═══════════════════════════════════════════════════════
  setTab(tab) {
    this.state.activeTab = tab;

    // Update tab styling
    document.querySelectorAll('.tab-item').forEach((el, i) => {
      const tabs = ['yearly','monthly','weekly','daily','latest'];
      el.classList.toggle('active', tabs[i] === tab);
    });

    // Update header action button
    const actionsEl = document.getElementById('goals-header-actions');
    if (actionsEl) actionsEl.innerHTML = this.renderHeaderAction();

    // Re-render content
    const content = document.getElementById('goals-tab-content');
    if (content) {
      content.innerHTML = this.renderTabContent();
      if (window.lucide) lucide.createIcons();
    }
  },

  renderHeaderAction() {
    switch (this.state.activeTab) {
      case 'yearly':
        return `<button class="btn btn-primary" onclick="GoalsModule.openAddYearlyGoal()"><i data-lucide="plus" style="width:16px;height:16px;"></i> هدف سنوي جديد</button>`;
      case 'monthly':
        return `<button class="btn btn-primary" onclick="GoalsModule.openAddMonthlyGoal()"><i data-lucide="plus" style="width:16px;height:16px;"></i> هدف شهري جديد</button>`;
      case 'weekly':
        return `<button class="btn btn-primary" onclick="GoalsModule.openAddWeeklyGoal()"><i data-lucide="plus" style="width:16px;height:16px;"></i> هدف أسبوعي جديد</button>`;
      case 'daily':
        return `<button class="btn btn-primary" onclick="GoalsModule.openAddDailyGoal()"><i data-lucide="plus" style="width:16px;height:16px;"></i> هدف يومي جديد</button>`;
      default:
        return '';
    }
  },

  renderTabContent() {
    switch (this.state.activeTab) {
      case 'yearly':  return this.renderYearlyGoals();
      case 'monthly': return this.renderMonthlyGoals();
      case 'weekly':  return this.renderWeeklyGoals();
      case 'daily':   return this.renderDailyGoals();
      case 'latest':  return this.renderLatestGoals();
      default:        return this.renderYearlyGoals();
    }
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 1: YEARLY GOALS
  // ═══════════════════════════════════════════════════════
  renderYearlyGoals() {
    const yearly  = DB.getYearlyGoals();
    const monthly = DB.getMonthlyGoals();

    if (yearly.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="trophy" style="width:40px;height:40px;"></i></div>
          <h3>لا توجد أهداف سنوية بعد</h3>
          <p>الأهداف السنوية هي أكبر غاياتك وأعمق طموحاتك طوال سنتك الشخصية.<br>
             مثال: الحصول على شهادة CCNA، تحسين اللياقة، بناء محفظة احترافية.</p>
          <button class="btn btn-primary" onclick="GoalsModule.openAddYearlyGoal()">أضف أول هدف سنوي</button>
        </div>
      `;
    }

    const active    = yearly.filter(g => g.status === 'active');
    const completed = yearly.filter(g => g.status === 'completed');

    return `
      <div>
        ${active.length > 0 ? `
          <div class="section-header" style="margin-bottom:var(--space-4);">
            <div class="section-title">🔥 الأهداف السنوية النشطة</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:var(--space-4);margin-bottom:var(--space-8);">
            ${active.map(g => this.renderYearlyCard(g, monthly)).join('')}
          </div>
        ` : ''}

        ${completed.length > 0 ? `
          <div class="section-header" style="margin-bottom:var(--space-4);">
            <div class="section-title">✅ الأهداف السنوية المكتملة</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:var(--space-4);">
            ${completed.map(g => this.renderYearlyCard(g, monthly)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  renderYearlyCard(g, monthly) {
    const milestones        = g.milestones || [];
    const doneMilestones    = milestones.filter(m => m.done).length;
    const connectedMonthly  = monthly.filter(m => m.yearlyGoalId === g.id);
    const doneMonthly       = connectedMonthly.filter(m => m.status === 'completed').length;
    const cat               = CATEGORIES ? (CATEGORIES.find(c => c.id === g.category) || {icon:'⭐', ar:'عام'}) : {icon:'⭐', ar:'عام'};
    const isCompleted       = g.status === 'completed';

    return `
      <div class="goal-card card animate-fade-in" style="cursor:pointer;${isCompleted ? 'opacity:0.75;' : ''}" onclick="GoalsModule.openYearlyDetail('${g.id}')">
        <div style="width:4px;height:100%;position:absolute;right:0;top:0;background:var(--accent-purple);border-radius:0 var(--radius-lg) var(--radius-lg) 0;"></div>
        <div style="padding-right:var(--space-3);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-2);">
            <span style="font-size:22px;">${cat.icon}</span>
            <div style="display:flex;gap:var(--space-2);align-items:center;">
              <span class="badge badge-purple" style="font-size:10px;">${cat.ar}</span>
              <span class="badge ${isCompleted ? 'badge-green' : 'badge-gray'}" style="font-size:10px;">${isCompleted ? '✅ مكتمل' : '🔥 نشط'}</span>
            </div>
          </div>

          <h3 style="font-size:var(--font-size-md);font-weight:800;color:var(--text-primary);margin-bottom:var(--space-2);line-height:1.4;">${g.title}</h3>

          ${g.whyMatters ? `
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:var(--space-3);padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-sm);border-right:3px solid var(--accent-purple);">
              💡 ${g.whyMatters}
            </div>
          ` : ''}

          <!-- Progress -->
          <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
            <div class="progress-bar" style="flex:1;height:8px;">
              <div class="progress-fill" style="width:${g.progress || 0}%;background:linear-gradient(90deg,var(--accent-purple),var(--accent-blue));"></div>
            </div>
            <span style="font-size:13px;font-weight:800;color:var(--accent-purple);min-width:36px;text-align:center;">${toArabicNumerals(g.progress || 0)}٪</span>
          </div>

          <!-- Meta info -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-2);">
            <div style="text-align:center;padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-sm);">
              <div style="font-size:11px;font-weight:700;color:var(--text-primary);">${toArabicNumerals(doneMilestones)}/${toArabicNumerals(milestones.length)}</div>
              <div style="font-size:10px;color:var(--text-muted);">مراحل</div>
            </div>
            <div style="text-align:center;padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-sm);">
              <div style="font-size:11px;font-weight:700;color:var(--text-primary);">${toArabicNumerals(doneMonthly)}/${toArabicNumerals(connectedMonthly.length)}</div>
              <div style="font-size:10px;color:var(--text-muted);">شهرية</div>
            </div>
            <div style="text-align:center;padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-sm);">
              <div style="font-size:11px;font-weight:700;color:var(--text-primary);">${g.deadline ? formatDateAr(new Date(g.deadline), 'short') : '--'}</div>
              <div style="font-size:10px;color:var(--text-muted);">الموعد</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  openAddYearlyGoal() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">🏆 هدف سنوي جديد</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">عنوان الهدف السنوي</label>
          <input type="text" id="yg-title" class="form-control" placeholder="مثال: الحصول على شهادة CCNA" autofocus>
        </div>
        <div class="form-group">
          <label class="form-label">لماذا هذا الهدف مهم بالنسبة لك؟</label>
          <input type="text" id="yg-why" class="form-control" placeholder="مثال: لفتح آفاق وظيفية وتطوير مهاراتي التقنية">
        </div>
        <div class="form-group">
          <label class="form-label">الوصف التفصيلي</label>
          <textarea id="yg-desc" class="form-control" rows="2" placeholder="تفاصيل إضافية..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">الفئة</label>
            <select id="yg-category" class="form-control">
              ${(typeof CATEGORIES !== 'undefined' ? CATEGORIES : []).map(c => `<option value="${c.id}">${c.icon} ${c.ar}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الأولوية</label>
            <select id="yg-priority" class="form-control">
              <option value="high">🔴 عالية</option>
              <option value="medium" selected>🟡 متوسطة</option>
              <option value="low">🟢 منخفضة</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الموعد النهائي</label>
            <input type="date" id="yg-deadline" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">المراحل الأساسية (Milestones)</label>
          <div id="yg-milestones-container" style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-2);"></div>
          <button class="btn btn-ghost btn-sm" onclick="GoalsModule.addMilestoneInput('yg-milestones-container')">+ إضافة مرحلة</button>
        </div>
        <div class="form-group">
          <label class="form-label">الموارد والمصادر</label>
          <textarea id="yg-resources" class="form-control" rows="2" placeholder="كتب، دورات، روابط مفيدة..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات</label>
          <textarea id="yg-notes" class="form-control" rows="2" placeholder="أي ملاحظات إضافية..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="GoalsModule.saveYearlyGoal()">💾 حفظ الهدف السنوي</button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
    this.addMilestoneInput('yg-milestones-container');
    if (window.lucide) lucide.createIcons();
  },

  addMilestoneInput(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;gap:var(--space-2);align-items:center;';
    div.innerHTML = `
      <input type="text" class="form-control milestone-input-${containerId}" placeholder="مرحلة أساسية..." style="flex:1;">
      <button class="btn btn-danger btn-icon btn-sm" onclick="this.parentElement.remove()"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
    `;
    container.appendChild(div);
    if (window.lucide) lucide.createIcons();
  },

  saveYearlyGoal() {
    const title = document.getElementById('yg-title')?.value?.trim();
    if (!title) { Toast.show('يرجى إدخال عنوان الهدف', 'error'); return; }

    const milestones = [...document.querySelectorAll('.milestone-input-yg-milestones-container')]
      .map(inp => ({ id: generateId(), text: inp.value.trim(), done: false }))
      .filter(m => m.text);

    const yearly = DB.getYearlyGoals();
    yearly.push({
      id: generateId(),
      title,
      whyMatters:   document.getElementById('yg-why')?.value?.trim() || '',
      description:  document.getElementById('yg-desc')?.value?.trim() || '',
      category:     document.getElementById('yg-category')?.value || 'other',
      priority:     document.getElementById('yg-priority')?.value || 'medium',
      deadline:     document.getElementById('yg-deadline')?.value || '',
      resources:    document.getElementById('yg-resources')?.value?.trim() || '',
      notes:        document.getElementById('yg-notes')?.value?.trim() || '',
      progress:     0,
      status:       'active',
      milestones,
      createdAt:    new Date().toISOString(),
    });
    DB.saveYearlyGoals(yearly);
    closeTopModal();
    Toast.show('تم حفظ الهدف السنوي بنجاح! 🏆', 'success');
    this.setTab('yearly');
  },

  openYearlyDetail(id) {
    const yearly  = DB.getYearlyGoals();
    const g       = yearly.find(x => x.id === id);
    if (!g) return;

    const monthly  = DB.getMonthlyGoals().filter(m => m.yearlyGoalId === id);
    const cat      = (typeof CATEGORIES !== 'undefined' ? CATEGORIES : []).find(c => c.id === g.category) || {icon:'⭐', ar:'عام'};

    const content = `
      <div class="modal-header">
        <div>
          <span class="badge badge-purple">${cat.icon} ${cat.ar}</span>
          <h3 class="modal-title" style="margin-top:6px;">${g.title}</h3>
        </div>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn-secondary btn-sm" onclick="GoalsModule.openEditYearlyGoal('${g.id}')">تعديل</button>
          <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
      </div>
      <div class="modal-body">
        <!-- Why it matters -->
        ${g.whyMatters ? `
          <div style="background:rgba(124,58,237,0.08);border-right:4px solid var(--accent-purple);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-4);">
            <strong style="font-size:var(--font-size-xs);color:var(--accent-purple-light);">💡 لماذا يهمّني هذا الهدف</strong>
            <p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin-top:4px;">${g.whyMatters}</p>
          </div>
        ` : ''}

        ${g.description ? `<p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin-bottom:var(--space-4);">${g.description}</p>` : ''}

        <!-- Progress -->
        <div style="margin-bottom:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
            <span style="font-size:var(--font-size-sm);font-weight:700;">التقدم الإجمالي</span>
            <span style="font-size:var(--font-size-lg);font-weight:800;color:var(--accent-purple);">${toArabicNumerals(g.progress || 0)}٪</span>
          </div>
          <div class="progress-bar" style="height:12px;border-radius:99px;">
            <div class="progress-fill" style="width:${g.progress || 0}%;background:linear-gradient(90deg,var(--accent-purple),var(--accent-blue));border-radius:99px;"></div>
          </div>
        </div>

        <!-- Milestones -->
        <div style="margin-bottom:var(--space-4);">
          <h4 style="font-size:var(--font-size-sm);font-weight:700;margin-bottom:var(--space-3);display:flex;align-items:center;gap:6px;">
            <i data-lucide="flag" style="width:16px;height:16px;color:var(--accent-purple);"></i>
            المراحل الأساسية
          </h4>
          ${(g.milestones || []).length === 0 ? `<p style="color:var(--text-muted);font-size:var(--font-size-xs);">لا توجد مراحل محددة</p>` : `
            <div style="display:flex;flex-direction:column;gap:var(--space-2);">
              ${(g.milestones || []).map(m => `
                <label class="checkbox-wrapper" style="cursor:pointer;">
                  <input type="checkbox" ${m.done ? 'checked' : ''} onchange="GoalsModule.toggleYearlyMilestone('${g.id}','${m.id}')">
                  <div class="custom-checkbox"></div>
                  <span style="${m.done ? 'text-decoration:line-through;color:var(--text-muted);' : 'color:var(--text-primary);'}font-size:var(--font-size-sm);">${m.text}</span>
                </label>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Resources -->
        ${g.resources ? `
          <div style="margin-bottom:var(--space-4);">
            <h4 style="font-size:var(--font-size-sm);font-weight:700;margin-bottom:var(--space-2);">📚 الموارد</h4>
            <p style="font-size:var(--font-size-sm);color:var(--text-secondary);white-space:pre-line;">${g.resources}</p>
          </div>
        ` : ''}

        <!-- Notes -->
        ${g.notes ? `
          <div style="margin-bottom:var(--space-4);">
            <h4 style="font-size:var(--font-size-sm);font-weight:700;margin-bottom:var(--space-2);">📝 ملاحظات</h4>
            <p style="font-size:var(--font-size-sm);color:var(--text-secondary);">${g.notes}</p>
          </div>
        ` : ''}

        <!-- Connected Monthly Goals -->
        <div style="border-top:1px solid var(--border);padding-top:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);">
            <h4 style="font-size:var(--font-size-sm);font-weight:700;">📅 الأهداف الشهرية المرتبطة</h4>
            <button class="btn btn-ghost btn-sm" onclick="closeTopModal();GoalsModule.openAddMonthlyGoal('${g.id}')">+ شهري</button>
          </div>
          ${monthly.length === 0 ? `<p style="font-size:var(--font-size-xs);color:var(--text-muted);">لا توجد أهداف شهرية مرتبطة بعد</p>` : `
            <div style="display:flex;flex-direction:column;gap:var(--space-2);">
              ${monthly.map(m => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-3);background:var(--bg-secondary);border-radius:var(--radius-md);cursor:pointer;" onclick="closeTopModal();GoalsModule.openMonthlyDetail('${m.id}')">
                  <div>
                    <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${m.title}</div>
                    ${m.deadline ? `<div style="font-size:11px;color:var(--text-muted);">📅 ${formatDateAr(new Date(m.deadline),'short')}</div>` : ''}
                  </div>
                  <span class="badge ${m.status==='completed'?'badge-green':'badge-blue'}">${m.status==='completed'?'✅ مكتمل':`${toArabicNumerals(m.progress||0)}٪`}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-danger btn-sm" onclick="GoalsModule.deleteYearlyGoal('${g.id}')">حذف</button>
        <button class="btn btn-secondary" onclick="closeTopModal()">إغلاق</button>
        ${g.status !== 'completed' ? `<button class="btn btn-success" onclick="GoalsModule.completeYearlyGoal('${g.id}')">🎉 إكمال الهدف</button>` : ''}
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
  },

  toggleYearlyMilestone(goalId, milestoneId) {
    const yearly = DB.getYearlyGoals();
    const g = yearly.find(x => x.id === goalId);
    if (!g) return;
    const m = g.milestones.find(x => x.id === milestoneId);
    if (m) {
      m.done = !m.done;
      const done = g.milestones.filter(x => x.done).length;
      g.progress = g.milestones.length ? Math.round((done / g.milestones.length) * 100) : 0;
      if (g.progress === 100) g.status = 'completed';
      DB.saveYearlyGoals(yearly);
      Toast.show(m.done ? '✅ تم إكمال المرحلة!' : 'تم إلغاء المرحلة', 'success');
      closeTopModal();
      this.openYearlyDetail(goalId);
    }
  },

  completeYearlyGoal(id) {
    const yearly = DB.getYearlyGoals();
    const g = yearly.find(x => x.id === id);
    if (g) {
      g.status = 'completed'; g.progress = 100;
      g.completedAt = new Date().toISOString();
      if (g.milestones) g.milestones.forEach(m => m.done = true);
      DB.saveYearlyGoals(yearly);
      closeTopModal();
      Toast.show('🎉 مبروك إكمال هدفك السنوي الكبير!', 'success');
      this.setTab('yearly');
    }
  },

  deleteYearlyGoal(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الهدف السنوي نهائياً؟')) return;
    let yearly = DB.getYearlyGoals();
    yearly = yearly.filter(x => x.id !== id);
    DB.saveYearlyGoals(yearly);
    closeTopModal();
    Toast.show('تم حذف الهدف السنوي', 'info');
    this.setTab('yearly');
  },

  openEditYearlyGoal(id) {
    closeTopModal();
    const yearly = DB.getYearlyGoals();
    const g = yearly.find(x => x.id === id);
    if (!g) return;
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تعديل الهدف السنوي</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">العنوان</label>
          <input type="text" id="eyg-title" class="form-control" value="${g.title}">
        </div>
        <div class="form-group">
          <label class="form-label">الدافع</label>
          <input type="text" id="eyg-why" class="form-control" value="${g.whyMatters || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">الوصف</label>
          <textarea id="eyg-desc" class="form-control" rows="2">${g.description || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">الفئة</label>
            <select id="eyg-category" class="form-control">
              ${(typeof CATEGORIES !== 'undefined' ? CATEGORIES : []).map(c => `<option value="${c.id}" ${g.category===c.id?'selected':''}>${c.icon} ${c.ar}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الأولوية</label>
            <select id="eyg-priority" class="form-control">
              <option value="high" ${g.priority==='high'?'selected':''}>🔴 عالية</option>
              <option value="medium" ${g.priority==='medium'?'selected':''}>🟡 متوسطة</option>
              <option value="low" ${g.priority==='low'?'selected':''}>🟢 منخفضة</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الموعد النهائي</label>
            <input type="date" id="eyg-deadline" class="form-control" value="${g.deadline || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">الموارد</label>
          <textarea id="eyg-resources" class="form-control" rows="2">${g.resources || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات</label>
          <textarea id="eyg-notes" class="form-control" rows="2">${g.notes || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">نسبة التقدم اليدوية</label>
          <input type="range" id="eyg-progress" class="form-control" min="0" max="100" value="${g.progress||0}" oninput="document.getElementById('eyg-progress-val').textContent=this.value+'٪'">
          <div id="eyg-progress-val" style="text-align:center;font-weight:700;color:var(--accent-purple);">${toArabicNumerals(g.progress||0)}٪</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="GoalsModule.updateYearlyGoal('${g.id}')">حفظ التعديلات</button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
  },

  updateYearlyGoal(id) {
    const title = document.getElementById('eyg-title')?.value?.trim();
    if (!title) { Toast.show('يرجى إدخال العنوان', 'error'); return; }
    const yearly = DB.getYearlyGoals();
    const g = yearly.find(x => x.id === id);
    if (g) {
      g.title       = title;
      g.whyMatters  = document.getElementById('eyg-why')?.value?.trim() || '';
      g.description = document.getElementById('eyg-desc')?.value?.trim() || '';
      g.category    = document.getElementById('eyg-category')?.value || 'other';
      g.priority    = document.getElementById('eyg-priority')?.value || 'medium';
      g.deadline    = document.getElementById('eyg-deadline')?.value || '';
      g.resources   = document.getElementById('eyg-resources')?.value?.trim() || '';
      g.notes       = document.getElementById('eyg-notes')?.value?.trim() || '';
      g.progress    = parseInt(document.getElementById('eyg-progress')?.value || '0');
      DB.saveYearlyGoals(yearly);
      closeTopModal();
      Toast.show('تم تعديل الهدف السنوي بنجاح!', 'success');
      this.setTab('yearly');
    }
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 2: MONTHLY GOALS
  // ═══════════════════════════════════════════════════════
  renderMonthlyGoals() {
    const monthly = DB.getMonthlyGoals();
    const yearly  = DB.getYearlyGoals();
    const weekly  = DB.getWeeklyGoals();

    if (monthly.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="calendar" style="width:40px;height:40px;"></i></div>
          <h3>لا توجد أهداف شهرية بعد</h3>
          <p>الأهداف الشهرية تقسّم سنتك إلى خطوات واقعية. كل هدف شهري يجب أن يكون مرتبطاً بهدف سنوي.</p>
          <button class="btn btn-primary" onclick="GoalsModule.openAddMonthlyGoal()">أضف هدفاً شهرياً</button>
        </div>
      `;
    }

    // Group by yearly goal
    const grouped = {};
    monthly.forEach(m => {
      const key = m.yearlyGoalId || 'none';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });

    return `
      <div style="display:flex;flex-direction:column;gap:var(--space-6);">
        ${Object.entries(grouped).map(([yid, goals]) => {
          const yGoal = yearly.find(y => y.id === yid);
          return `
            <div>
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);padding:var(--space-3);background:rgba(124,58,237,0.06);border-radius:var(--radius-md);border-right:3px solid var(--accent-purple);">
                <i data-lucide="trophy" style="width:16px;height:16px;color:var(--accent-purple);"></i>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">
                  ${yGoal ? yGoal.title : 'أهداف غير مرتبطة'}
                </span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--space-4);">
                ${goals.map(m => this.renderMonthlyCard(m, yGoal, weekly)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderMonthlyCard(m, yGoal, weekly) {
    const tasks         = m.tasks || [];
    const doneTasks     = tasks.filter(t => t.done).length;
    const relatedWeekly = weekly.filter(w => w.monthlyGoalId === m.id);
    const doneWeekly    = relatedWeekly.filter(w => w.status === 'completed').length;
    const isCompleted   = m.status === 'completed';

    return `
      <div class="card animate-fade-in" style="cursor:pointer;${isCompleted ? 'opacity:0.75;' : ''}border-top:3px solid var(--accent-blue);" onclick="GoalsModule.openMonthlyDetail('${m.id}')">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <span class="badge badge-blue" style="font-size:10px;">📅 شهري</span>
          <span class="badge ${isCompleted ? 'badge-green' : 'badge-gray'}" style="font-size:10px;">${isCompleted ? '✅ مكتمل' : '🔥 نشط'}</span>
        </div>
        <h3 style="font-size:var(--font-size-sm);font-weight:800;color:var(--text-primary);margin-bottom:var(--space-2);">${m.title}</h3>
        ${m.deadline ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:var(--space-3);">📅 ${formatDateAr(new Date(m.deadline),'short')}</div>` : ''}

        <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
          <div class="progress-bar" style="flex:1;height:6px;">
            <div class="progress-fill" style="width:${m.progress || 0}%;background:linear-gradient(90deg,var(--accent-blue),var(--accent-emerald));"></div>
          </div>
          <span style="font-size:12px;font-weight:700;color:var(--accent-blue);">${toArabicNumerals(m.progress || 0)}٪</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
          <div style="text-align:center;padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-sm);">
            <div style="font-size:11px;font-weight:700;color:var(--text-primary);">${toArabicNumerals(doneTasks)}/${toArabicNumerals(tasks.length)}</div>
            <div style="font-size:10px;color:var(--text-muted);">مهام</div>
          </div>
          <div style="text-align:center;padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-sm);">
            <div style="font-size:11px;font-weight:700;color:var(--text-primary);">${toArabicNumerals(doneWeekly)}/${toArabicNumerals(relatedWeekly.length)}</div>
            <div style="font-size:10px;color:var(--text-muted);">أسبوعية</div>
          </div>
        </div>
      </div>
    `;
  },

  openAddMonthlyGoal(prefilledYearlyId) {
    const yearly = DB.getYearlyGoals();
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">📅 هدف شهري جديد</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">عنوان الهدف الشهري</label>
          <input type="text" id="mg-title" class="form-control" placeholder="مثال: إنهاء وحدة Routing and Switching" autofocus>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">مرتبط بالهدف السنوي</label>
            <select id="mg-yearly" class="form-control">
              <option value="">-- اختر الهدف السنوي --</option>
              ${yearly.map(y => `<option value="${y.id}" ${prefilledYearlyId===y.id?'selected':''}>${y.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الموعد النهائي</label>
            <input type="date" id="mg-deadline" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">المهام المطلوبة (Checklist)</label>
          <div id="mg-tasks-container" style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-2);"></div>
          <button class="btn btn-ghost btn-sm" onclick="GoalsModule.addChecklistInput('mg-tasks-container','mg-task-input')">+ إضافة مهمة</button>
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات</label>
          <textarea id="mg-notes" class="form-control" rows="2" placeholder="ملاحظات..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="GoalsModule.saveMonthlyGoal()">💾 حفظ</button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
    this.addChecklistInput('mg-tasks-container', 'mg-task-input');
    if (window.lucide) lucide.createIcons();
  },

  addChecklistInput(containerId, className) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;gap:var(--space-2);align-items:center;';
    div.innerHTML = `
      <input type="text" class="form-control ${className}" placeholder="مهمة مطلوبة..." style="flex:1;">
      <button class="btn btn-danger btn-icon btn-sm" onclick="this.parentElement.remove()"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
    `;
    container.appendChild(div);
    if (window.lucide) lucide.createIcons();
  },

  saveMonthlyGoal() {
    const title       = document.getElementById('mg-title')?.value?.trim();
    const yearlyGoalId = document.getElementById('mg-yearly')?.value;
    if (!title) { Toast.show('يرجى إدخال العنوان', 'error'); return; }

    const tasks = [...document.querySelectorAll('.mg-task-input')]
      .map(inp => ({ id: generateId(), text: inp.value.trim(), done: false }))
      .filter(t => t.text);

    const monthly = DB.getMonthlyGoals();
    monthly.push({
      id: generateId(),
      title,
      yearlyGoalId:  yearlyGoalId || '',
      deadline:      document.getElementById('mg-deadline')?.value || '',
      notes:         document.getElementById('mg-notes')?.value?.trim() || '',
      progress:      0,
      status:        'active',
      tasks,
      createdAt:     new Date().toISOString(),
    });
    DB.saveMonthlyGoals(monthly);
    closeTopModal();
    Toast.show('تم حفظ الهدف الشهري! 📅', 'success');
    this.setTab('monthly');
  },

  openMonthlyDetail(id) {
    const monthly = DB.getMonthlyGoals();
    const m = monthly.find(x => x.id === id);
    if (!m) return;

    const yGoal  = DB.getYearlyGoals().find(y => y.id === m.yearlyGoalId);
    const weekly = DB.getWeeklyGoals().filter(w => w.monthlyGoalId === id);

    const content = `
      <div class="modal-header">
        <div>
          <span class="badge badge-blue">📅 هدف شهري</span>
          <h3 class="modal-title" style="margin-top:6px;">${m.title}</h3>
        </div>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn-secondary btn-sm" onclick="GoalsModule.openEditMonthlyGoal('${m.id}')">تعديل</button>
          <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
      </div>
      <div class="modal-body">
        ${yGoal ? `
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:var(--space-3);padding:var(--space-2);background:rgba(124,58,237,0.06);border-radius:var(--radius-sm);">
            🏆 مرتبط بالهدف السنوي: <strong style="color:var(--accent-purple);">${yGoal.title}</strong>
          </div>
        ` : ''}

        <!-- Progress -->
        <div style="margin-bottom:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
            <span style="font-size:var(--font-size-sm);font-weight:700;">التقدم</span>
            <span style="font-size:var(--font-size-lg);font-weight:800;color:var(--accent-blue);">${toArabicNumerals(m.progress||0)}٪</span>
          </div>
          <div class="progress-bar" style="height:10px;border-radius:99px;">
            <div class="progress-fill" style="width:${m.progress||0}%;background:linear-gradient(90deg,var(--accent-blue),var(--accent-emerald));border-radius:99px;"></div>
          </div>
        </div>

        <!-- Checklist -->
        <div style="margin-bottom:var(--space-4);">
          <h4 style="font-size:var(--font-size-sm);font-weight:700;margin-bottom:var(--space-3);">✅ قائمة المهام</h4>
          ${(m.tasks || []).length === 0 ? '<p style="color:var(--text-muted);font-size:var(--font-size-xs);">لا توجد مهام</p>' : `
            <div style="display:flex;flex-direction:column;gap:var(--space-2);">
              ${(m.tasks || []).map(t => `
                <label class="checkbox-wrapper" style="cursor:pointer;">
                  <input type="checkbox" ${t.done?'checked':''} onchange="GoalsModule.toggleMonthlyTask('${m.id}','${t.id}')">
                  <div class="custom-checkbox"></div>
                  <span style="${t.done?'text-decoration:line-through;color:var(--text-muted);':'color:var(--text-primary);'}font-size:var(--font-size-sm);">${t.text}</span>
                </label>
              `).join('')}
            </div>
          `}
        </div>

        ${m.notes ? `
          <div style="margin-bottom:var(--space-4);">
            <h4 style="font-size:var(--font-size-sm);font-weight:700;margin-bottom:var(--space-2);">📝 ملاحظات</h4>
            <p style="font-size:var(--font-size-sm);color:var(--text-secondary);">${m.notes}</p>
          </div>
        ` : ''}

        <!-- Connected Weekly Goals -->
        <div style="border-top:1px solid var(--border);padding-top:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);">
            <h4 style="font-size:var(--font-size-sm);font-weight:700;">📆 الأهداف الأسبوعية المرتبطة</h4>
            <button class="btn btn-ghost btn-sm" onclick="closeTopModal();GoalsModule.openAddWeeklyGoal('${m.id}')">+ أسبوعي</button>
          </div>
          ${weekly.length === 0 ? `<p style="font-size:var(--font-size-xs);color:var(--text-muted);">لا توجد أهداف أسبوعية بعد</p>` : `
            <div style="display:flex;flex-direction:column;gap:var(--space-2);">
              ${weekly.map(w => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-sm);">
                  <span style="font-size:var(--font-size-sm);color:var(--text-primary);">${w.title}</span>
                  <span class="badge ${w.status==='completed'?'badge-green':'badge-blue'}">${toArabicNumerals(w.progress||0)}٪</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-danger btn-sm" onclick="GoalsModule.deleteMonthlyGoal('${m.id}')">حذف</button>
        <button class="btn btn-secondary" onclick="closeTopModal()">إغلاق</button>
        ${m.status !== 'completed' ? `<button class="btn btn-success" onclick="GoalsModule.completeMonthlyGoal('${m.id}')">🎉 إكمال</button>` : ''}
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
  },

  toggleMonthlyTask(monthlyId, taskId) {
    const monthly = DB.getMonthlyGoals();
    const m = monthly.find(x => x.id === monthlyId);
    if (!m) return;
    const t = m.tasks.find(x => x.id === taskId);
    if (t) {
      t.done = !t.done;
      const done = m.tasks.filter(x => x.done).length;
      m.progress = m.tasks.length ? Math.round((done / m.tasks.length) * 100) : 0;
      if (m.progress === 100) m.status = 'completed';
      DB.saveMonthlyGoals(monthly);
      // Sync yearly progress
      this.syncYearlyProgress(m.yearlyGoalId);
      Toast.show(t.done ? '✅ تم!' : 'تم التحديث', 'success');
      closeTopModal();
      this.openMonthlyDetail(monthlyId);
    }
  },

  completeMonthlyGoal(id) {
    const monthly = DB.getMonthlyGoals();
    const m = monthly.find(x => x.id === id);
    if (m) {
      m.status = 'completed'; m.progress = 100;
      m.completedAt = new Date().toISOString();
      if (m.tasks) m.tasks.forEach(t => t.done = true);
      DB.saveMonthlyGoals(monthly);
      this.syncYearlyProgress(m.yearlyGoalId);
      closeTopModal();
      Toast.show('🎉 مبروك إكمال الهدف الشهري!', 'success');
      this.setTab('monthly');
    }
  },

  deleteMonthlyGoal(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    let monthly = DB.getMonthlyGoals();
    const m = monthly.find(x => x.id === id);
    const yid = m ? m.yearlyGoalId : null;
    monthly = monthly.filter(x => x.id !== id);
    DB.saveMonthlyGoals(monthly);
    if (yid) this.syncYearlyProgress(yid);
    closeTopModal();
    Toast.show('تم حذف الهدف الشهري', 'info');
    this.setTab('monthly');
  },

  openEditMonthlyGoal(id) {
    closeTopModal();
    const monthly = DB.getMonthlyGoals();
    const m = monthly.find(x => x.id === id);
    if (!m) return;
    const yearly = DB.getYearlyGoals();
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تعديل الهدف الشهري</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">العنوان</label>
          <input type="text" id="emg-title" class="form-control" value="${m.title}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">الهدف السنوي</label>
            <select id="emg-yearly" class="form-control">
              <option value="">-- بلا ربط --</option>
              ${yearly.map(y => `<option value="${y.id}" ${y.id===m.yearlyGoalId?'selected':''}>${y.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الموعد النهائي</label>
            <input type="date" id="emg-deadline" class="form-control" value="${m.deadline || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات</label>
          <textarea id="emg-notes" class="form-control" rows="2">${m.notes || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">التقدم اليدوي</label>
          <input type="range" id="emg-progress" min="0" max="100" value="${m.progress||0}" oninput="document.getElementById('emg-pval').textContent=this.value+'٪'">
          <div id="emg-pval" style="text-align:center;font-weight:700;color:var(--accent-blue);">${toArabicNumerals(m.progress||0)}٪</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="GoalsModule.updateMonthlyGoal('${m.id}')">حفظ</button>
      </div>
    `;
    openModal(content);
  },

  updateMonthlyGoal(id) {
    const title = document.getElementById('emg-title')?.value?.trim();
    if (!title) { Toast.show('يرجى إدخال العنوان', 'error'); return; }
    const monthly = DB.getMonthlyGoals();
    const m = monthly.find(x => x.id === id);
    if (m) {
      m.title        = title;
      m.yearlyGoalId = document.getElementById('emg-yearly')?.value || '';
      m.deadline     = document.getElementById('emg-deadline')?.value || '';
      m.notes        = document.getElementById('emg-notes')?.value?.trim() || '';
      m.progress     = parseInt(document.getElementById('emg-progress')?.value || '0');
      DB.saveMonthlyGoals(monthly);
      this.syncYearlyProgress(m.yearlyGoalId);
      closeTopModal();
      Toast.show('تم التعديل بنجاح!', 'success');
      this.setTab('monthly');
    }
  },

  // Auto-sync: update yearly goal progress based on connected monthly goals
  syncYearlyProgress(yearlyGoalId) {
    if (!yearlyGoalId) return;
    const yearly  = DB.getYearlyGoals();
    const yg      = yearly.find(x => x.id === yearlyGoalId);
    if (!yg) return;

    const relatedMonthly = DB.getMonthlyGoals().filter(m => m.yearlyGoalId === yearlyGoalId);
    if (relatedMonthly.length > 0) {
      const avgProgress = relatedMonthly.reduce((sum, m) => sum + (m.progress || 0), 0) / relatedMonthly.length;
      yg.progress = Math.round(avgProgress);
      if (yg.progress === 100) yg.status = 'completed';
    }
    DB.saveYearlyGoals(yearly);
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 3: WEEKLY GOALS
  // ═══════════════════════════════════════════════════════
  renderWeeklyGoals() {
    const weekly  = DB.getWeeklyGoals();
    const monthly = DB.getMonthlyGoals();
    const daily   = DB.getDailyGoals();

    if (weekly.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="calendar-days" style="width:40px;height:40px;"></i></div>
          <h3>لا توجد أهداف أسبوعية بعد</h3>
          <p>الأهداف الأسبوعية تقسّم هدفك الشهري إلى أجزاء قابلة للإنجاز خلال أسبوع واحد.</p>
          <button class="btn btn-primary" onclick="GoalsModule.openAddWeeklyGoal()">أضف هدفاً أسبوعياً</button>
        </div>
      `;
    }

    // Group by monthly goal
    const grouped = {};
    weekly.forEach(w => {
      const key = w.monthlyGoalId || 'none';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(w);
    });

    return `
      <div style="display:flex;flex-direction:column;gap:var(--space-6);">
        ${Object.entries(grouped).map(([mid, goals]) => {
          const mGoal = monthly.find(m => m.id === mid);
          return `
            <div>
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);padding:var(--space-3);background:rgba(16,185,129,0.06);border-radius:var(--radius-md);border-right:3px solid var(--accent-emerald);">
                <i data-lucide="calendar" style="width:16px;height:16px;color:var(--accent-emerald);"></i>
                <span style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">
                  ${mGoal ? mGoal.title : 'أهداف غير مرتبطة'}
                </span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--space-4);">
                ${goals.map(w => this.renderWeeklyCard(w, daily)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderWeeklyCard(w, daily) {
    const tasks     = w.tasks || [];
    const doneTasks = tasks.filter(t => t.done).length;
    const relDailyCount = daily.filter(d => d.weeklyGoalId === w.id).length;
    const isCompleted   = w.status === 'completed';

    return `
      <div class="card animate-fade-in" style="cursor:pointer;${isCompleted ? 'opacity:0.75;' : ''}border-top:3px solid var(--accent-emerald);" onclick="GoalsModule.openWeeklyDetail('${w.id}')">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
          <span class="badge" style="background:rgba(16,185,129,0.1);color:var(--accent-emerald);font-size:10px;">📆 أسبوعي</span>
          <span class="badge ${isCompleted ? 'badge-green' : 'badge-gray'}" style="font-size:10px;">${isCompleted ? '✅ مكتمل' : '🔥 نشط'}</span>
        </div>
        <h3 style="font-size:var(--font-size-sm);font-weight:800;color:var(--text-primary);margin-bottom:var(--space-2);">${w.title}</h3>
        ${w.deadline ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:var(--space-3);">📅 ${formatDateAr(new Date(w.deadline),'short')}</div>` : ''}

        <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
          <div class="progress-bar" style="flex:1;height:6px;">
            <div class="progress-fill" style="width:${w.progress || 0}%;background:linear-gradient(90deg,var(--accent-emerald),var(--accent-blue));"></div>
          </div>
          <span style="font-size:12px;font-weight:700;color:var(--accent-emerald);">${toArabicNumerals(w.progress || 0)}٪</span>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
          <div style="text-align:center;padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-sm);">
            <div style="font-size:11px;font-weight:700;">${toArabicNumerals(doneTasks)}/${toArabicNumerals(tasks.length)}</div>
            <div style="font-size:10px;color:var(--text-muted);">مهام</div>
          </div>
          <div style="text-align:center;padding:var(--space-2);background:var(--bg-secondary);border-radius:var(--radius-sm);">
            <div style="font-size:11px;font-weight:700;">${toArabicNumerals(relDailyCount)}</div>
            <div style="font-size:10px;color:var(--text-muted);">أهداف يومية</div>
          </div>
        </div>
      </div>
    `;
  },

  openAddWeeklyGoal(prefilledMonthlyId) {
    const monthly = DB.getMonthlyGoals();
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">📆 هدف أسبوعي جديد</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">عنوان الهدف الأسبوعي</label>
          <input type="text" id="wg-title" class="form-control" placeholder="مثال: مراجعة مفاهيم OSPF وإنهاء الفصل الثالث" autofocus>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">مرتبط بالهدف الشهري</label>
            <select id="wg-monthly" class="form-control">
              <option value="">-- اختر الهدف الشهري --</option>
              ${monthly.map(m => `<option value="${m.id}" ${prefilledMonthlyId===m.id?'selected':''}>${m.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الموعد النهائي</label>
            <input type="date" id="wg-deadline" class="form-control">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">قائمة المهام الأسبوعية</label>
          <div id="wg-tasks-container" style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-2);"></div>
          <button class="btn btn-ghost btn-sm" onclick="GoalsModule.addChecklistInput('wg-tasks-container','wg-task-input')">+ إضافة مهمة</button>
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات</label>
          <textarea id="wg-notes" class="form-control" rows="2" placeholder="ملاحظات..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="GoalsModule.saveWeeklyGoal()">💾 حفظ</button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
    this.addChecklistInput('wg-tasks-container', 'wg-task-input');
    if (window.lucide) lucide.createIcons();
  },

  saveWeeklyGoal() {
    const title = document.getElementById('wg-title')?.value?.trim();
    if (!title) { Toast.show('يرجى إدخال العنوان', 'error'); return; }

    const tasks = [...document.querySelectorAll('.wg-task-input')]
      .map(inp => ({ id: generateId(), text: inp.value.trim(), done: false }))
      .filter(t => t.text);

    const weekly = DB.getWeeklyGoals();
    weekly.push({
      id: generateId(),
      title,
      monthlyGoalId: document.getElementById('wg-monthly')?.value || '',
      deadline:      document.getElementById('wg-deadline')?.value || '',
      notes:         document.getElementById('wg-notes')?.value?.trim() || '',
      progress:      0,
      status:        'active',
      tasks,
      createdAt:     new Date().toISOString(),
    });
    DB.saveWeeklyGoals(weekly);
    closeTopModal();
    Toast.show('تم حفظ الهدف الأسبوعي! 📆', 'success');
    this.setTab('weekly');
  },

  openWeeklyDetail(id) {
    const weekly  = DB.getWeeklyGoals();
    const w       = weekly.find(x => x.id === id);
    if (!w) return;
    const mGoal   = DB.getMonthlyGoals().find(m => m.id === w.monthlyGoalId);

    const content = `
      <div class="modal-header">
        <div>
          <span class="badge" style="background:rgba(16,185,129,0.1);color:var(--accent-emerald);">📆 أسبوعي</span>
          <h3 class="modal-title" style="margin-top:6px;">${w.title}</h3>
        </div>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn-secondary btn-sm" onclick="GoalsModule.openEditWeeklyGoal('${w.id}')">تعديل</button>
          <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
        </div>
      </div>
      <div class="modal-body">
        ${mGoal ? `
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:var(--space-3);padding:var(--space-2);background:rgba(16,185,129,0.06);border-radius:var(--radius-sm);">
            📅 مرتبط بالهدف الشهري: <strong style="color:var(--accent-emerald);">${mGoal.title}</strong>
          </div>
        ` : ''}

        <!-- Progress -->
        <div style="margin-bottom:var(--space-4);">
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2);">
            <span style="font-size:var(--font-size-sm);font-weight:700;">التقدم</span>
            <span style="font-size:var(--font-size-lg);font-weight:800;color:var(--accent-emerald);">${toArabicNumerals(w.progress||0)}٪</span>
          </div>
          <div class="progress-bar" style="height:10px;border-radius:99px;">
            <div class="progress-fill" style="width:${w.progress||0}%;background:linear-gradient(90deg,var(--accent-emerald),var(--accent-blue));border-radius:99px;"></div>
          </div>
        </div>

        <!-- Checklist -->
        <div style="margin-bottom:var(--space-4);">
          <h4 style="font-size:var(--font-size-sm);font-weight:700;margin-bottom:var(--space-3);">✅ قائمة المهام</h4>
          ${(w.tasks || []).length === 0 ? '<p style="color:var(--text-muted);font-size:var(--font-size-xs);">لا توجد مهام</p>' : `
            <div style="display:flex;flex-direction:column;gap:var(--space-2);">
              ${(w.tasks || []).map(t => `
                <label class="checkbox-wrapper" style="cursor:pointer;">
                  <input type="checkbox" ${t.done?'checked':''} onchange="GoalsModule.toggleWeeklyTask('${w.id}','${t.id}')">
                  <div class="custom-checkbox"></div>
                  <span style="${t.done?'text-decoration:line-through;color:var(--text-muted);':'color:var(--text-primary);'}font-size:var(--font-size-sm);">${t.text}</span>
                </label>
              `).join('')}
            </div>
          `}
        </div>

        ${w.notes ? `
          <div>
            <h4 style="font-size:var(--font-size-sm);font-weight:700;margin-bottom:var(--space-2);">📝 ملاحظات</h4>
            <p style="font-size:var(--font-size-sm);color:var(--text-secondary);">${w.notes}</p>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-danger btn-sm" onclick="GoalsModule.deleteWeeklyGoal('${w.id}')">حذف</button>
        <button class="btn btn-secondary" onclick="closeTopModal()">إغلاق</button>
        ${w.status !== 'completed' ? `<button class="btn btn-success" onclick="GoalsModule.completeWeeklyGoal('${w.id}')">🎉 إكمال</button>` : ''}
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
  },

  toggleWeeklyTask(weeklyId, taskId) {
    const weekly = DB.getWeeklyGoals();
    const w = weekly.find(x => x.id === weeklyId);
    if (!w) return;
    const t = w.tasks.find(x => x.id === taskId);
    if (t) {
      t.done = !t.done;
      const done = w.tasks.filter(x => x.done).length;
      w.progress = w.tasks.length ? Math.round((done / w.tasks.length) * 100) : 0;
      if (w.progress === 100) w.status = 'completed';
      DB.saveWeeklyGoals(weekly);
      // Sync monthly
      this.syncMonthlyProgress(w.monthlyGoalId);
      Toast.show(t.done ? '✅ تم!' : 'تم التحديث', 'success');
      closeTopModal();
      this.openWeeklyDetail(weeklyId);
    }
  },

  completeWeeklyGoal(id) {
    const weekly = DB.getWeeklyGoals();
    const w = weekly.find(x => x.id === id);
    if (w) {
      w.status = 'completed'; w.progress = 100;
      w.completedAt = new Date().toISOString();
      if (w.tasks) w.tasks.forEach(t => t.done = true);
      DB.saveWeeklyGoals(weekly);
      this.syncMonthlyProgress(w.monthlyGoalId);
      closeTopModal();
      Toast.show('🎉 مبروك إكمال الهدف الأسبوعي!', 'success');
      this.setTab('weekly');
    }
  },

  deleteWeeklyGoal(id) {
    if (!confirm('هل أنت متأكد؟')) return;
    let weekly = DB.getWeeklyGoals();
    const w = weekly.find(x => x.id === id);
    const mid = w ? w.monthlyGoalId : null;
    weekly = weekly.filter(x => x.id !== id);
    DB.saveWeeklyGoals(weekly);
    if (mid) this.syncMonthlyProgress(mid);
    closeTopModal();
    Toast.show('تم حذف الهدف الأسبوعي', 'info');
    this.setTab('weekly');
  },

  openEditWeeklyGoal(id) {
    closeTopModal();
    const weekly  = DB.getWeeklyGoals();
    const w       = weekly.find(x => x.id === id);
    if (!w) return;
    const monthly = DB.getMonthlyGoals();
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تعديل الهدف الأسبوعي</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">العنوان</label>
          <input type="text" id="ewg-title" class="form-control" value="${w.title}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">الهدف الشهري</label>
            <select id="ewg-monthly" class="form-control">
              <option value="">-- بلا ربط --</option>
              ${monthly.map(m => `<option value="${m.id}" ${m.id===w.monthlyGoalId?'selected':''}>${m.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الموعد النهائي</label>
            <input type="date" id="ewg-deadline" class="form-control" value="${w.deadline || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">التقدم اليدوي</label>
          <input type="range" id="ewg-progress" min="0" max="100" value="${w.progress||0}" oninput="document.getElementById('ewg-pval').textContent=this.value+'٪'">
          <div id="ewg-pval" style="text-align:center;font-weight:700;color:var(--accent-emerald);">${toArabicNumerals(w.progress||0)}٪</div>
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات</label>
          <textarea id="ewg-notes" class="form-control" rows="2">${w.notes || ''}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="GoalsModule.updateWeeklyGoal('${w.id}')">حفظ</button>
      </div>
    `;
    openModal(content);
  },

  updateWeeklyGoal(id) {
    const title = document.getElementById('ewg-title')?.value?.trim();
    if (!title) { Toast.show('يرجى إدخال العنوان', 'error'); return; }
    const weekly = DB.getWeeklyGoals();
    const w = weekly.find(x => x.id === id);
    if (w) {
      w.title         = title;
      w.monthlyGoalId = document.getElementById('ewg-monthly')?.value || '';
      w.deadline      = document.getElementById('ewg-deadline')?.value || '';
      w.notes         = document.getElementById('ewg-notes')?.value?.trim() || '';
      w.progress      = parseInt(document.getElementById('ewg-progress')?.value || '0');
      DB.saveWeeklyGoals(weekly);
      this.syncMonthlyProgress(w.monthlyGoalId);
      closeTopModal();
      Toast.show('تم التعديل!', 'success');
      this.setTab('weekly');
    }
  },

  // Sync monthly progress from weekly goals
  syncMonthlyProgress(monthlyGoalId) {
    if (!monthlyGoalId) return;
    const monthly = DB.getMonthlyGoals();
    const m = monthly.find(x => x.id === monthlyGoalId);
    if (!m) return;

    const relatedWeekly = DB.getWeeklyGoals().filter(w => w.monthlyGoalId === monthlyGoalId);
    if (relatedWeekly.length > 0) {
      const avg = relatedWeekly.reduce((sum, w) => sum + (w.progress || 0), 0) / relatedWeekly.length;
      // Blend with task-based progress if tasks exist
      if (m.tasks && m.tasks.length > 0) {
        const taskProgress = Math.round((m.tasks.filter(t => t.done).length / m.tasks.length) * 100);
        m.progress = Math.round((avg + taskProgress) / 2);
      } else {
        m.progress = Math.round(avg);
      }
      if (m.progress === 100) m.status = 'completed';
      DB.saveMonthlyGoals(monthly);
      this.syncYearlyProgress(m.yearlyGoalId);
    }
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 4: DAILY GOALS
  // ═══════════════════════════════════════════════════════
  renderDailyGoals() {
    const today = todayKey();
    const daily  = DB.getDailyGoals().filter(d => d.date === today);
    const weekly = DB.getWeeklyGoals();

    const medals = ['🥇', '🥈', '🥉'];

    return `
      <div style="max-width:800px;margin:0 auto;">
        <!-- Daily Goals Header -->
        <div style="text-align:center;margin-bottom:var(--space-6);">
          <div style="font-size:var(--font-size-xs);font-weight:700;color:var(--accent-amber);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:var(--space-2);">أهداف اليوم المركّزة</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);">حدد أهم ٣ إنجازات تريد تحقيقها اليوم فقط — اجعلها واقعية وقابلة للقياس</div>
        </div>

        ${daily.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="star" style="width:40px;height:40px;"></i></div>
            <h3>لا توجد أهداف لليوم بعد</h3>
            <p>ما هي أهم ٣ إنجازات تريد تحقيقها اليوم؟<br>تأكد من ربطها بأهدافك الأسبوعية.</p>
            <button class="btn btn-primary" onclick="GoalsModule.openAddDailyGoal()">+ أضف هدف اليوم الأول</button>
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:var(--space-4);margin-bottom:var(--space-6);">
            ${daily.slice(0, 3).map((d, i) => {
              const relWeekly = weekly.find(w => w.id === d.weeklyGoalId);
              return `
                <div style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);background:var(--bg-card);border:2px solid ${d.completed ? 'var(--color-success)' : 'var(--border)'};border-radius:var(--radius-xl);transition:all 0.3s ease;${d.completed ? 'opacity:0.8;' : ''}cursor:pointer;" class="animate-fade-in" onclick="GoalsModule.toggleDailyGoal('${d.id}')">
                  <div style="font-size:40px;flex-shrink:0;">${medals[i] || '⭐'}</div>
                  <div style="flex:1;">
                    <div style="font-size:var(--font-size-sm);font-weight:800;color:var(--text-primary);${d.completed ? 'text-decoration:line-through;color:var(--text-muted);' : ''}margin-bottom:4px;">${d.title}</div>
                    ${relWeekly ? `<div style="font-size:11px;color:var(--text-muted);">🔗 ${relWeekly.title}</div>` : ''}
                    ${d.estimatedTime ? `<div style="font-size:11px;color:var(--accent-blue);margin-top:4px;">⏱️ ${d.estimatedTime}</div>` : ''}
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--space-2);">
                    ${d.completed ? `<span style="font-size:24px;">✅</span>` : `<div style="width:24px;height:24px;border:2px solid var(--border);border-radius:50%;"></div>`}
                    <button class="btn btn-ghost btn-icon btn-sm" onclick="event.stopPropagation();GoalsModule.deleteDailyGoal('${d.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          ${daily.length < 3 ? `
            <div style="text-align:center;margin-bottom:var(--space-6);">
              <button class="btn btn-ghost" onclick="GoalsModule.openAddDailyGoal()">
                + إضافة هدف يومي (${toArabicNumerals(3 - daily.length)} متبقية)
              </button>
            </div>
          ` : `
            <div style="text-align:center;padding:var(--space-3);background:rgba(245,158,11,0.08);border-radius:var(--radius-md);border:1px solid rgba(245,158,11,0.2);margin-bottom:var(--space-6);">
              <span style="font-size:var(--font-size-xs);color:var(--accent-amber);">🏆 لقد حددت أهم ٣ أهداف لليوم — ركّز عليها ولا تشتت!</span>
            </div>
          `}

          <!-- Daily summary stats -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);">
            <div style="text-align:center;padding:var(--space-4);background:var(--bg-secondary);border-radius:var(--radius-lg);">
              <div style="font-size:28px;margin-bottom:4px;">📋</div>
              <div style="font-size:var(--font-size-lg);font-weight:800;color:var(--text-primary);">${toArabicNumerals(daily.length)}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">أهداف اليوم</div>
            </div>
            <div style="text-align:center;padding:var(--space-4);background:var(--bg-secondary);border-radius:var(--radius-lg);">
              <div style="font-size:28px;margin-bottom:4px;">✅</div>
              <div style="font-size:var(--font-size-lg);font-weight:800;color:var(--color-success);">${toArabicNumerals(daily.filter(d => d.completed).length)}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">مكتملة</div>
            </div>
            <div style="text-align:center;padding:var(--space-4);background:var(--bg-secondary);border-radius:var(--radius-lg);">
              <div style="font-size:28px;margin-bottom:4px;">📊</div>
              <div style="font-size:var(--font-size-lg);font-weight:800;color:var(--accent-amber);">
                ${daily.length > 0 ? toArabicNumerals(Math.round((daily.filter(d => d.completed).length / daily.length) * 100)) : '٠'}٪
              </div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">نسبة الإنجاز</div>
            </div>
          </div>
        `}
      </div>
    `;
  },

  openAddDailyGoal() {
    const today  = todayKey();
    const daily  = DB.getDailyGoals().filter(d => d.date === today);

    if (daily.length >= 3) {
      Toast.show('لقد وصلت إلى الحد الأقصى وهو ٣ أهداف يومية. ركّز على ما لديك!', 'warning');
      return;
    }

    const weekly = DB.getWeeklyGoals();

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">⭐ هدف يومي جديد ${['🥇','🥈','🥉'][daily.length] || ''}</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div style="text-align:center;margin-bottom:var(--space-4);padding:var(--space-3);background:rgba(245,158,11,0.08);border-radius:var(--radius-md);">
          <span style="font-size:var(--font-size-xs);color:var(--accent-amber);">أهداف اليوم يجب أن تكون محدودة (٣ كحد أقصى) ومرتبطة بأهدافك الأسبوعية</span>
        </div>
        <div class="form-group">
          <label class="form-label required">ما هو هدفك الأكثر أهمية اليوم؟</label>
          <input type="text" id="dg-title" class="form-control" placeholder="مثال: دراسة ساعتين CCNA أو ركض ٥ كم" autofocus>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">مرتبط بالهدف الأسبوعي</label>
            <select id="dg-weekly" class="form-control">
              <option value="">-- اختر الهدف الأسبوعي (اختياري) --</option>
              ${weekly.filter(w => w.status === 'active').map(w => `<option value="${w.id}">${w.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الوقت المقدر</label>
            <input type="text" id="dg-time" class="form-control" placeholder="مثال: ساعتان">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات</label>
          <textarea id="dg-notes" class="form-control" rows="2" placeholder="تفاصيل إضافية..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="GoalsModule.saveDailyGoal()">💾 إضافة لليوم</button>
      </div>
    `;
    openModal(content);
    if (window.lucide) lucide.createIcons();
  },

  saveDailyGoal() {
    const title = document.getElementById('dg-title')?.value?.trim();
    if (!title) { Toast.show('يرجى إدخال هدف اليوم', 'error'); return; }

    const daily = DB.getDailyGoals();
    const today = todayKey();
    const todayGoals = daily.filter(d => d.date === today);

    if (todayGoals.length >= 3) {
      Toast.show('الحد الأقصى ٣ أهداف يومية', 'warning');
      return;
    }

    daily.push({
      id:           generateId(),
      title,
      weeklyGoalId: document.getElementById('dg-weekly')?.value || '',
      estimatedTime:document.getElementById('dg-time')?.value?.trim() || '',
      notes:        document.getElementById('dg-notes')?.value?.trim() || '',
      date:         today,
      completed:    false,
      createdAt:    new Date().toISOString(),
    });
    DB.saveDailyGoals(daily);
    closeTopModal();
    Toast.show('تم حفظ هدف اليوم! ⭐', 'success');
    this.setTab('daily');
  },

  toggleDailyGoal(id) {
    const daily = DB.getDailyGoals();
    const d = daily.find(x => x.id === id);
    if (d) {
      d.completed = !d.completed;
      if (d.completed) d.completedAt = new Date().toISOString();
      DB.saveDailyGoals(daily);
      // Sync weekly if linked
      if (d.weeklyGoalId) this.syncWeeklyDailyProgress(d.weeklyGoalId);
      Toast.show(d.completed ? '🎉 رائع! أنجزت هدف اليوم!' : 'تم التحديث', 'success');
      this.setTab('daily');
    }
  },

  deleteDailyGoal(id) {
    if (!confirm('حذف هذا الهدف اليومي؟')) return;
    let daily = DB.getDailyGoals();
    daily = daily.filter(x => x.id !== id);
    DB.saveDailyGoals(daily);
    Toast.show('تم الحذف', 'info');
    this.setTab('daily');
  },

  // Sync weekly progress from completed daily goals
  syncWeeklyDailyProgress(weeklyGoalId) {
    if (!weeklyGoalId) return;
    const weekly = DB.getWeeklyGoals();
    const w = weekly.find(x => x.id === weeklyGoalId);
    if (!w) return;

    const relatedDaily = DB.getDailyGoals().filter(d => d.weeklyGoalId === weeklyGoalId);
    if (relatedDaily.length > 0) {
      const done = relatedDaily.filter(d => d.completed).length;
      const dailyContrib = Math.round((done / relatedDaily.length) * 50); // daily goals contribute up to 50%

      // Blend with task-based progress
      const taskProgress = w.tasks && w.tasks.length > 0
        ? Math.round((w.tasks.filter(t => t.done).length / w.tasks.length) * 50)
        : 0;

      w.progress = Math.min(100, dailyContrib + taskProgress);
      if (w.progress === 100) w.status = 'completed';
      DB.saveWeeklyGoals(weekly);
      this.syncMonthlyProgress(w.monthlyGoalId);
    }
  },

  // ═══════════════════════════════════════════════════════
  // LATEST GOALS WIDGET
  // ═══════════════════════════════════════════════════════
  renderLatestGoals() {
    const yearly  = DB.getYearlyGoals().map(g => ({...g, type:'yearly',  typeLabel:'سنوي',  typeColor:'var(--accent-purple)', typeBadge:'badge-purple'}));
    const monthly = DB.getMonthlyGoals().map(g => ({...g, type:'monthly', typeLabel:'شهري',  typeColor:'var(--accent-blue)',   typeBadge:'badge-blue'}));
    const weekly  = DB.getWeeklyGoals().map(g => ({...g, type:'weekly',  typeLabel:'أسبوعي', typeColor:'var(--accent-emerald)', typeBadge:''}));
    const daily   = DB.getDailyGoals().map(g => ({...g, type:'daily',   typeLabel:'يومي',  typeColor:'var(--accent-amber)',  typeBadge:''}));

    const all = [...yearly, ...monthly, ...weekly, ...daily]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    if (all.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="bell" style="width:40px;height:40px;"></i></div>
          <h3>لا توجد أهداف بعد</h3>
          <p>ابدأ بإضافة هدف سنوي، ثم قسّمه إلى أهداف شهرية وأسبوعية ويومية.</p>
          <button class="btn btn-primary" onclick="GoalsModule.setTab('yearly')">ابدأ بهدف سنوي</button>
        </div>
      `;
    }

    return `
      <div>
        <div style="margin-bottom:var(--space-4);">
          <h3 style="font-size:var(--font-size-md);font-weight:700;color:var(--text-primary);">🔔 آخر ${toArabicNumerals(all.length)} هدف تمت إضافتهم</h3>
          <p style="font-size:var(--font-size-xs);color:var(--text-muted);">جميع المستويات مرتبة من الأحدث للأقدم</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);">
          ${all.map(g => `
            <div class="card animate-fade-in" style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);cursor:pointer;" onclick="GoalsModule.openGoalDetailByType('${g.type}','${g.id}')">
              <div style="width:48px;height:48px;border-radius:var(--radius-lg);background:rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;border:2px solid ${g.typeColor};">
                ${g.type === 'yearly' ? '🏆' : g.type === 'monthly' ? '📅' : g.type === 'weekly' ? '📆' : '⭐'}
              </div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:4px;">
                  <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${g.typeColor}22;color:${g.typeColor};">${g.typeLabel}</span>
                  <span class="badge ${g.status==='completed'?'badge-green':'badge-gray'}" style="font-size:10px;">${g.status==='completed'?'مكتمل':'نشط'}</span>
                </div>
                <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${g.title}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">📅 ${formatDateAr(new Date(g.createdAt), 'short')}</div>
              </div>
              <div style="text-align:center;min-width:60px;">
                <div style="font-size:var(--font-size-md);font-weight:800;color:${g.typeColor};">${toArabicNumerals(g.progress || (g.completed ? 100 : 0))}٪</div>
                <div class="progress-bar" style="height:4px;margin-top:4px;">
                  <div class="progress-fill" style="width:${g.progress || (g.completed ? 100 : 0)}%;background:${g.typeColor};"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  openGoalDetailByType(type, id) {
    switch (type) {
      case 'yearly':  this.openYearlyDetail(id);  break;
      case 'monthly': this.openMonthlyDetail(id); break;
      case 'weekly':  this.openWeeklyDetail(id);  break;
      case 'daily':   /* Just navigate */ this.setTab('daily'); break;
    }
  },

  // ═══════════════════════════════════════════════════════
  // EXTERNAL API: used by dashboard, quick add, etc.
  // ═══════════════════════════════════════════════════════
  openAddGoalModal() {
    this.openAddYearlyGoal();
  },

  // Returns "current active goals" summary for dashboard widget
  getCurrentGoalsSummary() {
    const yearly  = DB.getYearlyGoals().filter(g => g.status === 'active').slice(0, 2);
    const monthly = DB.getMonthlyGoals().filter(g => g.status === 'active').slice(0, 2);
    const weekly  = DB.getWeeklyGoals().filter(g => g.status === 'active').slice(0, 2);
    return { yearly, monthly, weekly };
  },
};
