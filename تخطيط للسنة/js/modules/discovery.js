/**
 * LIFE OS — Self Discovery Module
 * Guided self-reflection questions
 */

const DiscoveryModule = {
  questions: [
    { id: 'who_am_i',       ar: 'من أنا؟',                    sub: 'صف نفسك بكلمات حقيقية وصادقة', icon: '🪞' },
    { id: 'unique',         ar: 'ما الذي يجعلني مميزاً؟',     sub: 'ما هي الصفات الفريدة التي تميزك؟', icon: '⭐' },
    { id: 'enjoy',          ar: 'ما الذي أستمتع به؟',          sub: 'الأنشطة والأشياء التي تجلب لك الفرح', icon: '😄' },
    { id: 'hate',           ar: 'ما الذي أكرهه؟',              sub: 'ما يزعجك أو لا يتوافق مع قيمك', icon: '😤' },
    { id: 'strengths',      ar: 'ما هي نقاط قوتي؟',           sub: 'المهارات والصفات التي تتميز بها', icon: '💪' },
    { id: 'weaknesses',     ar: 'ما هي نقاط ضعفي؟',           sub: 'المجالات التي تحتاج إلى تطوير', icon: '🔧' },
    { id: 'values',         ar: 'ما هي القيم التي تحكمني؟',    sub: 'المبادئ الأساسية التي تسير عليها', icon: '⚖️' },
    { id: 'proud',          ar: 'ما الذي أفخر به؟',            sub: 'الإنجازات والصفات التي تجعلك فخوراً', icon: '🏆' },
    { id: 'happy',          ar: 'ما الذي يجعلني سعيداً؟',      sub: 'مصادر السعادة والرضا في حياتك', icon: '💫' },
    { id: 'fears',          ar: 'ما الذي يخيفني؟',             sub: 'المخاوف والتحديات التي تواجهك', icon: '🌊' },
    { id: 'ideal_life',     ar: 'كيف أريد حياتي أن تكون؟',    sub: 'صف حياتك المثالية بالتفصيل', icon: '🌟' },
    { id: 'remembered',     ar: 'كيف أريد أن يتذكرني الناس؟',  sub: 'ما الأثر الذي تريد أن تتركه', icon: '💎' },
    { id: 'legacy',         ar: 'ما الإرث الذي أريد تركه؟',   sub: 'كيف ستؤثر حياتك على العالم', icon: '🌍' },
    { id: 'regret',         ar: 'ما الذي سأندم عليه؟',         sub: 'ما الشيء الذي لو لم تفعله ستندم؟', icon: '⏳' },
    { id: 'purpose',        ar: 'ما هو هدفي من الحياة؟',       sub: 'ما الغرض الأعمق من وجودك؟', icon: '🎯' },
    { id: 'role_model',     ar: 'من هو نموذجي الأعلى؟',        sub: 'من تستلهم منه وماذا تعلمت؟', icon: '👑' },
  ],

  render(container) {
    const data = DB.getDiscovery();
    const answeredCount = Object.values(data).filter(v => v?.trim()).length;

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">🪞 اكتشف نفسك</h1>
            <p class="page-subtitle">رحلة عميقة للتعرف على حقيقة ذاتك وقيمك</p>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <div style="text-align:center;">
              <div style="font-size:var(--font-size-2xl);font-weight:800;color:var(--accent-purple-light);">${toArabicNumerals(answeredCount)}/${toArabicNumerals(this.questions.length)}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);">إجابات مكتملة</div>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="card" style="margin-bottom:var(--space-6);background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(59,130,246,0.05));">
          <div style="display:flex;align-items:center;gap:var(--space-4);">
            <div style="font-size:40px;">🌱</div>
            <div style="flex:1;">
              <div style="font-size:var(--font-size-sm);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-2);">
                تقدمك في رحلة اكتشاف الذات
              </div>
              <div class="progress-bar">
                <div class="progress-fill hero" style="width:${(answeredCount/this.questions.length)*100}%;"></div>
              </div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:var(--space-1);">
                ${toArabicNumerals(this.questions.length - answeredCount)} سؤال متبقي
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:var(--space-4);">
          ${this.questions.map((q, i) => this.renderQuestion(q, i, data[q.id])).join('')}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  renderQuestion(q, index, answer) {
    const hasAnswer = answer?.trim();
    return `
      <div class="discovery-question-card animate-fade-in delay-${Math.min(index % 6 + 1, 6)}"
           onclick="DiscoveryModule.openQuestion('${q.id}')">
        <div class="discovery-question-number">سؤال ${toArabicNumerals(index + 1)}</div>
        <div style="display:flex;align-items:flex-start;gap:var(--space-3);">
          <div style="font-size:32px;flex-shrink:0;">${q.icon}</div>
          <div style="flex:1;">
            <div class="discovery-question-text">${q.ar}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:var(--space-3);">${q.sub}</div>
            ${hasAnswer
              ? `<div class="discovery-answer">${answer.slice(0, 120)}${answer.length > 120 ? '...' : ''}</div>`
              : `<div class="discovery-answer empty">انقر للإجابة...</div>`
            }
          </div>
        </div>
        <div style="margin-top:var(--space-3);display:flex;justify-content:space-between;align-items:center;">
          <span class="badge ${hasAnswer ? 'badge-green' : 'badge-gray'}">${hasAnswer ? '✅ مكتمل' : '⏳ في الانتظار'}</span>
          <button class="btn btn-ghost btn-sm">
            ${hasAnswer ? 'تعديل' : 'إجابة'}
            <i data-lucide="edit-3" style="width:12px;height:12px;"></i>
          </button>
        </div>
      </div>
    `;
  },

  openQuestion(questionId) {
    const q = this.questions.find(q => q.id === questionId);
    if (!q) return;
    const data = DB.getDiscovery();
    const currentAnswer = data[questionId] || '';

    const content = `
      <div class="modal-header" style="background:linear-gradient(135deg,rgba(124,58,237,0.1),transparent);">
        <div>
          <div style="font-size:32px;margin-bottom:var(--space-2);">${q.icon}</div>
          <h3 class="modal-title">${q.ar}</h3>
          <div style="font-size:var(--font-size-sm);color:var(--text-muted);margin-top:4px;">${q.sub}</div>
        </div>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div class="modal-body">
        <textarea id="discovery-answer" class="form-control"
                  style="min-height:250px;font-size:var(--font-size-base);line-height:1.8;resize:vertical;"
                  placeholder="خذ وقتك وكن صادقاً مع نفسك...">${currentAnswer}</textarea>
        <div style="font-size:var(--font-size-xs);color:var(--text-muted);">
          💡 تذكر: هذه الإجابات لك وحدك. كن صادقاً وعميقاً في التفكير.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إغلاق</button>
        <button class="btn btn-primary" onclick="DiscoveryModule.saveAnswer('${questionId}')">
          <i data-lucide="save" style="width:16px;height:16px;"></i>
          حفظ الإجابة
        </button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
    setTimeout(() => document.getElementById('discovery-answer')?.focus(), 100);
  },

  saveAnswer(questionId) {
    const answer = document.getElementById('discovery-answer')?.value?.trim();
    const data = DB.getDiscovery();
    data[questionId] = answer || '';
    data[`${questionId}_updatedAt`] = new Date().toISOString();
    DB.saveDiscovery(data);
    closeTopModal();
    Toast.show('تم حفظ إجابتك! 🌱', 'success');
    renderModule('discovery');
  },
};

/**
 * LIFE OS — Vision Builder Module
 */
const VisionModule = {
  visions: [
    { id: 'mission',   ar: 'رسالتي في الحياة',  sub: 'لماذا أنا موجود؟ ما هو غرضي؟', icon: '🎯', color: '#7c3aed' },
    { id: 'vision',    ar: 'رؤيتي للحياة',       sub: 'ما هي الصورة الكبيرة لحياتك المثالية؟', icon: '🌟', color: '#3b82f6' },
    { id: '10year',    ar: 'رؤية ١٠ سنوات',       sub: 'كيف ستبدو حياتك بعد عشر سنوات؟', icon: '🏔️', color: '#06b6d4' },
    { id: '5year',     ar: 'رؤية ٥ سنوات',        sub: 'أين ستكون بعد خمس سنوات؟', icon: '⛰️', color: '#10b981' },
    { id: '3year',     ar: 'رؤية ٣ سنوات',        sub: 'التحولات الكبرى في ثلاث سنوات', icon: '🌄', color: '#f59e0b' },
    { id: '1year',     ar: 'رؤية هذه السنة',      sub: 'ما الذي ستحققه هذا العام؟', icon: '🎪', color: '#f43f5e' },
  ],

  render(container) {
    const data = DB.getVision();

    container.innerHTML = `
      <div class="page-content">
        <!-- Vision Hero -->
        <div class="vision-hero animate-fade-in">
          <div class="vision-hero-title">🌟 رسالتي ورؤيتي</div>
          <div class="vision-hero-subtitle">حدّد وجهتك قبل أن تبدأ رحلتك</div>
        </div>

        <!-- Vision Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:var(--space-5);">
          ${this.visions.map((v, i) => this.renderVisionCard(v, data[v.id], i)).join('')}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  renderVisionCard(vision, content, index) {
    const hasContent = content?.trim();
    return `
      <div class="vision-card animate-fade-in delay-${index % 6 + 1}" style="border-top:4px solid ${vision.color};">
        <div class="vision-card-label" style="color:${vision.color};">
          <span style="font-size:24px;">${vision.icon}</span>
          ${vision.ar}
        </div>
        <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:var(--space-3);">${vision.sub}</div>
        ${hasContent
          ? `<div style="font-size:var(--font-size-sm);color:var(--text-primary);line-height:1.8;white-space:pre-wrap;">${content.slice(0, 200)}${content.length > 200 ? '...' : ''}</div>`
          : `<div style="font-size:var(--font-size-sm);color:var(--text-muted);font-style:italic;">لم تحدد رؤيتك بعد...</div>`
        }
        <button class="btn btn-${hasContent ? 'secondary' : 'primary'} btn-sm" style="margin-top:var(--space-4);width:100%;"
                onclick="VisionModule.openVisionEditor('${vision.id}')">
          ${hasContent ? 'تعديل الرؤية' : 'تحديد الرؤية'}
          <i data-lucide="edit-3" style="width:14px;height:14px;"></i>
        </button>
      </div>
    `;
  },

  openVisionEditor(visionId) {
    const v = this.visions.find(v => v.id === visionId);
    if (!v) return;
    const data = DB.getVision();
    const current = data[visionId] || '';

    const content = `
      <div class="modal-header" style="border-bottom:3px solid ${v.color};">
        <div>
          <div style="font-size:28px;margin-bottom:var(--space-1);">${v.icon}</div>
          <h3 class="modal-title">${v.ar}</h3>
          <div style="font-size:var(--font-size-sm);color:var(--text-muted);">${v.sub}</div>
        </div>
        <button class="btn btn-ghost btn-icon" onclick="closeTopModal()">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div class="modal-body">
        <textarea id="vision-content" class="form-control"
                  style="min-height:300px;font-size:var(--font-size-base);line-height:1.9;resize:vertical;"
                  placeholder="اكتب رؤيتك بوضوح وتفصيل... تخيل أنك تعيش هذه الرؤية وصفها بدقة.">${current}</textarea>
        <div style="background:rgba(124,58,237,0.05);border-radius:var(--radius-md);padding:var(--space-3);font-size:var(--font-size-xs);color:var(--text-muted);">
          💡 <strong>نصيحة:</strong> اكتب رؤيتك بضمير المتكلم وبصيغة المضارع كأنك تعيشها الآن. كلما كانت أوضح كلما كانت أقوى.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeTopModal()">إغلاق</button>
        <button class="btn btn-primary" onclick="VisionModule.saveVision('${visionId}')">
          <i data-lucide="save" style="width:16px;height:16px;"></i>
          حفظ الرؤية
        </button>
      </div>
    `;
    openModal(content, { size: 'modal-lg' });
  },

  saveVision(visionId) {
    const content = document.getElementById('vision-content')?.value?.trim();
    const data = DB.getVision();
    data[visionId] = content || '';
    data[`${visionId}_updatedAt`] = new Date().toISOString();
    DB.saveVision(data);
    closeTopModal();
    Toast.show('تم حفظ الرؤية! 🌟', 'success');
    renderModule('vision');
  },
};
