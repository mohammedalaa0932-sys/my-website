/**
 * LIFE OS — Daily Reflection Module
 */

const ReflectionModule = {
  render(container) {
    const key         = todayKey();
    const reflections = DB.getReflections();
    const today       = reflections[key] || {};

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">🌙 التأمل اليومي</h1>
            <p class="page-subtitle">${formatDateAr(new Date(), 'full')} — خذ لحظة لتأمل يومك</p>
          </div>
          <button class="btn btn-primary" onclick="ReflectionModule.save()">
            <i data-lucide="save" style="width:16px;height:16px;"></i> حفظ
          </button>
        </div>

        <div style="max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:var(--space-4);">

          ${[
            { id: 'wins',        icon: '🏆', title: 'إنجازات اليوم', placeholder: 'ماذا أنجزت اليوم؟ ما الأشياء التي سارت بشكل جيد؟' },
            { id: 'lessons',     icon: '📖', title: 'ما تعلمته اليوم', placeholder: 'ما الدروس أو الأفكار الجديدة التي اكتسبتها اليوم؟' },
            { id: 'improvements',icon: '📈', title: 'ما يمكن تحسينه', placeholder: 'ما الذي كان يمكن أن أفعله بشكل أفضل اليوم؟' },
            { id: 'tomorrow',    icon: '🌅', title: 'خطة الغد', placeholder: 'ما هي أهم شيء ستفعله غداً؟' },
            { id: 'gratitude',   icon: '💙', title: 'شكر وامتنان', placeholder: 'اذكر ٣ أشياء تشكر الله عليها اليوم...' },
          ].map(q => `
            <div class="card">
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
                <span style="font-size:24px;">${q.icon}</span>
                <h3 style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);">${q.title}</h3>
              </div>
              <textarea id="reflect-${q.id}" class="form-control" rows="3" placeholder="${q.placeholder}">${today[q.id] || ''}</textarea>
            </div>
          `).join('')}

          <!-- Mood Rating -->
          <div class="card">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
              <span style="font-size:24px;">😊</span>
              <h3 style="font-size:var(--font-size-sm);font-weight:700;">تقييم المزاج والطاقة</h3>
            </div>
            <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
              ${[
                { value:'5', emoji:'😄', label:'ممتاز' },
                { value:'4', emoji:'🙂', label:'جيد' },
                { value:'3', emoji:'😐', label:'عادي' },
                { value:'2', emoji:'😔', label:'سيء' },
                { value:'1', emoji:'😞', label:'سيء جداً' },
              ].map(m => `
                <label style="display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;">
                  <input type="radio" name="mood-rating" value="${m.value}" ${today.mood === m.value ? 'checked' : ''} style="display:none;">
                  <div class="mood-btn" style="font-size:28px;padding:var(--space-2);border-radius:var(--radius-md);border:2px solid ${today.mood === m.value ? 'var(--accent-purple)' : 'transparent'};cursor:pointer;transition:all 0.2s;"
                       onclick="document.querySelectorAll('.mood-btn').forEach(b=>b.style.borderColor='transparent');this.style.borderColor='var(--accent-purple)';document.querySelector('input[name=mood-rating][value=${m.value}]').checked=true;">
                    ${m.emoji}
                  </div>
                  <span style="font-size:10px;color:var(--text-muted);">${m.label}</span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Archive -->
        ${this.renderArchive(reflections, key)}
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  renderArchive(reflections, todayKey_) {
    const past = Object.entries(reflections)
      .filter(([k]) => k !== todayKey_)
      .sort(([a],[b]) => b.localeCompare(a))
      .slice(0, 5);

    if (past.length === 0) return '';

    return `
      <div style="max-width:700px;margin:var(--space-8) auto 0;">
        <div class="section-header" style="margin-bottom:var(--space-4);">
          <div class="section-title">📜 أرشيف التأمل</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3);">
          ${past.map(([dateStr, r]) => `
            <div class="card">
              <div style="font-size:var(--font-size-xs);font-weight:700;color:var(--accent-purple-light);margin-bottom:var(--space-2);">
                ${formatDateAr(new Date(dateStr), 'full')} ${r.mood ? ['','😞','😔','😐','🙂','😄'][parseInt(r.mood)] : ''}
              </div>
              ${r.wins ? `<p style="font-size:var(--font-size-xs);color:var(--text-secondary);margin-bottom:4px;">🏆 ${r.wins}</p>` : ''}
              ${r.lessons ? `<p style="font-size:var(--font-size-xs);color:var(--text-secondary);">📖 ${r.lessons}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  save() {
    const key         = todayKey();
    const reflections = DB.getReflections();
    const mood        = document.querySelector('input[name="mood-rating"]:checked')?.value || '';

    reflections[key] = {
      wins:          document.getElementById('reflect-wins')?.value?.trim() || '',
      lessons:       document.getElementById('reflect-lessons')?.value?.trim() || '',
      improvements:  document.getElementById('reflect-improvements')?.value?.trim() || '',
      tomorrow:      document.getElementById('reflect-tomorrow')?.value?.trim() || '',
      gratitude:     document.getElementById('reflect-gratitude')?.value?.trim() || '',
      mood,
      savedAt:       new Date().toISOString(),
    };
    DB.saveReflections(reflections);
    Toast.show('تم حفظ تأملك اليومي بنجاح! 🌙', 'success');
  }
};
