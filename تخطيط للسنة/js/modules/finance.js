/**
 * LIFE OS — Finance Module
 * Income, Expenses, Savings, Budgeting, Wishlist, Savings Goals, Analytics
 */

const FinanceModule = {
  state: {
    activeTab: 'transactions',
    currency: 'ج.م',
  },

  render(container) {
    const transactions = DB.getTransactions();
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalSavings = transactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + (t.amount || 0), 0);
    const balance = totalIncome - totalExpenses - totalSavings;

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">💰 الإدارة المالية</h1>
            <p class="page-subtitle">تتبع دخلك، مصاريفك، مدخراتك، وأهدافك المالية</p>
          </div>
          <div class="header-actions" id="finance-actions">
            ${this.renderActions()}
          </div>
        </div>

        <!-- Financial Overview Cards -->
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:var(--space-4); margin-bottom:var(--space-6);">
          <div class="finance-balance-card animate-fade-in" style="grid-column: span 1; padding:var(--space-4); border-radius:var(--radius-lg); background:linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.1)); border:1px solid rgba(124,58,237,0.2);">
            <div style="font-size:var(--font-size-xs); color:var(--text-muted); margin-bottom:var(--space-2);">الرصيد المتاح</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--text-primary);">${formatNumber(balance)} <span style="font-size:1rem; font-weight:normal;">${this.state.currency}</span></div>
          </div>
          <div class="stat-card animate-fade-in delay-1" style="border-right: 4px solid var(--color-success); padding:var(--space-3);">
            <div style="font-size:20px; margin-bottom:var(--space-1);">📈</div>
            <div class="stat-card-value" style="color:var(--color-success); font-size:1.4rem;">${formatNumber(totalIncome)} <span style="font-size:0.8rem; font-weight:normal;">${this.state.currency}</span></div>
            <div class="stat-card-label" style="font-size:10px;">إجمالي الدخل</div>
          </div>
          <div class="stat-card animate-fade-in delay-2" style="border-right: 4px solid var(--color-danger); padding:var(--space-3);">
            <div style="font-size:20px; margin-bottom:var(--space-1);">📉</div>
            <div class="stat-card-value" style="color:var(--color-danger); font-size:1.4rem;">${formatNumber(totalExpenses)} <span style="font-size:0.8rem; font-weight:normal;">${this.state.currency}</span></div>
            <div class="stat-card-label" style="font-size:10px;">إجمالي المصاريف</div>
          </div>
          <div class="stat-card animate-fade-in delay-3" style="border-right: 4px solid var(--accent-blue); padding:var(--space-3);">
            <div style="font-size:20px; margin-bottom:var(--space-1);">🏦</div>
            <div class="stat-card-value" style="color:var(--accent-blue); font-size:1.4rem;">${formatNumber(totalSavings)} <span style="font-size:0.8rem; font-weight:normal;">${this.state.currency}</span></div>
            <div class="stat-card-label" style="font-size:10px;">إجمالي المدخرات</div>
          </div>
        </div>

        <!-- View Tabs -->
        <div class="tabs" style="margin-bottom:var(--space-6); max-width:800px;">
          <div class="tab-item ${this.state.activeTab === 'transactions' ? 'active' : ''}" onclick="FinanceModule.setTab('transactions')">المعاملات المالية</div>
          <div class="tab-item ${this.state.activeTab === 'analytics' ? 'active' : ''}" onclick="FinanceModule.setTab('analytics')">التحليلات والرؤى</div>
          <div class="tab-item ${this.state.activeTab === 'budget' ? 'active' : ''}" onclick="FinanceModule.setTab('budget')">الميزانية الشهرية</div>
          <div class="tab-item ${this.state.activeTab === 'savings' ? 'active' : ''}" onclick="FinanceModule.setTab('savings')">أهداف الادخار</div>
          <div class="tab-item ${this.state.activeTab === 'wishlist' ? 'active' : ''}" onclick="FinanceModule.setTab('wishlist')">قائمة الرغبات</div>
        </div>

        <div id="finance-content-area">
          ${this.renderTabContent()}
        </div>
      </div>
    `;
    
    if (this.state.activeTab === 'analytics') {
      setTimeout(() => this.initAnalyticsCharts(), 100);
    }
    
    if (window.lucide) lucide.createIcons();
  },

  setTab(tab) {
    this.state.activeTab = tab;
    document.querySelectorAll('.tab-item').forEach((el, i) => {
      const tabs = ['transactions', 'analytics', 'budget', 'savings', 'wishlist'];
      el.classList.toggle('active', tabs[i] === tab);
    });

    const actions = document.getElementById('finance-actions');
    if (actions) actions.innerHTML = this.renderActions();

    const content = document.getElementById('finance-content-area');
    if (content) {
      content.innerHTML = this.renderTabContent();
      
      if (tab === 'analytics') {
        setTimeout(() => this.initAnalyticsCharts(), 100);
      }
      if (window.lucide) lucide.createIcons();
    }
  },

  renderActions() {
    switch (this.state.activeTab) {
      case 'transactions':
        return `<button class="btn btn-primary" onclick="FinanceModule.openAddTransaction()">+ معاملة جديدة</button>`;
      case 'budget':
        return `<button class="btn btn-primary" onclick="FinanceModule.openSetBudget()">⚙️ ضبط الميزانيات</button>`;
      case 'wishlist':
        return `<button class="btn btn-primary" onclick="FinanceModule.openAddWishlistItem()">+ رغبة جديدة</button>`;
      case 'savings':
        return `<button class="btn btn-primary" onclick="FinanceModule.openAddSavingsGoal()">+ هدف ادخار</button>`;
      default:
        return '';
    }
  },

  renderTabContent() {
    switch (this.state.activeTab) {
      case 'transactions': return this.renderTransactions();
      case 'budget':       return this.renderBudget();
      case 'wishlist':     return this.renderWishlist();
      case 'savings':      return this.renderSavings();
      case 'analytics':    return this.renderAnalytics();
      default:             return this.renderTransactions();
    }
  },

  // ─── TRANSACTIONS TAB ────────────────────────────────────────────────────────
  renderTransactions() {
    const transactions = DB.getTransactions().sort((a,b) => new Date(b.date) - new Date(a.date));
    if (transactions.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="banknote" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد معاملات مالية مسجلة</h3>
          <p>سجّل دخلك ومصاريفك اليومية لتحافظ على انضباطك المالي وتراقب تدفقاتك النقدية.</p>
          <button class="btn btn-primary" onclick="FinanceModule.openAddTransaction()">سجّل أول معاملة</button>
        </div>
      `;
    }

    return `
      <div class="card" style="padding:0; overflow:hidden;">
        <div style="padding:var(--space-4); font-weight:700; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <span>سجل المعاملات الأخيرة</span>
          <span style="font-size:var(--font-size-xs); color:var(--text-muted);">${toArabicNumerals(transactions.length)} معاملة</span>
        </div>
        <div style="display:flex; flex-direction:column; max-height:500px; overflow-y:auto;">
          ${transactions.map(t => {
            let typeIcon = '', typeColor = '', amountPrefix = '';
            if (t.type === 'income') { typeIcon = '📈'; typeColor = 'var(--color-success)'; amountPrefix = '+'; }
            else if (t.type === 'expense') { typeIcon = '📉'; typeColor = 'var(--color-danger)'; amountPrefix = '-'; }
            else if (t.type === 'savings') { typeIcon = '🏦'; typeColor = 'var(--accent-blue)'; amountPrefix = '←'; }
            
            const catInfo = this.getCategoryInfo(t.category);
            
            return `
              <div class="transaction-item" style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-3) var(--space-4); border-bottom:1px solid var(--border-subtle);">
                <div style="display:flex; align-items:center; gap:var(--space-3);">
                  <div style="width:40px;height:40px;border-radius:var(--radius-md);background:${typeColor}15;color:${typeColor};display:flex;align-items:center;justify-content:center;font-size:20px;">
                    ${catInfo.icon}
                  </div>
                  <div>
                    <div style="font-size:var(--font-size-sm); font-weight:700; color:var(--text-primary);">${t.description}</div>
                    <div style="font-size:var(--font-size-xs); color:var(--text-muted);">
                      ${formatDateAr(t.date, 'short')} | ${catInfo.ar}
                      ${t.notes ? ` <span style="opacity:0.6;">· ${t.notes}</span>` : ''}
                    </div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:var(--space-3);">
                  <span style="font-weight:700; color:${typeColor};">${amountPrefix}${formatNumber(t.amount)} ${this.state.currency}</span>
                  <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--color-danger);" onclick="FinanceModule.deleteTransaction('${t.id}')">
                    <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  getCategoryInfo(catId) {
    const categories = [
      { id: 'health', ar: 'الصحة', icon: '💪' },
      { id: 'family', ar: 'العائلة', icon: '👨‍👩‍👧' },
      { id: 'finance', ar: 'التزامات', icon: '💳' },
      { id: 'education', ar: 'تعليم', icon: '📚' },
      { id: 'projects', ar: 'مشاريع', icon: '🚀' },
      { id: 'food', ar: 'طعام ومشروبات', icon: '🍔' },
      { id: 'transport', ar: 'مواصلات', icon: '🚗' },
      { id: 'salary', ar: 'راتب', icon: '💵' },
      { id: 'freelance', ar: 'عمل حر', icon: '💻' },
      { id: 'savings_acc', ar: 'حساب توفير', icon: '🏦' },
      { id: 'other', ar: 'أخرى', icon: '🏷️' }
    ];
    return categories.find(c => c.id === catId) || { id: catId, ar: catId, icon: '🏷️' };
  },

  openAddTransaction() {
    const today = todayKey();
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تسجيل معاملة مالية 💰</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">العنوان (Title)</label>
            <input type="text" id="trans-desc" class="form-control" placeholder="مثال: راتب الشهر، شراء بقالة، تحويل للطوارئ...">
          </div>
          <div class="form-group">
            <label class="form-label required">المبلغ (${this.state.currency})</label>
            <input type="number" id="trans-amount" class="form-control" min="0.1" step="0.01">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">النوع</label>
            <select id="trans-type" class="form-control" onchange="FinanceModule.updateCategoriesDropdown(this.value)">
              <option value="expense">📉 مصروف (Expense)</option>
              <option value="income">📈 دخل (Income)</option>
              <option value="savings">🏦 ادخار (Savings)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label required">التصنيف</label>
            <select id="trans-category" class="form-control"></select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">التاريخ</label>
            <input type="date" id="trans-date" class="form-control" value="${today}">
          </div>
          <div class="form-group">
            <label class="form-label">ملاحظات إضافية (Notes)</label>
            <input type="text" id="trans-notes" class="form-control" placeholder="تفاصيل إضافية...">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="FinanceModule.saveTransaction()">حفظ المعاملة</button>
      </div>
    `;
    openModal(content);
    this.updateCategoriesDropdown('expense');
  },

  updateCategoriesDropdown(type) {
    const dropdown = document.getElementById('trans-category');
    if (!dropdown) return;
    
    let cats = [];
    if (type === 'expense') {
      cats = ['food', 'transport', 'health', 'family', 'finance', 'education', 'other'];
    } else if (type === 'income') {
      cats = ['salary', 'freelance', 'projects', 'other'];
    } else if (type === 'savings') {
      cats = ['savings_acc', 'projects', 'other'];
    }
    
    dropdown.innerHTML = cats.map(cId => {
      const info = this.getCategoryInfo(cId);
      return `<option value="${info.id}">${info.icon} ${info.ar}</option>`;
    }).join('');
  },

  saveTransaction() {
    const desc = document.getElementById('trans-desc')?.value?.trim();
    const amount = parseFloat(document.getElementById('trans-amount')?.value);
    const type = document.getElementById('trans-type')?.value || 'expense';
    const category = document.getElementById('trans-category')?.value || 'other';
    const date = document.getElementById('trans-date')?.value || todayKey();
    const notes = document.getElementById('trans-notes')?.value?.trim() || '';

    if (!desc) { Toast.show('يرجى إدخال عنوان المعاملة', 'error'); return; }
    if (isNaN(amount) || amount <= 0) { Toast.show('يرجى إدخال مبلغ صحيح', 'error'); return; }

    const transactions = DB.getTransactions();
    transactions.push({
      id: generateId(),
      description: desc,
      amount,
      type,
      category,
      date,
      notes,
      createdAt: new Date().toISOString()
    });
    DB.saveTransactions(transactions);
    closeTopModal();
    Toast.show('تم حفظ المعاملة بنجاح! 💸', 'success');
    renderModule('finance');
  },

  deleteTransaction(id) {
    if (!confirm('هل تريد حذف هذه المعاملة؟')) return;
    let transactions = DB.getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    DB.saveTransactions(transactions);
    Toast.show('تم الحذف', 'info');
    renderModule('finance');
  },

  // ─── BUDGET TAB ─────────────────────────────────────────────────────────────
  renderBudget() {
    const budget = DB.getBudget() || {};
    const transactions = DB.getTransactions();
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    
    const monthlyExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthStr));

    const budgetCategories = [
      'food', 'transport', 'health', 'family', 'finance', 'education', 'other'
    ].map(id => this.getCategoryInfo(id));

    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-4);">
        <div class="card">
          <h3 class="card-title">📅 الميزانية لشهر ${formatDateAr(now, 'month-year')}</h3>
          <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-bottom:var(--space-4);">تحديد سقف للمصاريف لتفادي الإنفاق المفرط والالتزام بأهدافك المالية.</p>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4);">
            ${budgetCategories.map(c => {
              const cap = budget[c.id] || 0;
              const actual = monthlyExpenses.filter(t => t.category === c.id).reduce((sum, t) => sum + (t.amount || 0), 0);
              const pct = cap > 0 ? Math.min(100, Math.round((actual / cap) * 100)) : 0;
              const isOver = actual > cap && cap > 0;
              
              return `
                <div style="background:var(--bg-secondary); padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:var(--font-size-sm); margin-bottom:var(--space-2);">
                    <span style="font-weight:700;">${c.icon} ${c.ar}</span>
                    <span style="color:${isOver ? 'var(--color-danger)' : 'var(--text-primary)'}; font-weight:700;">
                      ${formatNumber(actual)} / ${cap > 0 ? formatNumber(cap) : 'غير محدد'} ${this.state.currency}
                    </span>
                  </div>
                  <div class="progress-bar thin">
                    <div class="progress-fill ${isOver ? 'rose' : pct > 80 ? 'amber' : 'green'}" style="width:${pct}%;"></div>
                  </div>
                  ${isOver ? `<div style="font-size:10px; color:var(--color-danger); margin-top:4px;">⚠️ لقد تجاوزت الميزانية!</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  openSetBudget() {
    const budget = DB.getBudget() || {};
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">ضبط الميزانية الشهرية ⚙️</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-bottom:var(--space-3);">أدخل الحد الأقصى للمصاريف الشهرية لكل تصنيف (${this.state.currency}):</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3);">
          ${['food', 'transport', 'health', 'family', 'finance', 'education', 'other'].map(cId => {
            const info = this.getCategoryInfo(cId);
            return `
              <div class="form-group">
                <label class="form-label">${info.icon} ${info.ar}</label>
                <input type="number" id="budget-${cId}" class="form-control" value="${budget[cId] || 0}" min="0">
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="FinanceModule.saveBudget()">حفظ الميزانية</button>
      </div>
    `;
    openModal(content);
  },

  saveBudget() {
    const cats = ['food', 'transport', 'health', 'family', 'finance', 'education', 'other'];
    const budget = {};
    cats.forEach(c => {
      budget[c] = parseFloat(document.getElementById(`budget-${c}`)?.value) || 0;
    });
    DB.saveBudget(budget);
    closeTopModal();
    Toast.show('تم حفظ وتحديث الميزانية بنجاح! 🎯', 'success');
    this.setTab('budget');
  },

  // ─── WISHLIST TAB ───────────────────────────────────────────────────────────
  renderWishlist() {
    const wishlist = DB.getWishlist() || [];
    
    if (wishlist.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="heart" style="width:32px;height:32px;"></i></div>
          <h3>قائمة الرغبات فارغة</h3>
          <p>ما الذي تخطط لشرائه قريباً؟ أضفه هنا لتنظيم أولويات الشراء ومتابعة حالته.</p>
          <button class="btn btn-primary" onclick="FinanceModule.openAddWishlistItem()">+ أضف رغبة جديدة</button>
        </div>
      `;
    }

    const priorityColors = { high: 'var(--color-danger)', medium: 'var(--accent-amber)', low: 'var(--accent-blue)' };
    const priorityLabels = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
    const statusLabels = { planning: 'تخطيط 💭', saving: 'جاري التوفير 🏦', purchased: 'تم الشراء ✅' };

    return `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:var(--space-4);">
        ${wishlist.map(i => `
          <div class="card" style="opacity: ${i.status === 'purchased' ? '0.6' : '1'}; position:relative; overflow:hidden;">
            ${i.status === 'purchased' ? `<div style="position:absolute; top:10px; left:-20px; background:var(--color-success); color:white; font-size:10px; padding:2px 25px; transform:rotate(-45deg);">تم</div>` : ''}
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-3);">
              <div>
                <h3 style="font-size:var(--font-size-sm); margin-bottom:2px; ${i.status==='purchased'?'text-decoration:line-through;':''}">${i.name}</h3>
                <span style="font-size:10px; font-weight:700; color:${priorityColors[i.priority]};">أولوية ${priorityLabels[i.priority]}</span>
              </div>
              <div style="font-weight:800; color:var(--text-primary);">${formatNumber(i.estimatedCost)} ${this.state.currency}</div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:var(--space-3); padding-top:var(--space-3); border-top:1px solid var(--border-subtle);">
              <select class="form-control" style="width:auto; padding:4px 8px; font-size:11px;" onchange="FinanceModule.updateWishlistStatus('${i.id}', this.value)">
                <option value="planning" ${i.status==='planning'?'selected':''}>${statusLabels.planning}</option>
                <option value="saving" ${i.status==='saving'?'selected':''}>${statusLabels.saving}</option>
                <option value="purchased" ${i.status==='purchased'?'selected':''}>${statusLabels.purchased}</option>
              </select>
              <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--color-danger);" onclick="FinanceModule.deleteWishlistItem('${i.id}')">
                <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  openAddWishlistItem() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة لقائمة الرغبات 🎁</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">اسم العنصر (Name)</label>
          <input type="text" id="wish-name" class="form-control" placeholder="ما الذي ترغب في شرائه؟" autofocus>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">السعر التقديري (${this.state.currency})</label>
            <input type="number" id="wish-cost" class="form-control" min="0">
          </div>
          <div class="form-group">
            <label class="form-label required">الأولوية (Priority)</label>
            <select id="wish-priority" class="form-control">
              <option value="high">🔴 عالية (مهم جداً)</option>
              <option value="medium" selected>🟡 متوسطة (مفيد)</option>
              <option value="low">🔵 منخفضة (كماليات)</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="FinanceModule.saveWishlistItem()">حفظ الرغبة</button>
      </div>
    `;
    openModal(content);
  },

  saveWishlistItem() {
    const name = document.getElementById('wish-name')?.value?.trim();
    const estimatedCost = parseFloat(document.getElementById('wish-cost')?.value) || 0;
    const priority = document.getElementById('wish-priority')?.value || 'medium';

    if (!name) { Toast.show('يرجى إدخال اسم العنصر', 'error'); return; }

    const list = DB.getWishlist() || [];
    list.push({
      id: generateId(),
      name,
      estimatedCost,
      priority,
      status: 'planning',
      createdAt: new Date().toISOString()
    });
    DB.saveWishlist(list);
    closeTopModal();
    Toast.show('تمت الإضافة لقائمة الرغبات ✨', 'success');
    this.setTab('wishlist');
  },

  updateWishlistStatus(id, newStatus) {
    const list = DB.getWishlist() || [];
    const item = list.find(i => i.id === id);
    if (item) {
      item.status = newStatus;
      DB.saveWishlist(list);
      this.setTab('wishlist');
      if (newStatus === 'purchased') {
        Toast.show('مبروك الشراء! 🎉 تأكد من إضافته للمصاريف إذا دفعته.', 'info', 4000);
      }
    }
  },

  deleteWishlistItem(id) {
    if (!confirm('هل تريد حذف هذا العنصر من الرغبات؟')) return;
    let list = DB.getWishlist() || [];
    list = list.filter(i => i.id !== id);
    DB.saveWishlist(list);
    Toast.show('تم الحذف', 'info');
    this.setTab('wishlist');
  },

  // ─── SAVINGS GOALS TAB ──────────────────────────────────────────────────────
  renderSavings() {
    const goals = DB.getSavingsGoals() || [];
    
    if (goals.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="piggy-bank" style="width:32px;height:32px;"></i></div>
          <h3>لا توجد أهداف ادخارية</h3>
          <p>حدد هدفاً للادخار لرحلة، أو سيارة، أو صندوق الطوارئ وابدأ في التوفير خطوة بخطوة.</p>
          <button class="btn btn-primary" onclick="FinanceModule.openAddSavingsGoal()">+ أضف هدف ادخار</button>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-4);">
        ${goals.map(g => {
          const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
          return `
            <div class="card" style="padding:var(--space-4);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-3);">
                <div>
                  <h3 style="font-size:var(--font-size-base); display:flex; align-items:center; gap:var(--space-2);">${g.title} ${pct===100?'🏆':''}</h3>
                  ${g.deadline ? `<div style="font-size:10px; color:var(--text-muted); margin-top:2px;">الهدف بحلول: ${g.deadline}</div>` : ''}
                </div>
                <div style="text-align:left;">
                  <div style="font-size:var(--font-size-lg); font-weight:800; color:var(--accent-emerald);">${pct}٪</div>
                </div>
              </div>
              <div class="progress-bar" style="height:10px; margin-bottom:var(--space-2);">
                <div class="progress-fill green" style="width:${pct}%;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:var(--font-size-xs);">
                <span>المدخر: <strong>${formatNumber(g.currentAmount)}</strong> ${this.state.currency}</span>
                <span>الهدف: <strong>${formatNumber(g.targetAmount)}</strong> ${this.state.currency}</span>
              </div>
              <div style="display:flex; justify-content:flex-end; gap:var(--space-2); margin-top:var(--space-3); border-top:1px solid var(--border-subtle); padding-top:var(--space-3);">
                <button class="btn btn-secondary btn-sm" onclick="FinanceModule.openAddFundsToGoal('${g.id}')">+ إيداع مبـلغ</button>
                <button class="btn btn-ghost btn-sm" style="color:var(--color-danger);" onclick="FinanceModule.deleteSavingsGoal('${g.id}')">حذف</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  openAddSavingsGoal() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إضافة هدف ادخار جديد 🏦</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">اسم الهدف (Title)</label>
          <input type="text" id="sg-title" class="form-control" placeholder="مثال: سيارة جديدة، صندوق طوارئ...">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">المبلغ المستهدف (Target)</label>
            <input type="number" id="sg-target" class="form-control" min="1">
          </div>
          <div class="form-group">
            <label class="form-label">رصيد البداية (Current Amount)</label>
            <input type="number" id="sg-current" class="form-control" value="0" min="0">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">الموعد المستهدف (Deadline)</label>
          <input type="date" id="sg-deadline" class="form-control">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="FinanceModule.saveSavingsGoal()">حفظ الهدف</button>
      </div>
    `;
    openModal(content);
  },

  saveSavingsGoal() {
    const title = document.getElementById('sg-title')?.value?.trim();
    const target = parseFloat(document.getElementById('sg-target')?.value) || 0;
    const current = parseFloat(document.getElementById('sg-current')?.value) || 0;
    const deadline = document.getElementById('sg-deadline')?.value;

    if (!title || target <= 0) { Toast.show('يرجى إدخال اسم الهدف ومبلغ مستهدف صحيح', 'error'); return; }

    const goals = DB.getSavingsGoals() || [];
    goals.push({
      id: generateId(),
      title,
      targetAmount: target,
      currentAmount: current,
      deadline,
      createdAt: new Date().toISOString()
    });
    DB.saveSavingsGoals(goals);
    closeTopModal();
    Toast.show('تمت إضافة هدف الادخار! بالتوفيق. 🎯', 'success');
    this.setTab('savings');
  },

  openAddFundsToGoal(id) {
    const goals = DB.getSavingsGoals() || [];
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">إيداع مبلغ لـ: ${goal.title}</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">المبلغ المُضاف (${this.state.currency})</label>
          <input type="number" id="sg-add-amount" class="form-control" min="1" autofocus>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="FinanceModule.saveGoalFunds('${id}')">تأكيد الإيداع</button>
      </div>
    `;
    openModal(content);
  },

  saveGoalFunds(id) {
    const amount = parseFloat(document.getElementById('sg-add-amount')?.value) || 0;
    if (amount <= 0) return;

    const goals = DB.getSavingsGoals() || [];
    const goal = goals.find(g => g.id === id);
    if (goal) {
      goal.currentAmount += amount;
      DB.saveSavingsGoals(goals);
      
      // Also register as a savings transaction automatically
      const transactions = DB.getTransactions();
      transactions.push({
        id: generateId(),
        description: `إيداع لهدف: ${goal.title}`,
        amount,
        type: 'savings',
        category: 'savings_acc',
        date: todayKey(),
        notes: 'إيداع تلقائي',
        createdAt: new Date().toISOString()
      });
      DB.saveTransactions(transactions);

      closeTopModal();
      Toast.show('تم إضافة المبلغ وتحديث المعاملات. استمر! 💪', 'success');
      this.setTab('savings');
    }
  },

  deleteSavingsGoal(id) {
    if (!confirm('هل تريد حذف هدف الادخار هذا؟ (لن تحذف المعاملات المرتبطة به)')) return;
    let goals = DB.getSavingsGoals() || [];
    goals = goals.filter(g => g.id !== id);
    DB.saveSavingsGoals(goals);
    Toast.show('تم الحذف', 'info');
    this.setTab('savings');
  },

  // ─── ANALYTICS TAB ──────────────────────────────────────────────────────────
  renderAnalytics() {
    const transactions = DB.getTransactions();
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Insights Calculations
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const monthlyExpenses = expenses.filter(t => t.date.startsWith(currentMonthStr));
    const monthlyTotal = monthlyExpenses.reduce((sum, t) => sum + (t.amount || 0), 0);

    const budget = DB.getBudget() || {};
    const totalBudget = Object.values(budget).reduce((sum, val) => sum + (val || 0), 0);
    const remainingBudget = totalBudget > 0 ? (totalBudget - monthlyTotal) : 0;

    // Highest Category
    const catSums = {};
    monthlyExpenses.forEach(t => { catSums[t.category] = (catSums[t.category] || 0) + (t.amount || 0); });
    let highestCat = 'لا يوجد';
    let highestAmt = 0;
    Object.keys(catSums).forEach(k => {
      if (catSums[k] > highestAmt) { highestAmt = catSums[k]; highestCat = this.getCategoryInfo(k).ar; }
    });

    // Average Monthly Spending
    const allMonths = new Set(expenses.map(t => t.date.substring(0, 7)));
    const totalAllTime = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const avgMonthly = allMonths.size > 0 ? (totalAllTime / allMonths.size) : 0;

    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-5);">
        
        <!-- Insights Cards -->
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:var(--space-3);">
          <div class="card" style="background:rgba(244, 63, 94, 0.05); border:1px solid rgba(244, 63, 94, 0.1); padding:var(--space-3);">
            <div style="font-size:var(--font-size-xs); color:var(--text-muted);">💸 مصروفات الشهر</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--color-danger); margin-top:4px;">${formatNumber(monthlyTotal)} <span style="font-size:0.7rem;">${this.state.currency}</span></div>
          </div>
          <div class="card" style="background:rgba(59, 130, 246, 0.05); border:1px solid rgba(59, 130, 246, 0.1); padding:var(--space-3);">
            <div style="font-size:var(--font-size-xs); color:var(--text-muted);">📉 متوسط الصرف الشهري</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--accent-blue); margin-top:4px;">${formatNumber(avgMonthly)} <span style="font-size:0.7rem;">${this.state.currency}</span></div>
          </div>
          <div class="card" style="background:rgba(245, 158, 11, 0.05); border:1px solid rgba(245, 158, 11, 0.1); padding:var(--space-3);">
            <div style="font-size:var(--font-size-xs); color:var(--text-muted);">🏆 أعلى تصنيف استهلاكاً</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--accent-amber); margin-top:4px;">${highestCat}</div>
          </div>
          <div class="card" style="background:rgba(16, 185, 129, 0.05); border:1px solid rgba(16, 185, 129, 0.1); padding:var(--space-3);">
            <div style="font-size:var(--font-size-xs); color:var(--text-muted);">🎯 الميزانية المتبقية</div>
            <div style="font-size:1.2rem; font-weight:800; color:var(--color-success); margin-top:4px;">${totalBudget > 0 ? formatNumber(remainingBudget) : 'غير محدد'} <span style="font-size:0.7rem;">${totalBudget>0?this.state.currency:''}</span></div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4);">
          <div class="card">
            <h3 class="card-title">📊 المصروفات اليومية (آخر ٧ أيام)</h3>
            <div class="chart-container" style="height:250px; margin-top:var(--space-4);">
              <canvas id="finance-chart-daily"></canvas>
            </div>
          </div>
          <div class="card">
            <h3 class="card-title">📈 المصروفات الأسبوعية (آخر ٤ أسابيع)</h3>
            <div class="chart-container" style="height:250px; margin-top:var(--space-4);">
              <canvas id="finance-chart-weekly"></canvas>
            </div>
          </div>
          <div class="card">
            <h3 class="card-title">📅 المصروفات الشهرية (هذا العام)</h3>
            <div class="chart-container" style="height:250px; margin-top:var(--space-4);">
              <canvas id="finance-chart-monthly"></canvas>
            </div>
          </div>
          <div class="card">
            <h3 class="card-title">🍩 المصروفات حسب التصنيف (الشهر الحالي)</h3>
            <div class="chart-container" style="height:250px; margin-top:var(--space-4);">
              <canvas id="finance-chart-category"></canvas>
            </div>
          </div>
        </div>
        
      </div>
    `;
  },

  initAnalyticsCharts() {
    if (typeof Chart === 'undefined') return;
    
    const transactions = DB.getTransactions();
    const expenses = transactions.filter(t => t.type === 'expense');

    const commonOptions = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Cairo' } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { family: 'Cairo' } } }
      }
    };

    // 1. Daily Expenses Chart (Last 7 Days)
    const dailyCtx = document.getElementById('finance-chart-daily')?.getContext('2d');
    if (dailyCtx) {
      const dailyData = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        const dayStr = d.toISOString().split('T')[0];
        const dayExp = expenses.filter(t => t.date.startsWith(dayStr)).reduce((sum, t) => sum + (t.amount || 0), 0);
        return { label: formatDateAr(d, 'weekday-short'), amount: dayExp };
      });

      new Chart(dailyCtx, {
        type: 'bar',
        data: {
          labels: dailyData.map(d => d.label),
          datasets: [{ data: dailyData.map(d => d.amount), backgroundColor: '#f43f5e', borderRadius: 4 }]
        },
        options: commonOptions
      });
    }

    // 2. Weekly Expenses Chart (Last 4 Weeks)
    const weeklyCtx = document.getElementById('finance-chart-weekly')?.getContext('2d');
    if (weeklyCtx) {
      const weeklyData = Array.from({length: 4}, (_, i) => {
        const dEnd = new Date();
        dEnd.setDate(dEnd.getDate() - (3 - i) * 7);
        const dStart = new Date(dEnd);
        dStart.setDate(dStart.getDate() - 6);
        
        const weekExp = expenses.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= dStart && tDate <= dEnd;
        }).reduce((sum, t) => sum + (t.amount || 0), 0);
        
        return { label: `أسبوع ${i+1}`, amount: weekExp };
      });

      new Chart(weeklyCtx, {
        type: 'bar',
        data: {
          labels: weeklyData.map(d => d.label),
          datasets: [{ data: weeklyData.map(d => d.amount), backgroundColor: '#f59e0b', borderRadius: 4 }]
        },
        options: commonOptions
      });
    }

    // 3. Monthly Expenses Chart (This Year)
    const monthlyCtx = document.getElementById('finance-chart-monthly')?.getContext('2d');
    if (monthlyCtx) {
      const yearStr = new Date().getFullYear().toString();
      const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      const monthlyData = months.map((m, i) => {
        const mStr = String(i+1).padStart(2, '0');
        const mExp = expenses.filter(t => t.date.startsWith(`${yearStr}-${mStr}`)).reduce((sum, t) => sum + (t.amount || 0), 0);
        return { label: m, amount: mExp };
      });

      new Chart(monthlyCtx, {
        type: 'bar',
        data: {
          labels: monthlyData.map(d => d.label),
          datasets: [{ data: monthlyData.map(d => d.amount), backgroundColor: '#3b82f6', borderRadius: 4 }]
        },
        options: commonOptions
      });
    }

    // 4. By Category Doughnut Chart (Current Month)
    const catCtx = document.getElementById('finance-chart-category')?.getContext('2d');
    if (catCtx) {
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
      const monthlyExpenses = expenses.filter(t => t.date.startsWith(currentMonthStr));
      
      const catSums = {};
      monthlyExpenses.forEach(t => { catSums[t.category] = (catSums[t.category] || 0) + (t.amount || 0); });
      
      const labels = Object.keys(catSums).map(k => this.getCategoryInfo(k).ar);
      const data = Object.values(catSums);

      new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: labels.length > 0 ? labels : ['لا توجد مصاريف'],
          datasets: [{
            data: data.length > 0 ? data : [1],
            backgroundColor: data.length > 0 ? ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'] : ['#334155'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Cairo' } } }
          }
        }
      });
    }
  }
};
