/**
 * LIFE OS — Storage Layer
 * Abstracts localStorage with JSON serialization and key namespacing
 */

const STORAGE_PREFIX = 'lifeos_';

const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Storage.get error for key "${key}":`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Storage.set error for key "${key}":`, e);
      if (e.name === 'QuotaExceededError') {
        Toast.show('تحذير: مساحة التخزين ممتلئة!', 'warning');
      }
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  },

  getAll() {
    const data = {};
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => {
        const cleanKey = k.replace(STORAGE_PREFIX, '');
        try { data[cleanKey] = JSON.parse(localStorage.getItem(k)); }
        catch (e) { data[cleanKey] = localStorage.getItem(k); }
      });
    return data;
  },

  import(data) {
    try {
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch (e) {
      console.error('Storage.import error:', e);
      return false;
    }
  },

  // Size in KB
  getSize() {
    let total = 0;
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => {
        total += (localStorage.getItem(k) || '').length;
      });
    return (total / 1024).toFixed(2);
  }
};

// ── Data Models with defaults ──

const DB = {
  // Settings
  getSettings() {
    return Storage.get('settings', {
      theme: 'dark',
      language: 'ar',
      birthday: '2005-05-15',
      name: 'صديقي',
      notifications: true,
      soundEffects: false,
      weekStart: 'saturday', // Arabic week starts Saturday
      numberFormat: 'arabic', // arabic or western
    });
  },
  saveSettings(settings) { Storage.set('settings', settings); },

  // Goals (Generic / Legacy)
  getGoals() { return Storage.get('goals', []); },
  saveGoals(goals) { Storage.set('goals', goals); },

  // New Goal Planning System
  getYearlyGoals() { return Storage.get('yearly_goals', []); },
  saveYearlyGoals(goals) { Storage.set('yearly_goals', goals); },
  getMonthlyGoals() { return Storage.get('monthly_goals', []); },
  saveMonthlyGoals(goals) { Storage.set('monthly_goals', goals); },
  getWeeklyGoals() { return Storage.get('weekly_goals', []); },
  saveWeeklyGoals(goals) { Storage.set('weekly_goals', goals); },
  getDailyGoals() { return Storage.get('daily_goals', []); },
  saveDailyGoals(goals) { Storage.set('daily_goals', goals); },

  // Habits
  getHabits() { return Storage.get('habits', []); },
  saveHabits(habits) { Storage.set('habits', habits); },

  getHabitLogs() { return Storage.get('habit_logs', {}); },
  saveHabitLogs(logs) { Storage.set('habit_logs', logs); },

  // Journal
  getJournalEntries() { return Storage.get('journal', []); },
  saveJournalEntries(entries) { Storage.set('journal', entries); },

  // Gratitude
  getGratitude() { return Storage.get('gratitude', {}); },
  saveGratitude(data) { Storage.set('gratitude', data); },

  // Reflection
  getReflections() { return Storage.get('reflections', {}); },
  saveReflections(data) { Storage.set('reflections', data); },

  // Self Discovery
  getDiscovery() { return Storage.get('discovery', {}); },
  saveDiscovery(data) { Storage.set('discovery', data); },

  // Vision
  getVision() { return Storage.get('vision', {}); },
  saveVision(data) { Storage.set('vision', data); },

  // Study
  getSubjects() { return Storage.get('subjects', []); },
  saveSubjects(data) { Storage.set('subjects', data); },

  getStudySessions() { return Storage.get('study_sessions', []); },
  saveStudySessions(data) { Storage.set('study_sessions', data); },

  getBooks() { return Storage.get('books', []); },
  saveBooks(data) { Storage.set('books', data); },

  // Projects
  getProjects() { return Storage.get('projects', []); },
  saveProjects(data) { Storage.set('projects', data); },

  // Health
  getHealthLogs() { return Storage.get('health_logs', []); },
  saveHealthLogs(data) { Storage.set('health_logs', data); },

  getWorkouts() { return Storage.get('workouts', []); },
  saveWorkouts(data) { Storage.set('workouts', data); },

  // Finance
  getTransactions() { return Storage.get('transactions', []); },
  saveTransactions(data) { Storage.set('transactions', data); },

  getBudget() { return Storage.get('budget', {}); },
  saveBudget(data) { Storage.set('budget', data); },

  // Wishlist (replaces ShoppingList)
  getWishlist() { return Storage.get('wishlist', []); },
  saveWishlist(data) { Storage.set('wishlist', data); },

  // Savings Goals
  getSavingsGoals() { return Storage.get('savings_goals', []); },
  saveSavingsGoals(data) { Storage.set('savings_goals', data); },

  // Bucket List
  getBucketList() { return Storage.get('bucket_list', []); },
  saveBucketList(data) { Storage.set('bucket_list', data); },

  // Ideas
  getIdeas() { return Storage.get('ideas', []); },
  saveIdeas(data) { Storage.set('ideas', data); },

  // Calendar Events
  getEvents() { return Storage.get('events', []); },
  saveEvents(data) { Storage.set('events', data); },

  // Calendar Extensibility (Days and Plans)
  getCalendarDays() { return Storage.get('calendar_days', {}); }, // Stores { date: { completed: true/false, notes: '', reflection: '' } }
  saveCalendarDays(data) { Storage.set('calendar_days', data); },

  getCalendarPlans() { return Storage.get('calendar_plans', {}); }, // Stores { scope_key: { goals: '', notes: '' } } (e.g. "week-2026-42")
  saveCalendarPlans(data) { Storage.set('calendar_plans', data); },

  // Tasks (standalone, not attached to goals/projects)
  getTasks() { return Storage.get('tasks', []); },
  saveTasks(data) { Storage.set('tasks', data); },

  // Quick Notes
  getNotes() { return Storage.get('notes', []); },
  saveNotes(data) { Storage.set('notes', data); },

  // Priorities
  getPriorities() { return Storage.get('priorities', {}); },
  savePriorities(data) { Storage.set('priorities', data); },

  // 90-Day Challenge
  getChallengeData() {
    return Storage.get('challenge_90', {
      startDate: null,
      logs: [],
      currentStreak: 0,
      longestStreak: 0,
      visionAnswers: [],
      badges: []
    });
  },
  saveChallengeData(data) { Storage.set('challenge_90', data); },

  // Daily Motivation System
  getMotivationData() {
    return Storage.get('motivation', {
      favorites: [],       // array of quote indices marked as favorite
      lastQuoteDate: null, // 'YYYY-MM-DD' of the last shown quote
      lastQuoteIndex: -1,  // index of last shown quote (to avoid consecutive repeat)
      dailyQuoteIndex: -1, // quote selected for today
    });
  },
  saveMotivationData(data) { Storage.set('motivation', data); },

  // Weekly Reviews
  getWeeklyReviews() { return Storage.get('weekly_reviews', {}); },
  saveWeeklyReviews(data) { Storage.set('weekly_reviews', data); },

  // Relationships
  getRelationships() { return Storage.get('relationships', []); },
  saveRelationships(data) { Storage.set('relationships', data); },
};

// ── ID Generator ──
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Today Key (YYYY-MM-DD) ──
function todayKey() {
  return new Date().toISOString().split('T')[0];
}
