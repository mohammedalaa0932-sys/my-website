/**
 * LIFE OS — Daily Motivation System
 * A centralized engine for daily motivational quotes with:
 * - 20 curated discipline/growth quotes
 * - Seeded-random daily selection (no consecutive repeats)
 * - Favorite marking
 * - Personalized messages based on streaks, goals, and progress
 * - Full-page Motivation Library
 */

const MOTIVATION_QUOTES = [
  // ── Arabic Quotes (User-Provided) ──
  { id: 0,  text: "على كل إنسان أن يمر بالجحيم، ويتحمل العذاب، لكي يصل إلى مُراده وجنته.", en: "Every person must walk through their own hell before reaching their paradise.", author: "حكمة الحياة", category: "صمود" },
  { id: 1,  text: "كل إنسان لا بد أن يمر بجحيمه الخاص، ويتحمل من الألم ما يصنع قوته، حتى يصل إلى مُراده، ويبلغ جنته التي سعى إليها.", en: "Every person must pass through their own hell, enduring pain that builds their strength.", author: "حكمة الحياة", category: "صمود" },
  { id: 2,  text: "لا يصل أحد إلى جنته إلا بعد أن يعبر جحيمه.", en: "No one reaches their paradise without first crossing their own hell.", author: "حكمة الحياة", category: "صمود" },
  { id: 3,  text: "الجحيم ليس نهاية الطريق، بل هو الثمن الذي يدفعه الإنسان ليصل إلى الجنة التي يحلم بها.", en: "Hell is not the end of the road, it is the price one pays to reach the paradise they dream of.", author: "حكمة الصمود", category: "صمود" },
  { id: 4,  text: "على كل إنسان أن يمر بجحيمه، ويتحمل العذاب، ليصل إلى مُراده وجنته... والمقاومة مفتاح العودة.", en: "Every person must cross their hell to reach their paradise — resistance is the key to returning.", author: "حكمة الحياة", category: "صمود" },
  { id: 5,  text: "كل إنسان لا بد أن يعبر جحيمه الخاص، ويتحمل من الألم ما يصنع قوته، حتى يبلغ مُراده، ويصل إلى جنته... فالمقاومة هي مفتاح العودة.", en: "Every person must cross their own hell, bearing pain that builds their strength — resistance is the key to return.", author: "حكمة الحياة", category: "صمود" },
  { id: 6,  text: "اعبر جحيمك، واصنع جنتك... فالمقاومة مفتاح العودة.", en: "Cross your hell, build your paradise — resistance is the key to return.", author: "حكمة الحياة", category: "صمود" },
  { id: 7,  text: "لا تصل إلى جنتك إلا بعد أن تعبر جحيمك، ولا تعود إلى نفسك إلا بالمقاومة.", en: "You only reach your paradise after crossing your hell, and you only return to yourself through resistance.", author: "حكمة الحياة", category: "صمود" },
  // ── Discipline & Consistency ──
  { id: 8,  text: "المقاومة هي مفتاح العودة إلى المسار الصحيح.", en: "Resistance is the key to getting back on track.", author: "مبدأ النمو", category: "انضباط" },
  { id: 9,  text: "الانضباط هو اختيار ما تريده أكثر على ما تريده الآن.", en: "Discipline is choosing what you want most over what you want now.", author: "أوغسطس بيكهارت", category: "انضباط" },
  { id: 10, text: "الاستمرارية تتغلب على الحافزية.", en: "Consistency beats motivation.", author: "مبدأ النجاح", category: "استمرارية" },
  { id: 11, text: "الأفعال الصغيرة المتكررة كل يوم تصنع نتائج استثنائية.", en: "Small actions repeated every day create extraordinary results.", author: "روبن شارما", category: "استمرارية" },
  { id: 12, text: "مستقبلك تصنعه ما تفعله اليوم.", en: "Your future is created by what you do today.", author: "روبرت كيوساكي", category: "نجاح" },
  { id: 13, text: "افعل اليوم ما سيشكرك عليه شخصك في المستقبل.", en: "Do something today that your future self will thank you for.", author: "شون ستيفنسون", category: "نمو" },
  { id: 14, text: "التقدم، وليس الكمال.", en: "Progress, not perfection.", author: "برايان تريسي", category: "نمو" },
  { id: 15, text: "لا تكسر السلسلة.", en: "Don't break the chain.", author: "جيري سينفيلد", category: "استمرارية" },
  { id: 16, text: "النجاح يُبنى يوماً بيوم.", en: "Success is built one day at a time.", author: "حكمة التراكم", category: "نجاح" },
  { id: 17, text: "كل يوم صعب هو خطوة أخرى نحو الحياة التي تريدها.", en: "Every difficult day is another step toward the life you want.", author: "حكمة الصبر", category: "صمود" },
  { id: 18, text: "عاداتك تصنع مستقبلك.", en: "Your habits create your future.", author: "جيمس كلير", category: "انضباط" },
  { id: 19, text: "احلم بكبر. ابدأ بصغر. استمر باتساق.", en: "Dream big. Start small. Stay consistent.", author: "روبن شارما", category: "نمو" },
  { id: 20, text: "اسقط سبع مرات، قم ثماني.", en: "Fall seven times, stand up eight.", author: "مثل ياباني", category: "صمود" },
  { id: 21, text: "أقوى نسخة منك تُبنى من خلال الصبر والمثابرة.", en: "The strongest version of yourself is built through patience and persistence.", author: "مبدأ التطور", category: "نمو" },
  { id: 22, text: "قرار جيد واحد اليوم يمكن أن يغير مستقبلك.", en: "One good decision today can change your future.", author: "حكمة القرار", category: "نجاح" },
  { id: 23, text: "ألم الانضباط مؤقت، لكن حسرة الاستسلام تدوم طويلاً.", en: "The pain of discipline is temporary, but the regret of giving up lasts much longer.", author: "أوغسطس بيكهارت", category: "انضباط" },
  // ── Additional Arabic Originals ──
  { id: 24, text: "الصبر مفتاح الفرج، والصمود أساس النجاح.", author: "حكمة عربية", category: "صمود" },
  { id: 25, text: "من لا يتقدم يتقادم.", author: "حكمة عربية", category: "استمرارية" },
  { id: 26, text: "الإصرار سفينة لا تغرق.", author: "حكمة عربية", category: "صمود" },
  { id: 27, text: "كل إنسان فيه نار — المهم أن تُضيء ولا تحرق.", author: "حكمة الحياة", category: "نمو" },
  { id: 28, text: "لا يحصد إلا من زرع، ولا يُكمل إلا من صبر.", author: "حكمة عربية", category: "استمرارية" },
  { id: 29, text: "اليوم الذي لم تتحسن فيه هو يوم ضاع.", author: "مبدأ التطوير المستمر", category: "نمو" },
  { id: 30, text: "الشجرة العظيمة لا تنمو في ليلة واحدة.", author: "حكمة الصبر", category: "صبر" },
  { id: 31, text: "من تحمّل الصعاب اليوم، تنعّم بالراحة غداً.", author: "حكمة الجد", category: "صمود" },
  { id: 32, text: "الطريق الوحيد للوصول إلى القمة هو تسلّق الجبل خطوة خطوة.", author: "حكمة المثابرة", category: "استمرارية" },
  { id: 33, text: "لا تبحث عن الطريق السهل — كل صعوبة تخطوتها تصنع منك إنساناً أقوى.", author: "حكمة البناء", category: "صمود" },
  { id: 34, text: "ابدأ الآن، حتى لو لم تكن مستعداً تماماً.", author: "مبدأ البداية", category: "نجاح" },
  { id: 35, text: "العمل اليومي المنتظم يُسقط أضخم الجبال.", author: "حكمة الانضباط", category: "انضباط" },
  { id: 36, text: "الشخص الناجح ليس من لم يفشل، بل من قام بعد كل سقطة.", author: "حكمة النجاح", category: "صمود" },
  { id: 37, text: "أمنح نفسك الوقت — النجاح ليس حدثاً بل رحلة.", author: "حكمة الصبر", category: "صبر" },
  { id: 38, text: "إذا أردت أن تغير حياتك، ابدأ بتغيير عاداتك اليومية.", author: "جيمس كلير", category: "انضباط" },
  { id: 39, text: "أفضل استثمار يمكنك القيام به هو في نفسك.", en: "The best investment you can make is in yourself.", author: "وارن بافيت", category: "نمو" },
];

