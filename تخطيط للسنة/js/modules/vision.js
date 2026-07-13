/**
 * LIFE OS — Vision Board Module
 */

const VisionModule = {
  render(container) {
    const vision = DB.getVision();

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">👁️ رؤيتي للمستقبل</h1>
            <p class="page-subtitle">حدد رؤيتك الواضحة لحياتك بعد ٥ سنوات — لوح الرؤية الشخصي</p>
          </div>
          <button class="btn btn-primary" onclick="VisionModule.save()">
            <i data-lucide="save" style="width:16px;height:16px;"></i> حفظ
          </button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5);">
          ${[
            { key: 'career',     icon: '💼', title: 'المهنة والعمل',        placeholder: 'أين أريد أن أكون مهنياً بعد ٥ سنوات؟' },
            { key: 'health',     icon: '💪', title: 'الصحة واللياقة',        placeholder: 'كيف أريد أن يكون جسدي وصحتي؟' },
            { key: 'knowledge',  icon: '📚', title: 'التعلم والمعرفة',       placeholder: 'ماذا أريد أن أتعلم وأتقن؟' },
            { key: 'financial',  icon: '💰', title: 'الاستقلال المالي',       placeholder: 'ما هي أهدافي المالية؟' },
            { key: 'spiritual',  icon: '🌟', title: 'الروحانية والأخلاق',    placeholder: 'من أريد أن أكون كشخص؟' },
            { key: 'social',     icon: '👨‍👩‍👧', title: 'العلاقات والعائلة',    placeholder: 'كيف تبدو علاقاتي المثالية؟' },
            { key: 'lifestyle',  icon: '🏡', title: 'أسلوب الحياة',          placeholder: 'كيف أريد أن تبدو حياتي اليومية؟' },
            { key: 'impact',     icon: '🌍', title: 'الأثر والإسهام',         placeholder: 'ماذا أريد أن أقدم للعالم؟' },
          ].map(area => `
            <div class="card">
              <div class="card-header" style="margin-bottom:var(--space-3);">
                <div class="card-title">
                  ${area.icon} ${area.title}
                </div>
              </div>
              <textarea id="vision-${area.key}" class="form-control" rows="4"
                        placeholder="${area.placeholder}">${vision[area.key] || ''}</textarea>
            </div>
          `).join('')}
        </div>

        <!-- Vision Statement -->
        <div class="card" style="margin-top:var(--space-5);background:linear-gradient(135deg,rgba(124,58,237,0.08),rgba(59,130,246,0.05));border-color:rgba(124,58,237,0.2);">
          <div class="card-header" style="margin-bottom:var(--space-3);">
            <div class="card-title" style="color:var(--accent-purple);">🎯 بيان رؤيتي الشخصية (Personal Vision Statement)</div>
          </div>
          <textarea id="vision-statement" class="form-control" rows="3"
                    placeholder="في جملة واحدة أو اثنتين: ما الذي يمثّلني ويحرّكني نحو المستقبل؟"
                    style="font-size:var(--font-size-md);font-weight:600;">${vision.statement || ''}</textarea>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  save() {
    const keys = ['career','health','knowledge','financial','spiritual','social','lifestyle','impact'];
    const vision = {};
    keys.forEach(k => {
      vision[k] = document.getElementById(`vision-${k}`)?.value?.trim() || '';
    });
    vision.statement = document.getElementById('vision-statement')?.value?.trim() || '';
    DB.saveVision(vision);
    Toast.show('تم حفظ رؤيتك بنجاح! 👁️', 'success');
  }
};
