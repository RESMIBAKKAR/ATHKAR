/* ============ أيقونات بسيطة (SVG) ============ */
const ICONS = {
  sunrise: '<path d="M12 2v4M4.2 8.2l2.8 2.8M2 16h2M20 16h2M17 11l2.8-2.8M12 8a5 5 0 0 0-5 5h10a5 5 0 0 0-5-5Z"/><path d="M2 20h20"/>',
  sunset: '<path d="M12 12V2M4.2 15.2l2.8-2.8M2 20h2M20 20h2M17 12.4l2.8 2.8M12 15a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5Z"/><path d="M2 20h20"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  kaaba: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h16M4 15h16" stroke-dasharray="2 2"/>',
  droplet: '<path d="M12 2s7 7.5 7 12a7 7 0 1 1-14 0c0-4.5 7-12 7-12Z"/>',
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/>',
  utensils: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M18 3c-2 1-3 3-3 6s1 3 3 3v9"/>',
  car: '<path d="M4 16V9l2-4h12l2 4v7"/><path d="M4 16h16M7 16v2M17 16v2"/><circle cx="7.5" cy="16" r="1.2"/><circle cx="16.5" cy="16" r="1.2"/>',
  heart: '<path d="M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z"/>',
  beads: '<circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="4" r="1.4"/><circle cx="12" cy="20" r="1.4"/><circle cx="20" cy="12" r="1.4"/><circle cx="4" cy="12" r="1.4"/><circle cx="17.3" cy="6.7" r="1.4"/><circle cx="6.7" cy="17.3" r="1.4"/><circle cx="17.3" cy="17.3" r="1.4"/><circle cx="6.7" cy="6.7" r="1.4"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'
};
function iconSvg(name, size=16){
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||ICONS.beads}</svg>`;
}

/* ============ الحالة والتخزين ============ */
const todayKey = () => new Date().toISOString().slice(0,10);

function loadProgress(){
  let raw = localStorage.getItem('adhkar_progress');
  let data = raw ? JSON.parse(raw) : {date: todayKey(), values: {}};
  if(data.date !== todayKey()){
    data = {date: todayKey(), values: {}};
    saveProgress(data);
  }
  return data;
}
function saveProgress(data){ localStorage.setItem('adhkar_progress', JSON.stringify(data)); }

let progress = loadProgress();
let currentCategory = ADHKAR_CATEGORIES[0].id;
let currentView = 'adhkar';

/* ============ عرض الشرائح (categories) ============ */
function renderChips(){
  const row = document.getElementById('chipRow');
  row.innerHTML = ADHKAR_CATEGORIES.map(cat => `
    <button class="chip ${cat.id===currentCategory && currentView==='adhkar' ? 'active':''}" data-cat="${cat.id}">
      ${iconSvg(cat.icon,15)} ${cat.name}
    </button>
  `).join('');
  row.querySelectorAll('.chip').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      currentCategory = btn.dataset.cat;
      currentView = 'adhkar';
      setActiveNav('adhkar');
      renderChips();
      renderAdhkarView();
    });
  });
}

/* ============ عرض الأذكار ============ */
function keyFor(catId, idx){ return catId+'_'+idx; }

function renderAdhkarView(){
  document.getElementById('chipRow').style.display = 'flex';
  const cat = ADHKAR_CATEGORIES.find(c=>c.id===currentCategory);
  const main = document.getElementById('mainView');
  const total = cat.items.length;
  const doneCount = cat.items.filter((it,idx)=> (progress.values[keyFor(cat.id,idx)]||0) >= it.count).length;
  const pct = Math.round((doneCount/total)*100);

  main.innerHTML = `
    <div class="section-title">
      <h2>${cat.name}</h2>
      <span>${doneCount} / ${total} ${cat.time ? '· '+cat.time : ''}</span>
    </div>
    <div class="progress-wrap"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div id="cardsWrap"></div>
  `;

  const wrap = document.getElementById('cardsWrap');
  wrap.innerHTML = cat.items.map((it, idx) => {
    const val = progress.values[keyFor(cat.id, idx)] || 0;
    const done = val >= it.count;
    const r = 24, circumference = 2*Math.PI*r;
    const frac = Math.min(val/it.count, 1);
    const offset = circumference*(1-frac);
    return `
    <div class="card ${done?'done':''}" data-idx="${idx}">
      <div class="dhikr-text">${it.text}</div>
      ${it.note ? `<div class="dhikr-note">${it.note}</div>` : ''}
      <div class="card-foot">
        <div>
          <div class="target-label">التكرار المطلوب: <b>${it.count}</b></div>
          <div class="done-badge">${iconSvg('beads',14)} تم الإكمال</div>
          ${!done ? `<button class="reset-mini" data-reset="${idx}">${iconSvg('sun',12)} إعادة ضبط</button>`:''}
        </div>
        <button class="count-btn ${done?'complete':''}" data-count="${idx}">
          <svg class="ring" viewBox="0 0 56 56">
            <circle class="ring-bg" cx="28" cy="28" r="${r}"></circle>
            <circle class="ring-fg" cx="28" cy="28" r="${r}" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
          </svg>
          <span class="num">${val}/${it.count}</span>
        </button>
      </div>
    </div>`;
  }).join('');

  wrap.querySelectorAll('[data-count]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = +btn.dataset.count;
      const item = cat.items[idx];
      const k = keyFor(cat.id, idx);
      let val = progress.values[k] || 0;
      if(val < item.count){
        val++;
        progress.values[k] = val;
        saveProgress(progress);
        if(navigator.vibrate) navigator.vibrate(12);
        if(val >= item.count) showToast('أحسنت! أكملت هذا الذكر ✓');
        renderAdhkarView();
      }
    });
  });
  wrap.querySelectorAll('[data-reset]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const idx = +btn.dataset.reset;
      delete progress.values[keyFor(cat.id, idx)];
      saveProgress(progress);
      renderAdhkarView();
    });
  });
}

/* ============ السبحة (تسبيح حر) ============ */
const SABHA_PHRASES = [
  'سُبْحَانَ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'اللَّهُ أَكْبَرُ',
  'لَا إِلَهَ إِلَّا اللَّهُ', 'أَسْتَغْفِرُ اللَّهَ', 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ'
];
function loadSabha(){
  let raw = localStorage.getItem('sabha_state');
  return raw ? JSON.parse(raw) : {phraseIdx:0, count:0, laps:0};
}
function saveSabha(s){ localStorage.setItem('sabha_state', JSON.stringify(s)); }
let sabha = loadSabha();

function renderSabhaView(){
  document.getElementById('chipRow').style.display = 'none';
  const main = document.getElementById('mainView');
  const beadCount = 33;
  const litCount = sabha.count>0 && sabha.count % 33 === 0 ? 33 : sabha.count % 33;
  let beads = '';
  const R = 110, cx=130, cy=130;
  for(let i=0;i<beadCount;i++){
    const angle = (i/beadCount)*2*Math.PI - Math.PI/2;
    const x = cx + R*Math.cos(angle);
    const y = cy + R*Math.sin(angle);
    beads += `<circle class="bead ${i < litCount ? 'lit':''}" cx="${x}" cy="${y}" r="6"/>`;
  }
  main.innerHTML = `
    <div class="misbaha-wrap">
      <div class="misbaha-phrase">${SABHA_PHRASES[sabha.phraseIdx]}</div>
      <div class="beads-ring">
        <svg viewBox="0 0 260 260">${beads}</svg>
        <div class="tap-circle" id="tapCircle">
          <div class="count">${litCount}</div>
          <div class="lap">الدورات: ${sabha.laps} · الإجمالي: ${sabha.count}</div>
        </div>
      </div>
      <div class="misbaha-controls">
        <button id="undoBtn">${iconSvg('sun',14)} تراجع</button>
        <button class="primary" id="resetSabha">إعادة الضبط</button>
      </div>
      <div class="phrase-chooser" id="phraseChooser"></div>
    </div>
  `;
  const chooser = document.getElementById('phraseChooser');
  chooser.innerHTML = SABHA_PHRASES.map((p,i)=>`<button class="pill-option ${i===sabha.phraseIdx?'active':''}" data-p="${i}">${p}</button>`).join('');
  chooser.querySelectorAll('[data-p]').forEach(b=>{
    b.addEventListener('click', ()=>{ sabha.phraseIdx = +b.dataset.p; saveSabha(sabha); renderSabhaView(); });
  });
  document.getElementById('tapCircle').addEventListener('click', ()=>{
    sabha.count++;
    if(sabha.count % 33 === 0) sabha.laps++;
    saveSabha(sabha);
    if(navigator.vibrate) navigator.vibrate(sabha.count%33===0 ? [15,30,15] : 10);
    renderSabhaView();
  });
  document.getElementById('undoBtn').addEventListener('click', ()=>{
    if(sabha.count>0){ sabha.count--; saveSabha(sabha); renderSabhaView(); }
  });
  document.getElementById('resetSabha').addEventListener('click', ()=>{
    sabha = {phraseIdx: sabha.phraseIdx, count:0, laps:0};
    saveSabha(sabha);
    renderSabhaView();
  });
}

/* ============ محرك التذكير ============ */
const REMINDER_KEY = 'reminder_settings';
function loadReminder(){
  let raw = localStorage.getItem(REMINDER_KEY);
  return raw ? JSON.parse(raw) : {enabled:false, minutes:30, sound:true, vibration:true, nextAt:null};
}
function saveReminder(r){ localStorage.setItem(REMINDER_KEY, JSON.stringify(r)); }
let reminder = loadReminder();
let reminderTimer = null;

const REMINDER_MESSAGES = [
  'حان وقت الذكر — سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
  'لا تنسَ نصيبك من ذكر الله ﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾',
  'قل: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
  'استغفر الله العظيم وأتوب إليه',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
  'دقيقة لذكر الله خير من دنيا وما فيها'
];

function playBeep(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 740;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.5);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime+0.55);
  }catch(e){}
}

function fireReminder(){
  const msg = REMINDER_MESSAGES[Math.floor(Math.random()*REMINDER_MESSAGES.length)];
  if(reminder.sound) playBeep();
  if(reminder.vibration && navigator.vibrate) navigator.vibrate([120,60,120]);
  if('Notification' in window && Notification.permission === 'granted'){
    if(navigator.serviceWorker && navigator.serviceWorker.ready){
      navigator.serviceWorker.ready.then(reg=>{
        reg.showNotification('حان وقت الذكر 📿', {
          body: msg,
          icon: 'icons/icon-192.png',
          badge: 'icons/icon-192.png',
          vibrate: [120,60,120],
          tag: 'adhkar-reminder'
        });
      }).catch(()=>{ new Notification('حان وقت الذكر 📿', {body: msg, icon:'icons/icon-192.png'}); });
    } else {
      new Notification('حان وقت الذكر 📿', {body: msg, icon:'icons/icon-192.png'});
    }
  } else {
    showToast('📿 '+msg);
  }
}

function scheduleReminder(){
  clearInterval(reminderTimer);
  if(!reminder.enabled) return;
  reminder.nextAt = Date.now() + reminder.minutes*60000;
  saveReminder(reminder);
  reminderTimer = setInterval(()=>{
    if(!reminder.enabled) { clearInterval(reminderTimer); return; }
    if(Date.now() >= reminder.nextAt){
      fireReminder();
      reminder.nextAt = Date.now() + reminder.minutes*60000;
      saveReminder(reminder);
      if(currentView==='reminder') renderReminderView();
    }
  }, 5000);
}
document.addEventListener('visibilitychange', ()=>{
  if(!document.hidden && reminder.enabled && reminder.nextAt && Date.now() >= reminder.nextAt){
    fireReminder();
    reminder.nextAt = Date.now() + reminder.minutes*60000;
    saveReminder(reminder);
  }
});

const INTERVAL_OPTIONS = [5,10,15,30,60];

function renderReminderView(){
  document.getElementById('chipRow').style.display = 'none';
  const main = document.getElementById('mainView');
  const permission = ('Notification' in window) ? Notification.permission : 'unsupported';
  const remainMin = reminder.enabled && reminder.nextAt ? Math.max(0, Math.ceil((reminder.nextAt-Date.now())/60000)) : null;

  main.innerHTML = `
    <div class="panel">
      <h2>التذكير بالأذكار</h2>
      <p class="sub">فعّل التذكير الدوري ليصلك تنبيه كل فترة تحددها لتذكر الله. أبقِ التطبيق مفتوحًا في الخلفية لأفضل تجربة إشعارات.</p>

      <div class="status-banner ${reminder.enabled?'':'off'}">
        <span class="dot"></span>
        <div>
          <b>${reminder.enabled ? 'التذكير مُفعّل' : 'التذكير متوقف'}</b>
          <span>${reminder.enabled ? ('التذكير القادم خلال حوالي '+remainMin+' دقيقة') : 'فعّله من الأسفل'}</span>
        </div>
      </div>

      <div class="setting-card">
        <div class="setting-row">
          <div>
            <div class="setting-title">تفعيل التذكير</div>
            <div class="setting-desc">تنبيه متكرر كل فترة زمنية محددة</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="enableToggle" ${reminder.enabled?'checked':''}>
            <span class="track"></span>
          </label>
        </div>

        <div class="setting-row" style="display:block;">
          <div class="setting-title">الفاصل الزمني بين التذكيرات</div>
          <div class="interval-select" id="intervalSelect">
            ${INTERVAL_OPTIONS.map(m=>`<button class="pill-option ${reminder.minutes===m?'active':''}" data-m="${m}">${m} د</button>`).join('')}
          </div>
          <div class="custom-interval">
            <input type="number" id="customMinutes" min="1" max="1440" placeholder="مخصص" value="${INTERVAL_OPTIONS.includes(reminder.minutes)?'':reminder.minutes}">
            <span style="font-size:12px;color:var(--muted)">دقيقة</span>
            <button id="applyCustom">تطبيق</button>
          </div>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-title">الصوت</div>
            <div class="setting-desc">تنبيه صوتي عند وصول الإشعار والتطبيق مفتوح</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="soundToggle" ${reminder.sound?'checked':''}>
            <span class="track"></span>
          </label>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-title">الاهتزاز</div>
            <div class="setting-desc">اهتزاز الهاتف مع كل تذكير</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="vibToggle" ${reminder.vibration?'checked':''}>
            <span class="track"></span>
          </label>
        </div>
      </div>

      ${permission!=='granted' ? `<div class="perm-note">لتصلك الإشعارات فعليًا خارج التطبيق، امنح إذن الإشعارات من هاتفك. اضغط زر «تفعيل التذكير» وسيُطلب منك الإذن تلقائيًا.</div>` : ''}

      <button class="misbaha-controls primary" id="testBtn" style="width:100%; justify-content:center; padding:12px; border-radius:14px; border:none; background:var(--deep); color:var(--gold-light); font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px;">
        ${iconSvg('bell',16)} إرسال تذكير تجريبي الآن
      </button>
    </div>
  `;

  document.getElementById('enableToggle').addEventListener('change', async (e)=>{
    if(e.target.checked){
      if('Notification' in window && Notification.permission === 'default'){
        await Notification.requestPermission();
      }
      reminder.enabled = true;
    } else {
      reminder.enabled = false;
    }
    saveReminder(reminder);
    scheduleReminder();
    renderReminderView();
  });
  document.querySelectorAll('#intervalSelect [data-m]').forEach(b=>{
    b.addEventListener('click', ()=>{
      reminder.minutes = +b.dataset.m;
      saveReminder(reminder);
      if(reminder.enabled) scheduleReminder();
      renderReminderView();
    });
  });
  document.getElementById('applyCustom').addEventListener('click', ()=>{
    const v = +document.getElementById('customMinutes').value;
    if(v && v>0){
      reminder.minutes = v;
      saveReminder(reminder);
      if(reminder.enabled) scheduleReminder();
      renderReminderView();
      showToast('تم ضبط الفاصل الزمني على '+v+' دقيقة');
    }
  });
  document.getElementById('soundToggle').addEventListener('change', (e)=>{
    reminder.sound = e.target.checked; saveReminder(reminder);
  });
  document.getElementById('vibToggle').addEventListener('change', (e)=>{
    reminder.vibration = e.target.checked; saveReminder(reminder);
  });
  document.getElementById('testBtn').addEventListener('click', async ()=>{
    if('Notification' in window && Notification.permission === 'default'){
      await Notification.requestPermission();
    }
    fireReminder();
  });
}

/* ============ التنقل بين الأقسام ============ */
function setActiveNav(view){
  document.querySelectorAll('.nav-btn').forEach(b=> b.classList.toggle('active', b.dataset.view===view));
}
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    currentView = btn.dataset.view;
    setActiveNav(currentView);
    if(currentView==='adhkar') renderChips(), renderAdhkarView();
    else if(currentView==='sabha') renderSabhaView();
    else if(currentView==='reminder') renderReminderView();
  });
});

/* ============ تنبيه صغير (toast) ============ */
let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2600);
}

/* ============ تثبيت التطبيق (PWA) ============ */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
});
document.getElementById('installBtn').addEventListener('click', async ()=>{
  if(deferredPrompt){
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  } else {
    showToast('لتثبيت التطبيق: افتح قائمة المتصفح واختر "إضافة إلى الشاشة الرئيسية"');
  }
});

/* ============ تسجيل Service Worker ============ */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}

/* ============ البدء ============ */
renderChips();
renderAdhkarView();
if(reminder.enabled) scheduleReminder();
