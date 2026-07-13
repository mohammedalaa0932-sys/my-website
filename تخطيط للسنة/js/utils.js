/**
 * LIFE OS — Utilities
 * Date helpers, Arabic formatting, number conversion, etc.
 */

// ── Birthday Constants ──
const BIRTHDAY = { month: 5, day: 15, year: 2005 }; // May 15, 2005

// ── Arabic Numbers ──
const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const AR_MONTHS = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
];
const AR_MONTHS_SHORT = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
];
const AR_DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const AR_DAYS_SHORT = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

function toArabicNumerals(num) {
  const settings = DB.getSettings();
  if (settings.numberFormat === 'western') return String(num);
  return String(num).replace(/[0-9]/g, d => AR_DIGITS[d]);
}

function toEnglishNumerals(str) {
  return String(str).replace(/[٠-٩]/g, d => AR_DIGITS.indexOf(d));
}

// ── Date Formatting ──
function formatDateAr(date, format = 'full') {
  if (!(date instanceof Date)) date = new Date(date);
  if (isNaN(date)) return '';

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const weekday = date.getDay();

  switch (format) {
    case 'full':
      return `${AR_DAYS[weekday]}، ${toArabicNumerals(day)} ${AR_MONTHS[month]} ${toArabicNumerals(year)}`;
    case 'short':
      return `${toArabicNumerals(day)} ${AR_MONTHS_SHORT[month]} ${toArabicNumerals(year)}`;
    case 'day-month':
      return `${toArabicNumerals(day)} ${AR_MONTHS[month]}`;
    case 'month-year':
      return `${AR_MONTHS[month]} ${toArabicNumerals(year)}`;
    case 'time':
      const h = date.getHours();
      const m = String(date.getMinutes()).padStart(2, '0');
      const period = h >= 12 ? 'م' : 'ص';
      const h12 = h % 12 || 12;
      return `${toArabicNumerals(h12)}:${toArabicNumerals(m)} ${period}`;
    case 'datetime':
      return `${formatDateAr(date, 'short')} - ${formatDateAr(date, 'time')}`;
    case 'iso':
      return date.toISOString().split('T')[0];
    case 'weekday':
      return AR_DAYS[weekday];
    case 'weekday-short':
      return AR_DAYS_SHORT[weekday];
    case 'month':
      return AR_MONTHS[month];
    default:
      return `${toArabicNumerals(day)}/${toArabicNumerals(month + 1)}/${toArabicNumerals(year)}`;
  }
}

// ── Birthday Calculations ──
function getPersonalYearData() {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Last birthday
  let lastBirthday = new Date(currentYear, BIRTHDAY.month - 1, BIRTHDAY.day);
  if (lastBirthday > now) {
    lastBirthday = new Date(currentYear - 1, BIRTHDAY.month - 1, BIRTHDAY.day);
  }

  // Next birthday
  let nextBirthday = new Date(currentYear, BIRTHDAY.month - 1, BIRTHDAY.day);
  if (nextBirthday <= now) {
    nextBirthday = new Date(currentYear + 1, BIRTHDAY.month - 1, BIRTHDAY.day);
  }

  // Age
  const age = lastBirthday.getFullYear() - BIRTHDAY.year;

  // Days calculations
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysPassed = Math.floor((now - lastBirthday) / msPerDay);
  const daysUntil = Math.ceil((nextBirthday - now) / msPerDay);
  const yearLength = Math.ceil((nextBirthday - lastBirthday) / msPerDay);
  const percentCompleted = Math.min(100, ((daysPassed / yearLength) * 100)).toFixed(1);
  const percentRemaining = (100 - parseFloat(percentCompleted)).toFixed(1);

  return {
    age,
    daysPassed,
    daysUntil,
    yearLength,
    percentCompleted: parseFloat(percentCompleted),
    percentRemaining: parseFloat(percentRemaining),
    lastBirthday,
    nextBirthday,
  };
}

