/**
 * LIFE OS — Gratitude Module
 */
const GratitudeModule = {
  render(container) {
    const key = todayKey();
    const allGratitude = DB.getGratitude();
    const today = allGratitude[key] || { items: ['','',''] };
    const history = Object.entries(allGratitude)
      .filter(([k]) => k !== key)
      .sort(([a],[b]) => b.localeCompare(a))
      .slice(0, 14);

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">💚 الامتنان</h1>
            <p class="page-subtitle">ابدأ يومك بامتنان وستجد المزيد مما تشكر عليه</p>
          </div>
        </div>

        <!-- Today's Gratitude -->
        <div class="card" style="background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.05));border-color:rgba(16,185,129,0.2);margin-bottom:var(--space-6);">
          <div style="text-align:center;margin-bottom:var(--space-6);">
            <div style="font-size:48px;margin-bottom:var(--space-2);">🙏</div>
            <h2 style="font-size:var(--font-size-xl);font-weight:700;color:var(--text-primary);">ما الذي تشكر الله عليه اليوم؟</h2>
            <div style="font-size:var(--font-size-sm);color:var(--text-muted);">${formatDateAr(new Date(), 'full')}</div>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--space-4);">
            ${[0,1,2].map(i => `
              <div class="gratitude-input-wrapper">
                <div class="gratitude-number">${toArabicNumerals(i+1)}</div>
                <input type="text" id="gratitude-${i}" class="form-control"
                       style="flex:1;font-size:var(--font-size-base);"
                       placeholder="${['أنا ممتن لـ...', 'شيء آخر أشكر عليه...', 'شيء ثالث أقدّره...'][i]}"
                       value="${today.items?.[i] || ''}">
              </div>
            `).join('')}
          </div>

          <div style="text-align:center;margin-top:var(--space-5);">
            <button class="btn btn-primary btn-lg" onclick="GratitudeModule.saveToday()">
              <i data-lucide="save" style="width:18px;height:18px;"></i>
              حفظ امتناني اليوم
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);margin-bottom:var(--space-6);">
          <div class="stat-card" style="text-align:center;">
            <div style="font-size:28px;">📅</div>
            <div class="stat-card-value" style="color:var(--color-success);">${toArabicNumerals(Object.keys(allGratitude).length)}</div>
            <div class="stat-card-label">أيام تسجيل</div>
          </div>
          <div class="stat-card" style="text-align:center;">
            <div style="font-size:28px;">💎</div>
            <div class="stat-card-value" style="color:var(--accent-amber);">
              ${toArabicNumerals(Object.values(allGratitude).reduce((s,d) => s + (d.items||[]).filter(Boolean).length, 0))}
            </div>
            <div class="stat-card-label">إجمالي الامتنانات</div>
          </div>
          <div class="stat-card" style="text-align:center;">
            <div style="font-size:28px;">🔥</div>
            <div class="stat-card-value" style="color:var(--accent-rose);">${toArabicNumerals(this.getStreak(allGratitude))}</div>
            <div class="stat-card-label">سلسلة أيام</div>
          </div>
        </div>

        <!-- History -->
        ${history.length > 0 ? `
          <div class="section-header">
            <div class="section-title">📜 سجل الامتنان</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--space-3);">
            ${history.map(([dateStr, data]) => `
              <div class="card" style="background:rgba(16,185,129,0.05);">
                <div style="font-size:var(--font-size-xs);color:var(--color-success);font-weight:700;margin-bottom:var(--space-2);">
                  🌿 ${formatDateAr(new Date(dateStr), 'short')}
                </div>
                ${(data.items||[]).filter(Boolean).map((item, i) => `
                  <div style="display:flex;gap:var(--space-2);font-size:var(--font-size-sm);color:var(--text-secondary);margin-bottom:4px;">
                    <span style="color:var(--color-success);font-weight:700;">${toArabicNumerals(i+1)}.</span>
                    <span>${item}</span>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  saveToday() {
    const key = todayKey();
    const allGratitude = DB.getGratitude();
    const items = [0,1,2].map(i => document.getElementById(`gratitude-${i}`)?.value?.trim() || '');
    if (items.every(i => !i)) { Toast.show('الرجاء كتابة شيء واحد على الأقل', 'error'); return; }
    allGratitude[key] = { items, savedAt: new Date().toISOString() };
    DB.saveGratitude(allGratitude);
    Toast.show('🙏 شكراً! الامتنان يجلب البركة والسعادة', 'success', 4000);
    renderModule('gratitude');
  },

  getStreak(data) {
    let streak = 0;
    let date = new Date();
    while (true) {
      const key = date.toISOString().split('T')[0];
      if (data[key]?.items?.some(Boolean)) { streak++; date.setDate(date.getDate()-1); }
      else break;
    }
    return streak;
  },
};

/**
 * LIFE OS — Reflection Module
 */
const ReflectionModule = {
  render(container) {
    const key = todayKey();
    const allReflections = DB.getReflections();
    const today = allReflections[key] || {};
    const history = Object.entries(allReflections)
      .filter(([k]) => k !== key)
      .sort(([a],[b]) => b.localeCompare(a))
      .slice(0, 7);

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">🌙 التأمل اليومي</h1>
            <p class="page-subtitle">راجع يومك قبل النوم وتعلم منه</p>
          </div>
        </div>

        <!-- Today's Reflection -->
        <div class="card" style="background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(124,58,237,0.05));border-color:rgba(99,102,241,0.2);margin-bottom:var(--space-6);">
          <div style="text-align:center;margin-bottom:var(--space-5);">
            <div style="font-size:48px;">🌙</div>
            <h2 style="font-size:var(--font-size-xl);font-weight:700;color:var(--text-primary);">كيف كان يومك؟</h2>
            <div style="font-size:var(--font-size-sm);color:var(--text-muted);">${formatDateAr(new Date(), 'full')}</div>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--space-5);">
            <!-- Mission Complete? -->
            <div>
              <div class="reflection-question">🎯 هل أكملت مهمة اليوم؟</div>
              <div style="display:flex;gap:var(--space-3);">
                <button class="btn ${today.mission_done === true ? 'btn-success' : 'btn-secondary'}"
                        onclick="ReflectionModule.setField('mission_done', true)">✅ نعم</button>
                <button class="btn ${today.mission_done === false ? 'btn-danger' : 'btn-secondary'}"
                        onclick="ReflectionModule.setField('mission_done', false)">❌ لا</button>
              </div>
            </div>

            <!-- Went Well -->
            <div>
              <div class="reflection-question">✅ ما الذي سار بشكل جيد اليوم؟</div>
              <textarea id="reflect-good" class="form-control" rows="3"
                        placeholder="اذكر الأشياء التي نجحت فيها...">${today.went_well || ''}</textarea>
            </div>

            <!-- Went Wrong -->
            <div>
              <div class="reflection-question">❌ ما الذي لم يسر كما خططت؟</div>
              <textarea id="reflect-bad" class="form-control" rows="3"
                        placeholder="ما التحديات التي واجهتها؟">${today.went_wrong || ''}</textarea>
            </div>

            <!-- Learned -->
            <div>
              <div class="reflection-question">💡 ماذا تعلمت اليوم؟</div>
              <textarea id="reflect-learned" class="form-control" rows="3"
                        placeholder="درس واحد على الأقل من يومك...">${today.learned || ''}</textarea>
            </div>

            <!-- Tomorrow -->
            <div>
              <div class="reflection-question">🚀 ما الذي ستحسّنه غداً؟</div>
              <textarea id="reflect-tomorrow" class="form-control" rows="3"
                        placeholder="خطوة واحدة نحو يوم أفضل...">${today.improve_tomorrow || ''}</textarea>
            </div>

            <!-- Day Rating -->
            <div>
              <div class="reflection-question">⭐ قيّم يومك من ١ إلى ١٠</div>
              <div class="day-rating">
                ${Array.from({length:10},(_, i) => i+1).map(n => `
                  <button class="rating-btn ${today.rating === n ? 'selected' : ''}"
                          onclick="ReflectionModule.setRating(${n})">
                    ${toArabicNumerals(n)}
                  </button>
                `).join('')}
              </div>
              <input type="hidden" id="reflect-rating" value="${today.rating || ''}">
            </div>
          </div>

          <div style="text-align:center;margin-top:var(--space-6);">
            <button class="btn btn-primary btn-lg" onclick="ReflectionModule.saveReflection()">
              <i data-lucide="save" style="width:18px;height:18px;"></i>
              حفظ تأملات اليوم
            </button>
          </div>
        </div>

        <!-- History -->
        ${history.length > 0 ? `
          <div class="section-header">
            <div class="section-title">📜 سجل التأملات</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            ${history.map(([dateStr, r]) => `
              <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);">
                  <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${formatDateAr(new Date(dateStr),'short')}</div>
                  <div style="display:flex;gap:var(--space-2);">
                    ${r.rating ? `<span class="badge badge-amber">⭐ ${toArabicNumerals(r.rating)}/١٠</span>` : ''}
                    ${r.mission_done === true ? `<span class="badge badge-green">✅ أكمل المهمة</span>` : r.mission_done === false ? `<span class="badge badge-rose">❌ لم يكمل</span>` : ''}
                  </div>
                </div>
                ${r.went_well ? `<div style="font-size:var(--font-size-sm);color:var(--text-secondary);">✅ ${r.went_well.slice(0,100)}</div>` : ''}
                ${r.learned ? `<div style="font-size:var(--font-size-sm);color:var(--text-secondary);margin-top:4px;">💡 ${r.learned.slice(0,100)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    if (window.lucide) lucide.createIcons();

    // Restore hidden field
    document.getElementById('reflect-rating').value = today.rating || '';
  },

  setField(field, value) {
    const key = todayKey();
    const allReflections = DB.getReflections();
    if (!allReflections[key]) allReflections[key] = {};
    allReflections[key][field] = value;
    DB.saveReflections(allReflections);
    renderModule('reflection');
  },

  setRating(n) {
    document.getElementById('reflect-rating').value = n;
    document.querySelectorAll('.rating-btn').forEach((btn, i) => {
      btn.classList.toggle('selected', i + 1 === n);
    });
    // Save immediately
    const key = todayKey();
    const allReflections = DB.getReflections();
    if (!allReflections[key]) allReflections[key] = {};
    allReflections[key].rating = n;
    DB.saveReflections(allReflections);
  },

  saveReflection() {
    const key = todayKey();
    const allReflections = DB.getReflections();
    if (!allReflections[key]) allReflections[key] = {};
    Object.assign(allReflections[key], {
      went_well:       document.getElementById('reflect-good')?.value?.trim() || '',
      went_wrong:      document.getElementById('reflect-bad')?.value?.trim() || '',
      learned:         document.getElementById('reflect-learned')?.value?.trim() || '',
      improve_tomorrow: document.getElementById('reflect-tomorrow')?.value?.trim() || '',
      rating:          parseInt(document.getElementById('reflect-rating')?.value) || null,
      savedAt: new Date().toISOString(),
    });
    DB.saveReflections(allReflections);
    Toast.show('🌙 أحسنت! تأملك يساعدك على النمو', 'success', 4000);
    renderModule('reflection');
  },
};
