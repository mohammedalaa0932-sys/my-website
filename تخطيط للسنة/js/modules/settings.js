/**
 * LIFE OS — Settings & Backup Module
 * User settings, backups (import/export), statistics storage details, theme setup
 */

const SettingsModule = {
  render(container) {
    const settings = DB.getSettings();
    const storageSize = Storage.getSize();

    container.innerHTML = `
      <div class="page-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">⚙️ الإعدادات والنظام</h1>
            <p class="page-subtitle">تخصيص لوحة التحكم، إدارة النسخ الاحتياطي، وحساب مؤشراتك الشخصية</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:2fr 1fr; gap:var(--space-6);">
          <!-- General Settings -->
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            <div class="settings-section">
              <div class="settings-section-title">👤 البيانات الشخصية</div>
              
              <!-- Name -->
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">الاسم المفضل</div>
                  <div class="settings-row-hint">كيف تحب أن يخاطبك النظام في التحية؟</div>
                </div>
                <input type="text" id="settings-name" class="form-control" style="max-width:200px;" 
                       value="${settings.name || ''}" onchange="SettingsModule.saveField('name', this.value)">
              </div>

              <!-- Birthday -->
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">تاريخ الميلاد (الذكرى السنوية)</div>
                  <div class="settings-row-hint">يُستخدم لتحديد بداية سنة حياتك وحساب التنازلي.</div>
                </div>
                <input type="date" id="settings-birthday" class="form-control" style="max-width:200px;" 
                       value="${settings.birthday || '2005-05-15'}" onchange="SettingsModule.saveField('birthday', this.value)">
              </div>
            </div>

            <div class="settings-section">
              <div class="settings-section-title">🎨 التخصيص والمظهر</div>
              
              <!-- Theme -->
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">الوضع / المظهر المفضل</div>
                  <div class="settings-row-hint">التحويل بين الوضع الداكن والأنيق أو الفاتح والمريح.</div>
                </div>
                <select class="form-control" style="max-width:200px;" onchange="SettingsModule.setTheme(this.value)">
                  <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>🌌 الوضع الداكن</option>
                  <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>☀️ الوضع الفاتح</option>
                </select>
              </div>

              <!-- Number Format -->
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">تنسيق الأرقام</div>
                  <div class="settings-row-hint">الاختيار بين الأرقام الهندية (٠١٢٣) والأرقام الإنجليزية (123).</div>
                </div>
                <select class="form-control" style="max-width:200px;" onchange="SettingsModule.saveField('numberFormat', this.value)">
                  <option value="arabic" ${settings.numberFormat === 'arabic' ? 'selected' : ''}>٠١٢٣٤٥٦٧٨٩ (عربي)</option>
                  <option value="western" ${settings.numberFormat === 'western' ? 'selected' : ''}>0123456789 (إنجليزي)</option>
                </select>
              </div>

              <!-- Start of Week -->
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">بداية الأسبوع في التقويم</div>
                  <div class="settings-row-hint">تحديد اليوم الذي يبدأ به الأسبوع لديك.</div>
                </div>
                <select class="form-control" style="max-width:200px;" onchange="SettingsModule.saveField('weekStart', this.value)">
                  <option value="saturday" ${settings.weekStart === 'saturday' ? 'selected' : ''}>السبت</option>
                  <option value="sunday" ${settings.weekStart === 'sunday' ? 'selected' : ''}>الأحد</option>
                  <option value="monday" ${settings.weekStart === 'monday' ? 'selected' : ''}>الاثنين</option>
                </select>
              </div>
            </div>

            <!-- Backup and Cloud ready -->
            <div class="settings-section">
              <div class="settings-section-title">💾 النسخ الاحتياطي ومزامنة البيانات</div>
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">تصدير كافة البيانات (Export)</div>
                  <div class="settings-row-hint">تنزيل نسخة احتياطية بصيغة JSON لجميع مهامك، عاداتك، ويومياتك.</div>
                </div>
                <button class="btn btn-secondary" onclick="SettingsModule.exportData()">💾 تصدير ملف البيانات</button>
              </div>

              <div class="settings-row">
                <div>
                  <div class="settings-row-label">استيراد نسخة احتياطية (Import)</div>
                  <div class="settings-row-hint">تحميل ملف البيانات المخزن لديك مسبقاً لاسترجاع معلوماتك.</div>
                </div>
                <button class="btn btn-secondary" onclick="SettingsModule.triggerImport()">📂 استيراد البيانات</button>
                <input type="file" id="import-file-input" style="display:none;" accept=".json" onchange="SettingsModule.importData(this)">
              </div>

              <div class="settings-row">
                <div>
                  <div class="settings-row-label" style="color:var(--color-danger);">مسح كافة البيانات (Reset)</div>
                  <div class="settings-row-hint">حذف جميع عاداتك وأهدافك من المتصفح نهائياً ولا يمكن التراجع.</div>
                </div>
                <button class="btn btn-danger" onclick="SettingsModule.wipeAllData()">🗑️ مسح كامل البيانات</button>
              </div>
            </div>
          </div>

          <!-- Status & Metadata -->
          <div>
            <div class="card">
              <h3 class="card-title">📊 تفاصيل الذاكرة</h3>
              <div style="margin-top:var(--space-3); display:flex; flex-direction:column; gap:var(--space-2); font-size:var(--font-size-xs); color:var(--text-secondary);">
                <div>مساحة الاستهلاك: <strong>${toArabicNumerals(storageSize)} KB</strong></div>
                <div>محرك الحفظ الموقعي: <strong>نشط (localStorage)</strong></div>
                <div>النسخة: <strong>1.0.0 (جاهز للإنتاج)</strong></div>
                <div>التوافق السحابي: <strong>مستعد للمزامنة السحابية (API Ready)</strong></div>
              </div>
            </div>

            <div class="card" style="margin-top:var(--space-4); background:rgba(124, 58, 237, 0.08); border:1px solid rgba(124, 58, 237, 0.2);">
              <h3 class="card-title" style="color:var(--accent-purple-light);">💡 تلميحات مفيدة</h3>
              <p style="font-size:var(--font-size-xs); color:var(--text-secondary); margin-top:2px; line-height:1.7;">
                النسخ الاحتياطي المنتظم يضمن الحفاظ على سجلات يومياتك ومؤشراتك الحيوية وعاداتك. قم بتنزيل ملف النسخة الاحتياطية أسبوعياً.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  saveField(field, value) {
    const settings = DB.getSettings();
    settings[field] = value;
    DB.saveSettings(settings);
    Toast.show('تم حفظ التغييرات بنجاح!', 'success');
  },

  setTheme(theme) {
    const settings = DB.getSettings();
    settings.theme = theme;
    DB.saveSettings(settings);
    applyTheme(theme);
    Toast.show('تم تغيير سمة المظهر!', 'success');
  },

  exportData() {
    const data = Storage.getAll();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lifeos_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    Toast.show('تم تصدير نسخة البيانات بنجاح! 💾', 'success');
  },

  triggerImport() {
    document.getElementById('import-file-input')?.click();
  },

  importData(input) {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const parsed = JSON.parse(e.target.result);
        const success = Storage.import(parsed);
        if (success) {
          Toast.show('🎉 تم استيراد البيانات بنجاح! سيتم تحديث الصفحة.', 'success', 3000);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          Toast.show('عذراً، فشل استيراد البيانات.', 'error');
        }
      } catch (err) {
        Toast.show('ملف البيانات غير صالح أو تالف.', 'error');
      }
    };
    reader.readAsText(file);
  },

  wipeAllData() {
    if (confirm('⚠️ هل أنت متأكد تماماً من رغبتك في مسح كافة البيانات؟ سيتم تصفير لوحة التحكم ومسح عاداتك وذكرياتك نهائياً!')) {
      Storage.clear();
      Toast.show('تم تصفير ومسح كافة البيانات بنجاح. جاري تحديث التطبيق...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }
};
