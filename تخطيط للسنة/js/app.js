/**
 * LIFE OS — Main Application Controller
 * Router, Navigation, Global State, Theme Management
 */

// ── Navigation Structure ──
const NAV_CONFIG = [
  {
    group: 'الرئيسية',
    items: [
      { id: 'dashboard',    label: 'لوحة التحكم',   icon: 'layout-dashboard' },
      { id: 'calendar',     label: 'التقويم',         icon: 'calendar' },
    ]
  },
  {
    group: 'التخطيط',
    items: [
      { id: 'goals',        label: 'الأهداف',         icon: 'target' },
      { id: 'priorities',   label: 'تخطيط اليوم',   icon: 'layout-list' },
      { id: 'tasks',        label: 'مهام اليوم',      icon: 'check-square' },
      { id: 'habits',       label: 'العادات',          icon: 'repeat' },
    ]
  },
  {
    group: 'التطوير الذاتي',
    items: [
      { id: 'challenge',    label: 'تحدي 90 يوم',      icon: 'shield' },
      { id: 'journal',      label: 'اليوميات',         icon: 'book-open' },
      { id: 'motivation',   label: 'الإلهام اليومي',   icon: 'sparkles' },
      { id: 'discovery',    label: 'اكتشف نفسك',      icon: 'compass' },
      { id: 'vision',       label: 'الرؤية',            icon: 'eye' },
      { id: 'gratitude',    label: 'الامتنان',          icon: 'heart' },
      { id: 'reflection',   label: 'التأمل اليومي',    icon: 'moon' },
    ]
  },
  {
    group: 'الإنتاجية',
    items: [
      { id: 'study',        label: 'الدراسة',           icon: 'graduation-cap' },
      { id: 'projects',     label: 'المشاريع',          icon: 'folder' },
    ]
  },
  {
    group: 'الحياة',
    items: [
      { id: 'health',       label: 'الصحة',             icon: 'heart-pulse' },
      { id: 'finance',      label: 'المالية',            icon: 'wallet' },
      { id: 'relationships',label: 'العلاقات',         icon: 'users' },
      { id: 'bucketlist',   label: 'قائمة الأمنيات',   icon: 'list' },
      { id: 'ideas',        label: 'الأفكار',            icon: 'lightbulb' },
    ]
  },
  {
    group: 'التحليل',
    items: [
      { id: 'weekly-review', label: 'المراجعة الأسبوعية', icon: 'file-text' },
      { id: 'statistics',   label: 'الإحصائيات',        icon: 'bar-chart-3' },
      { id: 'search',       label: 'البحث',              icon: 'search' },
    ]
  },
  {
    group: 'النظام',
    items: [
      { id: 'settings',     label: 'الإعدادات',          icon: 'settings' },
    ]
  },
];

// ── App State ──
const AppState = {
  currentModule: 'dashboard',
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  searchQuery: '',
  modals: [],
};

// ── Module Registry ──
const Modules = {};

// ── DOM References ──
let DOM = {};