// ── Relative Time ──
function timeAgo(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60)   return 'منذ لحظات';
  if (minutes < 60)   return `منذ ${toArabicNumerals(minutes)} دقيقة`;
  if (hours < 24)     return `منذ ${toArabicNumerals(hours)} ساعة`;
  if (days < 7)       return `منذ ${toArabicNumerals(days)} يوم`;
  if (weeks < 4)      return `منذ ${toArabicNumerals(weeks)} أسبوع`;
  if (months < 12)    return `منذ ${toArabicNumerals(months)} شهر`;
  return `منذ ${toArabicNumerals(years)} سنة`;
}

// ── Clock ──
function getLiveTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const period = now.getHours() >= 12 ? 'م' : 'ص';
  const h12 = now.getHours() % 12 || 12;
  return {
    h24: `${h}:${m}:${s}`,
    h12: `${toArabicNumerals(h12)}:${toArabicNumerals(m)}:${toArabicNumerals(s)}`,
    period,
    display: `${toArabicNumerals(String(h12).padStart(2,'0'))}:${toArabicNumerals(m)}`,
  };
}

// ── Number Formatting ──
function formatNumber(num, useArabic = null) {
  const settings = DB.getSettings();
  const ar = useArabic !== null ? useArabic : settings.numberFormat === 'arabic';
  const formatted = Number(num).toLocaleString('en');
  return ar ? toArabicNumerals(formatted) : formatted;
}

// ── Percentage ──
function formatPercent(value, decimals = 0) {
  const settings = DB.getSettings();
  const pct = Number(value).toFixed(decimals);
  return settings.numberFormat === 'arabic'
    ? `${toArabicNumerals(pct)}٪`
    : `${pct}%`;
}

// ── Color Utilities ──
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

// ── Priority Labels ──
const PRIORITY_LABELS = {
  high:   { ar: 'عالية',  color: 'rose',   icon: '🔴' },
  medium: { ar: 'متوسطة', color: 'amber',  icon: '🟡' },
  low:    { ar: 'منخفضة', color: 'green',  icon: '🟢' },
};

// ── Goal Type Labels ──
const GOAL_TYPE_LABELS = {
  life:      { ar: 'أهداف الحياة',  icon: '🌟' },
  '10year':  { ar: 'أهداف ١٠ سنوات', icon: '🏔️' },
  '5year':   { ar: 'أهداف ٥ سنوات', icon: '🗻' },
  '3year':   { ar: 'أهداف ٣ سنوات', icon: '⛰️' },
  '1year':   { ar: 'أهداف السنة',   icon: '🎯' },
  quarterly: { ar: 'أهداف الربع',   icon: '📅' },
  monthly:   { ar: 'أهداف الشهر',   icon: '🗓️' },
  weekly:    { ar: 'أهداف الأسبوع', icon: '📆' },
  daily:     { ar: 'أهداف اليوم',   icon: '✅' },
};

// ── Category Labels ──
const CATEGORIES = [
  { id: 'health',    ar: 'الصحة',       icon: '💪', color: '#10b981' },
  { id: 'career',    ar: 'المهنة',       icon: '💼', color: '#3b82f6' },
  { id: 'education', ar: 'التعليم',      icon: '📚', color: '#7c3aed' },
  { id: 'family',    ar: 'العائلة',      icon: '👨‍👩‍👧', color: '#f43f5e' },
  { id: 'finance',   ar: 'المالية',      icon: '💰', color: '#f59e0b' },
  { id: 'spiritual', ar: 'الروحانيات',   icon: '🕌', color: '#06b6d4' },
  { id: 'social',    ar: 'الاجتماعي',   icon: '🤝', color: '#8b5cf6' },
  { id: 'personal',  ar: 'الشخصي',      icon: '⭐', color: '#ec4899' },
  { id: 'projects',  ar: 'المشاريع',    icon: '🚀', color: '#f97316' },
  { id: 'other',     ar: 'أخرى',         icon: '📌', color: '#64748b' },
];

// ── Mood Labels ──
const MOODS = [
  { id: 5, emoji: '😄', ar: 'رائع' },
  { id: 4, emoji: '😊', ar: 'جيد' },
  { id: 3, emoji: '😐', ar: 'عادي' },
  { id: 2, emoji: '😔', ar: 'حزين' },
  { id: 1, emoji: '😤', ar: 'منزعج' },
];

