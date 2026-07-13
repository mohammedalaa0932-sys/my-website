/**
 * LIFE OS — 90-Day Challenge Module
 */

const ChallengeModule = {
  quotes: [
    { text: "الانضباط الذاتي هو الجسر بين الأهداف والإنجازات.", author: "جيم رون" },
    { text: "النجاح ليس صدفة، بل هو عمل شاق ومثابرة.", author: "بيليه" },
    { text: "لا تتوقف عندما تتعب، توقف عندما تنتهي.", author: "مجهول" },
    { text: "المستقبل يعتمد على ما تفعله اليوم.", author: "غاندي" },
    { text: "ألم الانضباط أهون بكثير من ألم الندم.", author: "جيم رون" },
    { text: "القطرات الصغيرة تصنع المحيط.", author: "مثل" },
    { text: "من لا يتقدم يتقادم.", author: "مجهول" }
  ],

  getQuote() {
    if (typeof MotivationSystem !== 'undefined') {
      return MotivationSystem.getDailyQuote();
    }
    // fallback
    const quotes = [
      { text: "الانضباط هو الجسر بين الأهداف والإنجازات.", author: "جيم رون" },
      { text: "الاستمرارية تتغلب على الحافزية.", author: "مبدأ النجاح" },
      { text: "لا تكسر السلسلة.", author: "جيري سينفيلد" },
    ];
    const day = new Date().getDay();
    return quotes[day % quotes.length];
  },

  render(container) {
    const data = DB.getChallengeData();
    const today = todayKey();
    
    // If not started yet
    if (!data.startDate) {
      this.renderStartScreen(container);
      return;
    }

    // Calculate dates and progress
    const startDate = new Date(data.startDate);
    const expectedEndDate = new Date(startDate);
    expectedEndDate.setDate(expectedEndDate.getDate() + 90);
    
    const now = new Date();
    const msDiff = now.getTime() - startDate.getTime();
    let dayNumber = Math.floor(msDiff / (1000 * 60 * 60 * 24)) + 1;
    if (dayNumber > 90) dayNumber = 90;
    
    const daysCompleted = data.logs.filter(l => l.completed).length;
    const daysRemaining = 90 - dayNumber;
    const successPercentage = dayNumber > 0 ? Math.round((daysCompleted / dayNumber) * 100) : 0;
    
    // Check if today is logged
    const todayLog = data.logs.find(l => l.date === today);
    const canCheckIn = !todayLog;

    // Badges array
    const badgeMilestones = [3, 7, 14, 21, 30, 45, 60, 75, 90];
    
    // Daily Quote from MotivationSystem
    const quote = this.getQuote();
    const isFavQuote = typeof MotivationSystem !== 'undefined' && MotivationSystem.isFavorite(quote.id);

    container.innerHTML = `
      <div class="page-content challenge-module" style="padding-bottom:100px;">
        <div class="page-header" style="text-align:center; display:flex; flex-direction:column; align-items:center;">
          <h1 class="page-title" style="color:var(--accent-emerald); font-size:2rem; font-weight:800; display:flex; align-items:center; gap:10px;">
            <i data-lucide="shield" style="width:32px;height:32px;"></i> تحدي الـ 90 يوم
          </h1>
          <p class="page-subtitle">رحلة الانضباط الرقمي والنمو الشخصي</p>
        </div>

        <!-- Dashboard Widgets -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:var(--space-4); margin-bottom:var(--space-6);">
          <!-- Circular Progress -->
          <div class="card animate-fade-in" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:var(--space-5);">
            <div style="position:relative; width:120px; height:120px;">
              <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform:rotate(-90deg);">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-tertiary)" stroke-width="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-emerald)" stroke-width="3" stroke-dasharray="${(dayNumber/90)*100}, 100" />
              </svg>
              <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center;">
                <div style="font-size:24px; font-weight:800; color:var(--accent-emerald);">${dayNumber}</div>
                <div style="font-size:10px; color:var(--text-muted);">من 90</div>
              </div>
            </div>
            <div style="margin-top:var(--space-3); font-weight:700;">اليوم الحالي</div>
          </div>

          <div class="card animate-fade-in delay-1" style="display:flex; flex-direction:column; justify-content:center;">
            <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-3);">
              <div>
                <div style="font-size:12px; color:var(--text-muted);">سلسلة الاستمرار</div>
                <div style="font-size:28px; font-weight:800; color:var(--accent-amber);">🔥 ${data.currentStreak}</div>
              </div>
              <div>
                <div style="font-size:12px; color:var(--text-muted);">أطول سلسلة</div>
                <div style="font-size:28px; font-weight:800; color:var(--text-primary);">⭐ ${data.longestStreak}</div>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:var(--space-3); padding-top:var(--space-3); border-top:1px solid var(--border-subtle);">
              <div>
                <div style="font-size:10px; color:var(--text-muted);">نسبة النجاح</div>
                <div style="font-weight:700; color:var(--accent-blue);">${successPercentage}٪</div>
              </div>
              <div>
                <div style="font-size:10px; color:var(--text-muted);">أيام مكتملة</div>
                <div style="font-weight:700; color:var(--accent-emerald);">${daysCompleted} يوم</div>
              </div>
            </div>
          </div>

          <div class="card animate-fade-in delay-2" style="display:flex; flex-direction:column; justify-content:center;">
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:var(--space-2);">تاريخ البدء</div>
            <div style="font-weight:700; margin-bottom:var(--space-3);">${formatDateAr(startDate, 'full')}</div>
            
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:var(--space-2);">تاريخ الانتهاء المتوقع</div>
            <div style="font-weight:700;">${formatDateAr(expectedEndDate, 'full')}</div>
          </div>
        </div>

        <!-- Motivation & Check-in -->
        <div style="display:grid; grid-template-columns:2fr 1fr; gap:var(--space-4); margin-bottom:var(--space-6);">
          <div class="quote-card" style="margin:0; display:flex; flex-direction:column; justify-content:center; position:relative;">
            <button onclick="ChallengeModule.toggleQuoteFav(${quote.id})" id="chall-fav-btn" style="position:absolute; top:10px; left:10px; border:none; background:none; cursor:pointer; font-size:18px; color:${isFavQuote ? 'var(--accent-rose)' : 'var(--text-muted)'}; padding:0;" title="تفضيل الاقتباس">${isFavQuote ? '❤️' : '🤍'}</button>
            <div class="quote-text" style="font-size:1.1rem; padding-left:28px;">"${quote.text}"</div>
            <div class="quote-author">— ${quote.author || 'حكمة الحياة'}</div>
            <div style="margin-top:8px; font-size:11px; font-weight:700; color:var(--accent-emerald);">${typeof MotivationSystem !== 'undefined' ? MotivationSystem.getPersonalizedMessage() : ''}</div>
          </div>
          <div class="card" style="display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
            ${canCheckIn ? `
              <div style="font-size:24px; margin-bottom:var(--space-2);">📝</div>
              <h3 style="margin-bottom:var(--space-3);">تسجيل اليوم</h3>
              <p style="font-size:var(--font-size-xs); color:var(--text-muted); margin-bottom:var(--space-3);">حان الوقت لمراجعة أداءك اليوم.</p>
              <button class="btn btn-primary" onclick="ChallengeModule.openCheckIn()">تسجيل الآن</button>
            ` : `
              <div style="font-size:32px; margin-bottom:var(--space-2); color:var(--accent-emerald);">✅</div>
              <h3 style="margin-bottom:var(--space-2);">تم التسجيل بنجاح</h3>
              <p style="font-size:var(--font-size-xs); color:var(--text-muted);">لقد قمت بتسجيل يومك. استمر!</p>
            `}
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; gap:var(--space-3); margin-bottom:var(--space-6);">
          <button class="btn btn-secondary" onclick="ChallengeModule.openFutureVision()">👁️ الرؤية المستقبلية</button>
          <button class="btn btn-ghost" style="color:var(--accent-rose);" onclick="ChallengeModule.openRelapse()">⚠️ الإبلاغ عن تعثر</button>
        </div>

        <!-- Badges -->
        <div class="card">
          <h3 class="card-title">🏅 الإنجازات والأوسمة</h3>
          <div style="display:flex; flex-wrap:wrap; gap:var(--space-4); margin-top:var(--space-4);">
            ${badgeMilestones.map(m => {
              const unlocked = data.badges.includes(m);
              return `
                <div style="display:flex; flex-direction:column; align-items:center; opacity:${unlocked ? '1' : '0.3'}; filter:${unlocked ? 'none' : 'grayscale(100%)'};">
                  <div style="width:60px; height:60px; border-radius:50%; background:var(--bg-secondary); border:2px solid ${unlocked ? 'var(--accent-amber)' : 'var(--border)'}; display:flex; align-items:center; justify-content:center; font-size:24px; margin-bottom:var(--space-2); box-shadow:${unlocked ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none'}; transition:all 0.3s ease;">
                    ${unlocked ? '🏆' : '🔒'}
                  </div>
                  <div style="font-size:10px; font-weight:700;">${m} يوم</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  renderStartScreen(container) {
    container.innerHTML = `
      <div class="page-content challenge-module" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:70vh; text-align:center;">
        <div style="width:80px; height:80px; background:rgba(16, 185, 129, 0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:var(--space-4);">
          <i data-lucide="shield" style="width:40px; height:40px; color:var(--accent-emerald);"></i>
        </div>
        <h1 style="font-size:2rem; font-weight:800; margin-bottom:var(--space-3);">تحدي الـ 90 يوم</h1>
        <p style="color:var(--text-muted); max-width:500px; margin-bottom:var(--space-5); line-height:1.6;">
          هذا التحدي مصمم لمساعدتك على بناء الانضباط الذاتي، تحسين عاداتك، والالتزام بقيمك الشخصية وأهدافك طويلة المدى.
        </p>
        <div class="card" style="text-align:right; max-width:400px; margin-bottom:var(--space-5);">
          <ul style="list-style-type:none; padding:0; margin:0; display:flex; flex-direction:column; gap:var(--space-3);">
            <li>✅ تسجيل يومي للمتابعة</li>
            <li>✅ رسائل تحفيزية متجددة</li>
            <li>✅ تتبع لسلسلة الاستمرار والإنجازات</li>
            <li>✅ التركيز على الرؤية المستقبلية</li>
          </ul>
        </div>
        <button class="btn btn-primary" style="font-size:1.1rem; padding:var(--space-3) var(--space-6);" onclick="ChallengeModule.startChallenge()">ابدأ التحدي الآن 🚀</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  startChallenge() {
    const data = DB.getChallengeData();
    data.startDate = new Date().toISOString();
    DB.saveChallengeData(data);
    Toast.show('بدأ التحدي! تمنياتنا لك بالتوفيق والالتزام.', 'success');
    renderModule('challenge');
  },

  openCheckIn() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title">تسجيل اليوم 📝</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label required">هل أكملت تحدي اليوم؟</label>
          <div style="display:flex; gap:var(--space-3);">
            <label style="display:flex; align-items:center; gap:var(--space-2); cursor:pointer;">
              <input type="radio" name="chk-completed" value="yes" checked> نعم
            </label>
            <label style="display:flex; align-items:center; gap:var(--space-2); cursor:pointer;">
              <input type="radio" name="chk-completed" value="no"> لا
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">كيف كان تحكمك بذاتك اليوم؟ (1 ضعيف - 5 ممتاز)</label>
          <input type="range" id="chk-control" min="1" max="5" value="4" style="width:100%; accent-color:var(--accent-emerald);">
          <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-top:5px;">
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">ما هو التحدي الأكبر الذي واجهته اليوم؟</label>
          <textarea id="chk-biggest" class="form-control" rows="2" placeholder="المشتتات، الكسل..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">ما الذي ساعدك على الالتزام؟</label>
          <textarea id="chk-helped" class="form-control" rows="2" placeholder="تذكر الهدف، الدعم..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">ما الذي ستحسنه غداً؟</label>
          <textarea id="chk-improve" class="form-control" rows="2"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="ChallengeModule.saveCheckIn()">حفظ التسجيل</button>
      </div>
    `;
    openModal(content);
  },

  saveCheckIn() {
    const completed = document.querySelector('input[name="chk-completed"]:checked').value === 'yes';
    const selfControl = document.getElementById('chk-control').value;
    const biggestChallenge = document.getElementById('chk-biggest').value;
    const helped = document.getElementById('chk-helped').value;
    const improvement = document.getElementById('chk-improve').value;

    const data = DB.getChallengeData();
    const today = todayKey();

    data.logs.push({
      date: today,
      completed,
      selfControl,
      biggestChallenge,
      helped,
      improvement
    });

    if (completed) {
      data.currentStreak += 1;
      if (data.currentStreak > data.longestStreak) {
        data.longestStreak = data.currentStreak;
      }
      this.checkBadges(data);
      Toast.show('رائع! يوم آخر من الالتزام والنجاح 🎉', 'success');
    } else {
      data.currentStreak = 0;
      Toast.show('لا بأس، غداً يوم جديد للبدء من جديد. 💪', 'info');
    }

    DB.saveChallengeData(data);
    closeTopModal();
    renderModule('challenge');
  },

  checkBadges(data) {
    const milestones = [3, 7, 14, 21, 30, 45, 60, 75, 90];
    let newBadge = null;
    
    milestones.forEach(m => {
      if (data.currentStreak >= m && !data.badges.includes(m)) {
        data.badges.push(m);
        newBadge = m;
      }
    });

    if (newBadge) {
      setTimeout(() => {
        Toast.show(`🏆 مبروك! حققت وسام ${newBadge} يوم!`, 'success', 5000);
      }, 1000);
    }
  },

  openRelapse() {
    const content = `
      <div class="modal-header">
        <h3 class="modal-title" style="color:var(--accent-rose);">الإبلاغ عن تعثر ⚠️</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <div style="background:rgba(244, 63, 94, 0.1); padding:var(--space-3); border-radius:var(--radius-md); border:1px solid rgba(244, 63, 94, 0.2); margin-bottom:var(--space-3);">
          <p style="font-weight:700; margin-bottom:var(--space-2);">نحن لا نحكم عليك أبداً.</p>
          <p style="font-size:var(--font-size-sm); color:var(--text-muted);">تعثر واحد لا يحدد مسارك الكامل ولا يلغي ما أنجزته. الأهم هو أن تعود للمسار فوراً.</p>
        </div>
        <p style="margin-bottom:var(--space-3);">هل ترغب في إعادة تعيين سلسلة الاستمرار للبدء من جديد؟</p>
        <label style="display:flex; align-items:center; gap:var(--space-2); cursor:pointer;">
          <input type="checkbox" id="relapse-reset" checked style="accent-color:var(--accent-rose);"> نعم، أعد تعيين سلسلة الاستمرار للبدء من جديد.
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-danger" onclick="ChallengeModule.saveRelapse()">تأكيد ومواصلة الرحلة</button>
      </div>
    `;
    openModal(content);
  },

  saveRelapse() {
    const reset = document.getElementById('relapse-reset').checked;
    const data = DB.getChallengeData();
    
    if (reset) {
      data.currentStreak = 0;
    }
    
    if (!data.logs.find(l => l.date === todayKey())) {
      data.logs.push({
        date: todayKey(),
        completed: false,
        selfControl: 1,
        biggestChallenge: 'تعثر',
        helped: '',
        improvement: 'العودة فوراً للمسار'
      });
    }

    DB.saveChallengeData(data);
    closeTopModal();
    Toast.show('سعداء بصدقك. الأهم هو الاستمرار! 💪', 'info');
    renderModule('challenge');
  },

  openFutureVision() {
    const data = DB.getChallengeData();
    const lastAnswers = data.visionAnswers.length > 0 ? data.visionAnswers[data.visionAnswers.length - 1] : {};

    const content = `
      <div class="modal-header">
        <h3 class="modal-title">الرؤية المستقبلية 👁️</h3>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <div class="modal-body">
        <p style="font-size:var(--font-size-sm); color:var(--text-muted); margin-bottom:var(--space-3);">خصص لحظات للتأمل في المستقبل لتعزيز دافعك اليوم.</p>
        
        <div class="form-group">
          <label class="form-label">أين تريد أن تكون بعد 5 سنوات؟</label>
          <textarea id="v-5years" class="form-control" rows="2">${lastAnswers.q1 || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">ما نوع الشخص الذي تريد أن تصبحه؟</label>
          <textarea id="v-person" class="form-control" rows="2">${lastAnswers.q2 || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">ما هو المسار المهني الذي تحلم به؟</label>
          <textarea id="v-career" class="form-control" rows="2">${lastAnswers.q3 || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">ما هي العادات التي ستساعدك على الوصول؟</label>
          <textarea id="v-habits" class="form-control" rows="2">${lastAnswers.q4 || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">على ماذا سيشكرك شخصك المستقبلي اليوم؟</label>
          <textarea id="v-thanks" class="form-control" rows="2">${lastAnswers.q5 || ''}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="ChallengeModule.saveFutureVision()">حفظ الرؤية</button>
      </div>
    `;
    openModal(content, {size: 'modal-lg'});
  },

  saveFutureVision() {
    const data = DB.getChallengeData();
    data.visionAnswers.push({
      date: new Date().toISOString(),
      q1: document.getElementById('v-5years').value,
      q2: document.getElementById('v-person').value,
      q3: document.getElementById('v-career').value,
      q4: document.getElementById('v-habits').value,
      q5: document.getElementById('v-thanks').value,
    });
    DB.saveChallengeData(data);
    closeTopModal();
    Toast.show('تم حفظ رؤيتك المستقبلية. اجعلها حافزك! ✨', 'success');
  },

  toggleQuoteFav(quoteId) {
    if (typeof MotivationSystem !== 'undefined') {
      const isFav = MotivationSystem.toggleFavorite(quoteId);
      const btn = document.getElementById('chall-fav-btn');
      if (btn) {
        btn.textContent = isFav ? '❤️' : '🤍';
        btn.style.color = isFav ? 'var(--accent-rose)' : 'var(--text-muted)';
      }
    }
  },
};