// ── App Init ──
function initApp() {
  // Cache DOM refs
  DOM = {
    sidebar:        document.getElementById('sidebar'),
    mainContent:    document.getElementById('main-content'),
    moduleContent:  document.getElementById('module-content'),
    topHeader:      document.getElementById('top-header'),
    sidebarNav:     document.getElementById('sidebar-nav'),
    breadcrumb:     document.getElementById('breadcrumb'),
    currentPageLabel: document.getElementById('current-page-label'),
    themeToggle:    document.getElementById('theme-toggle'),
    sidebarToggle:  document.getElementById('sidebar-toggle'),
    mobileMenuBtn:  document.getElementById('mobile-menu-btn'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    headerSearch:   document.getElementById('header-search'),
    globalSearchInput: document.getElementById('global-search-input'),
    fabBtn:         document.getElementById('fab-btn'),
  };

  // Apply saved theme
  const settings = DB.getSettings();
  applyTheme(settings.theme);

  // Build navigation
  buildSidebar();

  // Set up event listeners
  setupEventListeners();

  // Navigate to saved module or dashboard
  const savedModule = sessionStorage.getItem('lifeos_current_module') || 'dashboard';
  navigateTo(savedModule);

  // Start live clock
  startClock();

  // Welcome toast
  setTimeout(() => {
    const hour = new Date().getHours();
    let greeting = 'مرحباً بك في نظام حياتك! 🌟';
    if (hour < 12)      greeting = 'صباح الخير! يوم مثمر بإذن الله ☀️';
    else if (hour < 17) greeting = 'مرحباً! استمر في إنجازاتك 💪';
    else if (hour < 21) greeting = 'مساء الخير! كيف كان يومك؟ 🌙';
    else                greeting = 'ليلة مباركة! لا تنس مراجعة يومك 🌟';
    Toast.show(greeting, 'info', 4000);
  }, 1000);

  // Random motivational quote pop-up every 20 minutes of use
  setInterval(() => {
    if (typeof MotivationSystem === 'undefined') return;
    const q = MotivationSystem.quotes[Math.floor(Math.random() * MotivationSystem.quotes.length)];
    if (q) Toast.show(`✨ "${q.text}" — ${q.author}`, 'info', 6000);
  }, 20 * 60 * 1000);
}

// ── Sidebar Builder ──
function buildSidebar() {
  const nav = DOM.sidebarNav;
  if (!nav) return;

  nav.innerHTML = NAV_CONFIG.map(group => `
    <div class="nav-group">
      <div class="nav-group-label">${group.group}</div>
      ${group.items.map(item => `
        <div class="nav-item" data-module="${item.id}" id="nav-${item.id}" role="button" tabindex="0" aria-label="${item.label}">
          <div class="nav-icon">
            <i data-lucide="${item.icon}" style="width:18px;height:18px;"></i>
          </div>
          <span class="nav-label">${item.label}</span>
        </div>
      `).join('')}
    </div>
  `).join('');

  // Re-init lucide icons for the nav
  if (window.lucide) lucide.createIcons();

  // Click handlers
  nav.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const moduleId = item.dataset.module;
      navigateTo(moduleId);
      // Close mobile sidebar
      if (AppState.mobileSidebarOpen) closeMobileSidebar();
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
}

// ── Navigation ──
function navigateTo(moduleId) {
  AppState.currentModule = moduleId;
  sessionStorage.setItem('lifeos_current_module', moduleId);

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.module === moduleId);
  });

  // Update breadcrumb
  updateBreadcrumb(moduleId);

  // Render module
  renderModule(moduleId);
}

function updateBreadcrumb(moduleId) {
  const allItems = NAV_CONFIG.flatMap(g => g.items);
  const item = allItems.find(i => i.id === moduleId);
  if (item && DOM.currentPageLabel) {
    DOM.currentPageLabel.textContent = item.label;
  }
}

// ── Module Renderer ──
function renderModule(moduleId) {
  const container = DOM.moduleContent;
  if (!container) return;

  // Fade out
  container.style.opacity = '0';
  container.style.transform = 'translateY(6px)';

  setTimeout(() => {
    container.innerHTML = '';

    const renderFns = {
      dashboard:   DashboardModule.render.bind(DashboardModule),
      calendar:    CalendarModule.render.bind(CalendarModule),
      challenge:   ChallengeModule.render.bind(ChallengeModule),
      goals:       GoalsModule.render.bind(GoalsModule),
      priorities:  PrioritiesModule.render.bind(PrioritiesModule),
      tasks:       TasksModule.render.bind(TasksModule),
      habits:      HabitsModule.render.bind(HabitsModule),
      journal:     JournalModule.render.bind(JournalModule),
      discovery:   DiscoveryModule.render.bind(DiscoveryModule),
      vision:      VisionModule.render.bind(VisionModule),
      gratitude:   GratitudeModule.render.bind(GratitudeModule),
      reflection:  ReflectionModule.render.bind(ReflectionModule),
      study:       StudyModule.render.bind(StudyModule),
      projects:    ProjectsModule.render.bind(ProjectsModule),
      health:      HealthModule.render.bind(HealthModule),
      finance:     FinanceModule.render.bind(FinanceModule),
      motivation:   MotivationSystem.render.bind(MotivationSystem),
      relationships: RelationshipsModule.render.bind(RelationshipsModule),
      bucketlist:  BucketListModule.render.bind(BucketListModule),
      ideas:       IdeasModule.render.bind(IdeasModule),
      statistics:  StatisticsModule.render.bind(StatisticsModule),
      'weekly-review': WeeklyReviewModule.render.bind(WeeklyReviewModule),
      search:      SearchModule.render.bind(SearchModule),
      settings:    SettingsModule.render.bind(SettingsModule),
    };

    const renderFn = renderFns[moduleId];
    if (renderFn) {
      renderFn(container);
    } else {
      container.innerHTML = `<div class="empty-state"><h3>قيد التطوير</h3><p>هذه الوحدة قادمة قريباً</p></div>`;
    }

    // Init Lucide icons in rendered content
    if (window.lucide) lucide.createIcons();

    // Fade in
    container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  }, 100);
}