// ── Quotes (shared short pool for widgets — full library in MotivationSystem) ──
const QUOTES = [
  { text: 'على كل إنسان أن يمر بالجحيم، ويتحمل العذاب، لكي يصل إلى مُراده وجنته.', author: 'حكمة الحياة' },
  { text: 'لا يصل أحد إلى جنته إلا بعد أن يعبر جحيمه.', author: 'حكمة الحياة' },
  { text: 'المقاومة هي مفتاح العودة إلى المسار الصحيح.', author: 'مبدأ النمو' },
  { text: 'الانضباط هو اختيار ما تريده أكثر على ما تريده الآن.', author: 'أوغسطس بيكهارت' },
  { text: 'الاستمرارية تتغلب على الحافزية.', author: 'مبدأ النجاح' },
  { text: 'الأفعال الصغيرة المتكررة كل يوم تصنع نتائج استثنائية.', author: 'روبن شارما' },
  { text: 'مستقبلك تصنعه ما تفعله اليوم.', author: 'روبرت كيوساكي' },
  { text: 'افعل اليوم ما سيشكرك عليه شخصك في المستقبل.', author: 'شون ستيفنسون' },
  { text: 'التقدم، وليس الكمال.', author: 'برايان تريسي' },
  { text: 'لا تكسر السلسلة.', author: 'جيري سينفيلد' },
  { text: 'النجاح يُبنى يوماً بيوم.', author: 'حكمة التراكم' },
  { text: 'كل يوم صعب هو خطوة أخرى نحو الحياة التي تريدها.', author: 'حكمة الصبر' },
  { text: 'عاداتك تصنع مستقبلك.', author: 'جيمس كلير' },
  { text: 'احلم بكبر. ابدأ بصغر. استمر باتساق.', author: 'روبن شارما' },
  { text: 'اسقط سبع مرات، قم ثماني.', author: 'مثل ياباني' },
  { text: 'أقوى نسخة منك تُبنى من خلال الصبر والمثابرة.', author: 'مبدأ التطور' },
  { text: 'قرار جيد واحد اليوم يمكن أن يغير مستقبلك.', author: 'حكمة القرار' },
  { text: 'ألم الانضباط مؤقت، لكن حسرة الاستسلام تدوم طويلاً.', author: 'حكمة الانضباط' },
  { text: 'اعبر جحيمك، واصنع جنتك... فالمقاومة مفتاح العودة.', author: 'حكمة الحياة' },
  { text: 'لا تصل إلى جنتك إلا بعد أن تعبر جحيمك، ولا تعود إلى نفسك إلا بالمقاومة.', author: 'حكمة الحياة' },
  { text: 'كل إنسان لا بد أن يمر بجحيمه الخاص، ويتحمل من الألم ما يصنع قوته.', author: 'حكمة الحياة' },
  { text: 'الجحيم ليس نهاية الطريق، بل هو الثمن الذي يدفعه الإنسان ليصل إلى الجنة التي يحلم بها.', author: 'حكمة الصمود' },
  { text: 'من لا يتقدم يتقادم.', author: 'حكمة عربية' },
  { text: 'الصبر مفتاح الفرج، والصمود أساس النجاح.', author: 'حكمة عربية' },
];

function getDailyQuote() {
  // Delegate to MotivationSystem if it has loaded (richer quote pool)
  if (typeof MotivationSystem !== 'undefined') {
    const q = MotivationSystem.getDailyQuote();
    const data = DB.getMotivationData();
    return {
      text: q.text,
      author: q.author,
      index: q.id,
      isFavorite: data.favorites.includes(q.id),
    };
  }

  const data = DB.getMotivationData();
  const today = todayKey(); // YYYY-MM-DD
  
  // If we already selected a quote for today, return it
  if (data.lastQuoteDate === today && data.dailyQuoteIndex >= 0 && data.dailyQuoteIndex < QUOTES.length) {
    return {
      ...QUOTES[data.dailyQuoteIndex],
      index: data.dailyQuoteIndex,
      isFavorite: data.favorites.includes(data.dailyQuoteIndex)
    };
  }
  
  // Otherwise, select a new quote
  let nextIndex = 0;
  if (QUOTES.length > 1) {
    const pool = [];
    for (let i = 0; i < QUOTES.length; i++) {
      if (i !== data.lastQuoteIndex) pool.push(i);
    }
    nextIndex = pool[Math.floor(Math.random() * pool.length)];
  }
  
  // Save state
  data.lastQuoteIndex = nextIndex;
  data.dailyQuoteIndex = nextIndex;
  data.lastQuoteDate = today;
  DB.saveMotivationData(data);
  
  return {
    ...QUOTES[nextIndex],
    index: nextIndex,
    isFavorite: data.favorites.includes(nextIndex)
  };
}