// ─── The Motivation System ────────────────────────────────────────────────────
const MotivationSystem = {

  quotes: MOTIVATION_QUOTES,

  /**
   * Returns the quote for today.
   * Seeds selection by date string so it's consistent for the whole day,
   * while ensuring it never repeats the same quote on consecutive days.
   */
  getDailyQuote() {
    const today = todayKey();
    const data = DB.getMotivationData();

    // If already selected a quote for today, return it
    if (data.lastQuoteDate === today && data.dailyQuoteIndex >= 0) {
      return this.quotes[data.dailyQuoteIndex];
    }

    // Pick a new quote — seed by date to be deterministic, but avoid last one
    const dateHash = today.split('-').reduce((acc, n) => acc + parseInt(n), 0);
    let idx = dateHash % this.quotes.length;

    // Ensure no consecutive repeat
    if (idx === data.lastQuoteIndex) {
      idx = (idx + 1) % this.quotes.length;
    }

    // Persist the selection
    data.lastQuoteIndex = data.dailyQuoteIndex >= 0 ? data.dailyQuoteIndex : data.lastQuoteIndex;
    data.lastQuoteDate = today;
    data.dailyQuoteIndex = idx;
    DB.saveMotivationData(data);

    return this.quotes[idx];
  },

  /**
   * Generates a personalized motivational message based on user's progress.
   */
  getPersonalizedMessage() {
    const habits = DB.getHabits().filter(h => h.frequency === 'daily');
    const habitLogs = DB.getHabitLogs();
    const today = todayKey();
    const challengeData = DB.getChallengeData();
    const tasks = DB.getTasks().filter(t => t.date === today);

    const completedHabits = habits.filter(h => habitLogs[today]?.[h.id]).length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const streak = challengeData.currentStreak || 0;

    const messages = [];

    if (streak >= 7) messages.push(`🔥 سلسلة رائعة! لديك ${streak} أيام متتالية في تحديك. استمر!`);
    else if (streak >= 3) messages.push(`💪 ${streak} أيام متتالية! أنت تبني زخماً حقيقياً.`);
    if (completedHabits === habits.length && habits.length > 0) messages.push('✨ أكملت جميع عاداتك اليوم! أنت بطل.');
    if (completedTasks > 0) messages.push(`✅ أنجزت ${completedTasks} مهمة اليوم. استمر في البناء!`);
    if (habits.length === 0) messages.push('🌱 أضف أول عادة يومية لك وابدأ رحلة تحول حقيقية.');

    if (messages.length === 0) messages.push('🌟 يومك بيدك. اجعله يستحق أن يُذكر.');

    return messages[Math.floor(Math.random() * messages.length)];
  },

  toggleFavorite(quoteId) {
    const data = DB.getMotivationData();
    const idx = data.favorites.indexOf(quoteId);
    if (idx === -1) {
      data.favorites.push(quoteId);
      Toast.show('تمت الإضافة للمفضلة ❤️', 'success');
    } else {
      data.favorites.splice(idx, 1);
      Toast.show('تمت الإزالة من المفضلة', 'info');
    }
    DB.saveMotivationData(data);
    return data.favorites.includes(quoteId);
  },

  isFavorite(quoteId) {
    return DB.getMotivationData().favorites.includes(quoteId);
  },

  getFavorites() {
    const favIds = DB.getMotivationData().favorites;
    return this.quotes.filter(q => favIds.includes(q.id));
  },

  // ─── Render the full Motivation page ────────────────────────────────────────
  render(container) {
    const todayQuote = this.getDailyQuote();
    const personalMsg = this.getPersonalizedMessage();
    const data = DB.getMotivationData();
    const categories = [...new Set(this.quotes.map(q => q.category))];

    container.innerHTML = `
      <div class="page-content" style="max-width:1100px; margin:0 auto;">
        <div class="page-header" style="margin-bottom:var(--space-6);">
          <div>
            <h1 class="page-title" style="font-size:2.5rem;">✨ مكتبة الإلهام اليومي</h1>
            <p class="page-subtitle" style="font-size:1.1rem; margin-top:var(--space-2);">اقتبس من حكمة العظماء — كل يوم اقتباس جديد</p>
          </div>
        </div>

        <!-- Today's Quote Hero -->
        <div style="background:linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1)); border:1px solid rgba(124,58,237,0.25); border-radius:var(--radius-xl); padding:var(--space-8); margin-bottom:var(--space-6); text-align:center; position:relative; overflow:hidden;">
          <div style="position:absolute; top:-20px; right:-20px; font-size:100px; opacity:0.05; line-height:1;">❝</div>
          <div style="position:absolute; bottom:-20px; left:-20px; font-size:100px; opacity:0.05; line-height:1;">❞</div>
          
          <div style="font-size:11px; font-weight:800; letter-spacing:2px; color:var(--accent-purple); text-transform:uppercase; margin-bottom:var(--space-4);">اقتباس اليوم</div>
          <blockquote style="font-size:clamp(1.2rem, 2.5vw, 1.8rem); font-weight:700; color:var(--text-primary); line-height:1.7; max-width:700px; margin:0 auto var(--space-4); font-style:italic;">"${todayQuote.text}"</blockquote>
          <div style="font-size:0.95rem; color:var(--text-muted); font-weight:600; margin-bottom:var(--space-4);">— ${todayQuote.author}</div>
          <div style="display:flex; align-items:center; justify-content:center; gap:var(--space-3);">
            <span style="background:rgba(124,58,237,0.1); color:var(--accent-purple); padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700;">${todayQuote.category}</span>
            <button id="fav-today-btn" class="btn ${this.isFavorite(todayQuote.id) ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="MotivationSystem.handleFavToday(${todayQuote.id})">
              ${this.isFavorite(todayQuote.id) ? '❤️ في المفضلة' : '🤍 أضف للمفضلة'}
            </button>
          </div>
        </div>

        <!-- Personalized Message -->
        <div style="background:linear-gradient(90deg, rgba(16,185,129,0.08), transparent); border-right:4px solid var(--accent-emerald); border-radius:var(--radius-md); padding:var(--space-4); margin-bottom:var(--space-6);">
          <div style="font-size:12px; font-weight:700; color:var(--accent-emerald); margin-bottom:var(--space-2);">رسالتك الشخصية اليوم 🎯</div>
          <div style="font-size:1.05rem; font-weight:600; color:var(--text-primary);">${personalMsg}</div>
        </div>

        <!-- Category Filters -->
        <div style="display:flex; gap:var(--space-2); flex-wrap:wrap; margin-bottom:var(--space-5);">
          <button class="btn btn-primary btn-sm" id="filter-all" onclick="MotivationSystem.filterQuotes('all')">الكل (${this.quotes.length})</button>
          ${categories.map(cat => `<button class="btn btn-ghost btn-sm" id="filter-${cat}" onclick="MotivationSystem.filterQuotes('${cat}')">${cat}</button>`).join('')}
          <button class="btn btn-ghost btn-sm" id="filter-favorites" onclick="MotivationSystem.filterQuotes('favorites')">❤️ المفضلة (${data.favorites.length})</button>
        </div>

        <!-- Quotes Grid -->
        <div id="motivation-quotes-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:var(--space-4);">
          ${this.renderQuoteCards('all')}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  renderQuoteCards(filter) {
    const data = DB.getMotivationData();
    let filtered;
    if (filter === 'favorites') {
      filtered = this.quotes.filter(q => data.favorites.includes(q.id));
    } else if (filter === 'all') {
      filtered = this.quotes;
    } else {
      filtered = this.quotes.filter(q => q.category === filter);
    }

    if (filtered.length === 0) {
      return `<div style="grid-column:span 2; text-align:center; padding:var(--space-8); color:var(--text-muted);">لا توجد اقتباسات في هذا التصنيف بعد</div>`;
    }

    return filtered.map(q => {
      const fav = data.favorites.includes(q.id);
      const isToday = this.getDailyQuote().id === q.id;
      return `
        <div class="card animate-fade-in" style="position:relative; ${isToday ? 'border-color:var(--accent-purple); background:rgba(124,58,237,0.03);' : ''}">
          ${isToday ? '<div style="position:absolute; top:12px; left:12px; font-size:10px; background:var(--accent-purple); color:white; padding:2px 8px; border-radius:10px; font-weight:800;">اليوم ✨</div>' : ''}
          <div style="font-size:32px; color:var(--accent-purple); opacity:0.3; font-weight:900; line-height:1; margin-bottom:var(--space-2);">❝</div>
          <p style="font-size:0.95rem; font-weight:600; color:var(--text-primary); line-height:1.7; margin-bottom:var(--space-3); font-style:italic;">"${q.text}"</p>
          <div style="font-size:12px; color:var(--text-muted); font-weight:700; margin-bottom:var(--space-3);">— ${q.author}</div>
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="background:var(--bg-secondary); color:var(--text-muted); padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700;">${q.category}</span>
            <button class="btn btn-ghost btn-sm" style="color:${fav ? 'var(--accent-rose)' : 'var(--text-muted)'}; font-size:16px; padding:4px 8px;" 
                    onclick="MotivationSystem.handleToggleFav(${q.id}, this)">${fav ? '❤️' : '🤍'}</button>
          </div>
        </div>
      `;
    }).join('');
  },

  filterQuotes(filter) {
    const grid = document.getElementById('motivation-quotes-grid');
    if (grid) grid.innerHTML = this.renderQuoteCards(filter);

    // Update active filter buttons
    document.querySelectorAll('[id^="filter-"]').forEach(btn => btn.classList.remove('btn-primary'));
    const activeBtn = document.getElementById(`filter-${filter}`);
    if (activeBtn) { activeBtn.classList.remove('btn-ghost'); activeBtn.classList.add('btn-primary'); }
  },

  handleFavToday(quoteId) {
    const isFav = this.toggleFavorite(quoteId);
    const btn = document.getElementById('fav-today-btn');
    if (btn) {
      btn.textContent = isFav ? '❤️ في المفضلة' : '🤍 أضف للمفضلة';
      btn.className = `btn ${isFav ? 'btn-primary' : 'btn-ghost'} btn-sm`;
    }
  },

  handleToggleFav(quoteId, btnEl) {
    const isFav = this.toggleFavorite(quoteId);
    if (btnEl) {
      btnEl.textContent = isFav ? '❤️' : '🤍';
      btnEl.style.color = isFav ? 'var(--accent-rose)' : 'var(--text-muted)';
    }
    // Update favorite count in filter
    const data = DB.getMotivationData();
    const favFilterBtn = document.getElementById('filter-favorites');
    if (favFilterBtn) favFilterBtn.textContent = `❤️ المفضلة (${data.favorites.length})`;
  },
};