// ── Theme Management ──
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = DOM.themeToggle;
  if (btn) {
    btn.setAttribute('data-tooltip', theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن');
    btn.innerHTML = theme === 'dark'
      ? '<i data-lucide="sun" style="width:18px;height:18px;"></i>'
      : '<i data-lucide="moon" style="width:18px;height:18px;"></i>';
    if (window.lucide) lucide.createIcons();
  }
}

function toggleTheme() {
  const settings = DB.getSettings();
  const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
  settings.theme = newTheme;
  DB.saveSettings(settings);
  applyTheme(newTheme);
  Toast.show(newTheme === 'dark' ? 'تم التحويل إلى الوضع الداكن' : 'تم التحويل إلى الوضع الفاتح', 'info');
}

// ── Sidebar Toggle ──
function toggleSidebar() {
  AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
  DOM.sidebar.classList.toggle('collapsed', AppState.sidebarCollapsed);
  DOM.mainContent.classList.toggle('expanded', AppState.sidebarCollapsed);
}

function openMobileSidebar() {
  AppState.mobileSidebarOpen = true;
  DOM.sidebar.classList.add('mobile-open');
  DOM.sidebarOverlay.classList.add('active');
}

function closeMobileSidebar() {
  AppState.mobileSidebarOpen = false;
  DOM.sidebar.classList.remove('mobile-open');
  DOM.sidebarOverlay.classList.remove('active');
}

// ── Clock ──
function startClock() {
  function updateClock() {
    const timeEl = document.getElementById('live-time');
    if (timeEl) {
      const t = getLiveTime();
      timeEl.textContent = t.display;
    }
  }
  updateClock();
  setInterval(updateClock, 1000);
}

// ── Event Listeners ──
function setupEventListeners() {
  // Theme toggle
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', toggleTheme);
  }

  // Sidebar toggle (desktop)
  if (DOM.sidebarToggle) {
    DOM.sidebarToggle.addEventListener('click', toggleSidebar);
  }

  // Mobile menu
  if (DOM.mobileMenuBtn) {
    DOM.mobileMenuBtn.addEventListener('click', openMobileSidebar);
  }

  // Overlay click closes mobile sidebar
  if (DOM.sidebarOverlay) {
    DOM.sidebarOverlay.addEventListener('click', closeMobileSidebar);
  }

  // Header search
  if (DOM.globalSearchInput) {
    DOM.globalSearchInput.addEventListener('input', debounce(e => {
      const q = e.target.value.trim();
      if (q.length > 1) {
        navigateTo('search');
        // Pass query to search module
        setTimeout(() => SearchModule.setQuery(q), 150);
      }
    }, 400));

    DOM.globalSearchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = DOM.globalSearchInput.value.trim();
        if (q) {
          navigateTo('search');
          setTimeout(() => SearchModule.setQuery(q), 150);
        }
      }
    });
  }

  // FAB
  if (DOM.fabBtn) {
    DOM.fabBtn.addEventListener('click', openQuickAdd);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k': e.preventDefault(); DOM.globalSearchInput?.focus(); break;
        case '1': e.preventDefault(); navigateTo('dashboard'); break;
        case '2': e.preventDefault(); navigateTo('goals'); break;
        case '3': e.preventDefault(); navigateTo('habits'); break;
        case '4': e.preventDefault(); navigateTo('journal'); break;
      }
    }
    if (e.key === 'Escape') closeTopModal();
  });

  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
      if (!menu.closest('.dropdown')?.contains(e.target)) {
        menu.classList.remove('active');
      }
    });
  });
}