function toggleFavoriteQuote(index) {
  const data = DB.getMotivationData();
  const favIndex = data.favorites.indexOf(index);
  let isFavNow = false;
  if (favIndex >= 0) {
    data.favorites.splice(favIndex, 1);
    DB.saveMotivationData(data);
    Toast.show('تمت إزالة القول من المفضلة 💔', 'info');
    isFavNow = false;
  } else {
    data.favorites.push(index);
    DB.saveMotivationData(data);
    Toast.show('تمت إضافة القول إلى المفضلة! ❤️', 'success');
    isFavNow = true;
  }
  return isFavNow;
}

// ── Debounce ──
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── Deep Clone ──
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ── UUID ──
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ── Date comparison ──
function isSameDay(d1, d2) {
  if (!(d1 instanceof Date)) d1 = new Date(d1);
  if (!(d2 instanceof Date)) d2 = new Date(d2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function isToday(date) { return isSameDay(date, new Date()); }

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// ── Week range ──
function getWeekRange(date = new Date()) {
  // Week starts Saturday (Arabic week)
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const diff = (day + 1) % 7; // offset from Saturday
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// ── BMI Calculator ──
function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category, color;
  if (bmi < 18.5)      { category = 'نقص الوزن'; color = 'var(--accent-blue)'; }
  else if (bmi < 25)   { category = 'وزن طبيعي'; color = 'var(--color-success)'; }
  else if (bmi < 30)   { category = 'زيادة الوزن'; color = 'var(--accent-amber)'; }
  else                 { category = 'سمنة'; color = 'var(--color-danger)'; }
  return { value: bmi.toFixed(1), category, color };
}

// ── Toast ──
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3000) {
    this.init();
    const icons = {
      success: '✅',
      error:   '❌',
      warning: '⚠️',
      info:    'ℹ️',
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span>${message}</span>
    `;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
};

// ── Habit streak calculator ──
function calculateStreak(logs, habitId, frequency = 'daily') {
  const today = new Date();
  let streak = 0;
  let date = new Date(today);

  while (true) {
    const key = date.toISOString().split('T')[0];
    if (logs[key] && logs[key][habitId]) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ── Emoji picker helper ──
const HABIT_EMOJIS = ['🕌','💪','📚','💻','🎓','🏫','💧','😴','🧘','🚶','🎵','✍️','🌱','🍎','☕','🏃','🎯','💡','🌟','📝'];

// ── Color palette for charts ──
const CHART_COLORS = [
  'rgba(124, 58, 237, 0.8)',
  'rgba(59, 130, 246, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(245, 158, 11, 0.8)',
  'rgba(244, 63, 94, 0.8)',
  'rgba(6, 182, 212, 0.8)',
  'rgba(249, 115, 22, 0.8)',
  'rgba(99, 102, 241, 0.8)',
];

function getProgressEncouragement(tasksCompleted, habitsCompleted, challengeStreak) {
  if (tasksCompleted >= 3) {
    return '🔥 إنجاز رائع اليوم! لقد أنجزت ' + toArabicNumerals(tasksCompleted) + ' مهام. استمر في هذا الزخم القوي!';
  }
  if (challengeStreak >= 5) {
    return '💪 أنت في سلسلة انضباط قوية لـ ' + toArabicNumerals(challengeStreak) + ' أيام متتالية! لا تقطع السلسلة أبداً.';
  }
  if (habitsCompleted >= 2) {
    return '🌟 يوم مليء بالعادات الإيجابية المنجزة! انضباطك اليومي يصنع مستقبلك.';
  }
  return '✨ خطوة صغيرة واحدة كل يوم تصنع الفارق الكبير. ركّز على مهمتك الأساسية اليوم.';
}