// ── Modal Stack ──
function openModal(content, options = {}) {
  const size = options.size || '';
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = `modal-${Date.now()}`;

  overlay.innerHTML = `
    <div class="modal ${size}" role="dialog" aria-modal="true">
      ${content}
    </div>
  `;

  overlay.addEventListener('click', e => {
    if (e.target === overlay && !options.persistent) closeModal(overlay);
  });

  document.body.appendChild(overlay);
  AppState.modals.push(overlay);

  if (window.lucide) lucide.createIcons();
  return overlay;
}

function closeModal(overlay) {
  if (!overlay) return;
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.remove();
    AppState.modals = AppState.modals.filter(m => m !== overlay);
  }, 200);
}

function closeTopModal() {
  const top = AppState.modals[AppState.modals.length - 1];
  if (top) closeModal(top);
}

// ── Quick Add FAB Menu ──
function openQuickAdd() {
  const content = `
    <div class="modal-header">
      <h3 class="modal-title">إضافة سريعة ⚡</h3>
      <button class="btn btn-ghost btn-icon" onclick="closeTopModal()">
        <i data-lucide="x" style="width:18px;height:18px;"></i>
      </button>
    </div>
    <div class="modal-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
        ${[
          { label: 'مهمة جديدة', icon: 'check-square', fn: 'openQuickTask()', color: 'blue' },
          { label: 'هدف جديد', icon: 'target', fn: 'openQuickGoal()', color: 'purple' },
          { label: 'عادة جديدة', icon: 'repeat', fn: 'navigateTo(\'habits\')', color: 'green' },
          { label: 'يوميات', icon: 'book-open', fn: 'navigateTo(\'journal\')', color: 'amber' },
          { label: 'فكرة جديدة', icon: 'lightbulb', fn: 'navigateTo(\'ideas\')', color: 'cyan' },
          { label: 'امتنان اليوم', icon: 'heart', fn: 'navigateTo(\'gratitude\')', color: 'rose' },
        ].map(opt => `
          <button class="card" style="text-align:center;cursor:pointer;padding:var(--space-4);"
                  onclick="closeTopModal();${opt.fn}">
            <div class="card-icon ${opt.color}" style="margin:0 auto var(--space-2);">
              <i data-lucide="${opt.icon}" style="width:20px;height:20px;"></i>
            </div>
            <div style="font-size:var(--font-size-sm);font-weight:600;color:var(--text-primary);">${opt.label}</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
  openModal(content, { size: 'modal-sm' });
}

function openQuickTask() {
  const today = todayKey();
  const tasks = DB.getTasks();
  const content = `
    <div class="modal-header">
      <h3 class="modal-title">مهمة جديدة ✅</h3>
      <button class="btn btn-ghost btn-icon" onclick="closeTopModal()">
        <i data-lucide="x" style="width:18px;height:18px;"></i>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label required">عنوان المهمة</label>
        <input type="text" id="quick-task-title" class="form-control" placeholder="ماذا تريد أن تنجز؟" autofocus>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">الأولوية</label>
          <select id="quick-task-priority" class="form-control">
            <option value="high">🔴 عالية</option>
            <option value="medium" selected>🟡 متوسطة</option>
            <option value="low">🟢 منخفضة</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">التاريخ</label>
          <input type="date" id="quick-task-date" class="form-control" value="${today}">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
      <button class="btn btn-primary" onclick="saveQuickTask()">حفظ المهمة</button>
    </div>
  `;
  openModal(content);
}

function saveQuickTask() {
  const title = document.getElementById('quick-task-title')?.value?.trim();
  if (!title) { Toast.show('الرجاء إدخال عنوان المهمة', 'error'); return; }

  const tasks = DB.getTasks();
  tasks.push({
    id: generateId(),
    title,
    priority: document.getElementById('quick-task-priority')?.value || 'medium',
    date: document.getElementById('quick-task-date')?.value || todayKey(),
    completed: false,
    createdAt: new Date().toISOString(),
  });
  DB.saveTasks(tasks);
  closeTopModal();
  Toast.show('تمت إضافة المهمة بنجاح! ✅', 'success');

  // Refresh dashboard or tasks if visible
  if (AppState.currentModule === 'dashboard') {
    renderModule('dashboard');
  } else if (AppState.currentModule === 'tasks') {
    TasksModule.refresh();
  }
}

function openQuickGoal() {
  navigateTo('goals');
  setTimeout(() => GoalsModule.openAddGoalModal(), 300);
}

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', initApp);
