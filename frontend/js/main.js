/* ─── Translations ─── */
const translations = {
  en: {
    nav_home: "Home", nav_features: "Features", nav_about: "About", nav_get_started: "Get Started", nav_logout: "Logout",
    sb_main: "Main", sb_overview: "Overview", sb_detect: "Detect Disease", sb_weather: "Weather Risk",
    sb_tools: "Tools", sb_history: "History", sb_chatbot: "AI Chat", sb_alerts: "Alerts",
    sb_account: "Account", sb_profile: "Profile", sb_logout: "Logout",
    hero_badge: "🤖 AI-Powered · Made for Indian Farmers",
    hero_title: "Protect Your Crops with Intelligent Detection",
    hero_subtitle: "Upload photos of your crops and get instant AI-powered disease diagnosis, stage-wise treatment plans, weather risk predictions, and government scheme recommendations — in your language.",
    btn_hero_primary: "🚀 Start Free Analysis",
    btn_hero_secondary: "Learn More ↓",
    quick_scan: "🔬 Quick Disease Scan",
    upload_photos: "Upload Crop Photos",
    analyze_btn: "🧠 Analyze with AI",
    weather_risk_today: "🌦️ Weather Risk Today",
    recent_scans: "📜 Recent Scans",
    dash_greeting_ai: "AI Analysis",
    dash_title_detect: "Detect Crop Disease",
    upload_images_5: "📸 Upload Images (up to 5)",
    tap_to_choose: "Tap to choose crop photos",
    multiple_angles: "Multiple angles = higher accuracy",
    problem_desc: "Problem Description (Optional)",
    desc_placeholder: "Describe the symptoms, e.g., 'Yellow spots on leaves for 3 days...'",
    response_language: "Response Language",
    analysis_results: "📋 Analysis Results",
    upload_to_see: "Upload images and click Analyze to see results here."
  },
  hi: {
    nav_home: "होम", nav_features: "विशेषताएं", nav_about: "हमारे बारे में", nav_get_started: "शुरू करें", nav_logout: "लॉग आउट",
    sb_main: "मुख्य", sb_overview: "अवलोकन", sb_detect: "रोग का पता लगाएं", sb_weather: "मौसम जोखिम",
    sb_tools: "उपकरण", sb_history: "इतिहास", sb_chatbot: "एआई चैट", sb_alerts: "अलर्ट",
    sb_account: "खाता", sb_profile: "प्रोफ़ाइल", sb_logout: "लॉग आउट",
    hero_badge: "🤖 AI-संचालित · भारतीय किसानों के लिए निर्मित",
    hero_title: "बुद्धिमान पहचान से अपनी फसलों की रक्षा करें",
    hero_subtitle: "अपनी फसलों की तस्वीरें अपलोड करें और तुरंत AI-संचालित रोग निदान, चरण-वार उपचार योजनाएं, मौसम जोखिम भविष्यवाणियां और सरकारी योजना सिफारिशें प्राप्त करें - अपनी भाषा में।",
    btn_hero_primary: "🚀 मुफ्त जांच शुरू करें",
    btn_hero_secondary: "और जानें ↓",
    quick_scan: "🔬 त्वरित रोग जांच",
    upload_photos: "फसल की तस्वीरें अपलोड करें",
    analyze_btn: "🧠 AI से जांच करें",
    weather_risk_today: "🌦️ आज का मौसम जोखिम",
    recent_scans: "📜 हाल के स्कैन",
    dash_greeting_ai: "AI विश्लेषण",
    dash_title_detect: "फसल रोग का पता लगाएं",
    upload_images_5: "📸 तस्वीरें अपलोड करें (5 तक)",
    tap_to_choose: "तस्वीरें चुनने के लिए टैप करें",
    multiple_angles: "कई कोण = उच्च सटीकता",
    problem_desc: "समस्या का विवरण (वैकल्पिक)",
    desc_placeholder: "लक्षणों का वर्णन करें, जैसे, 'पत्तियों पर पीले धब्बे...'",
    response_language: "प्रतिक्रिया की भाषा",
    analysis_results: "📋 विश्लेषण परिणाम",
    upload_to_see: "तस्वीरें अपलोड करें और परिणाम देखने के लिए जांच करें पर क्लिक करें।"
  },
  mr: {
    nav_home: "मुख्यपृष्ठ", nav_features: "वैशिष्ट्ये", nav_about: "आमच्याबद्दल", nav_get_started: "सुरू करा", nav_logout: "लॉग आउट",
    sb_main: "मुख्य", sb_overview: "आढावा", sb_detect: "रोग शोधा", sb_weather: "हवामान धोका",
    sb_tools: "साधने", sb_history: "इतिहास", sb_chatbot: "एआय चॅट", sb_alerts: "अलर्ट",
    sb_account: "खाते", sb_profile: "प्रोफाइल", sb_logout: "लॉग आउट",
    hero_badge: "🤖 AI-सक्षम · भारतीय शेतकऱ्यांसाठी बनवलेले",
    hero_title: "स्मार्ट ओळखीसह आपल्या पिकांचे संरक्षण करा",
    hero_subtitle: "आपल्या पिकांचे फोटो अपलोड करा आणि त्वरित AI-आधारित रोग निदान, टप्प्याटप्प्याने उपचार योजना, हवामान धोका अंदाज आणि सरकारी योजना शिफारसी मिळवा — आपल्या भाषेत.",
    btn_hero_primary: "🚀 मोफत विश्लेषण सुरू करा",
    btn_hero_secondary: "अधिक जाणून घ्या ↓",
    quick_scan: "🔬 जलद रोग स्कॅन",
    upload_photos: "पिकाचे फोटो अपलोड करा",
    analyze_btn: "🧠 AI द्वारे विश्लेषण करा",
    weather_risk_today: "🌦️ आजचा हवामान धोका",
    recent_scans: "📜 अलीकडील स्कॅन",
    dash_greeting_ai: "AI विश्लेषण",
    dash_title_detect: "पिकाचा रोग ओळखा",
    upload_images_5: "📸 फोटो अपलोड करा (५ पर्यंत)",
    tap_to_choose: "फोटो निवडण्यासाठी टॅप करा",
    multiple_angles: "अनेक कोन = उच्च अचूकता",
    problem_desc: "समस्येचे वर्णन (पर्यायी)",
    desc_placeholder: "लक्षणे वर्णन करा, जसे, 'पानांवर पिवळे डाग...'",
    response_language: "प्रतिसाद भाषा",
    analysis_results: "📋 विश्लेषणाचे परिणाम",
    upload_to_see: "फोटो अपलोड करा आणि परिणाम पाहण्यासाठी विश्लेषण करा वर क्लिक करा."
  }
};

let currentLang = localStorage.getItem('cropdr_lang') || 'en';

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('cropdr_lang', lang);
  document.querySelectorAll('.lang-switch').forEach(el => el.value = lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });

  const detLang = document.getElementById('det-lang');
  if (detLang) {
    if (lang === 'en') detLang.value = 'English';
    else if (lang === 'hi') detLang.value = 'हिंदी (Hindi)';
    else if (lang === 'mr') detLang.value = 'मराठी (Marathi)';
  }
}

/* ─── Config ─── */
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
const API = isLocal
  ? (window.location.port === '3001' ? '/api' : 'http://localhost:3001/api')
  : '/api';

/* ─── State ─── */
let currentUser = null;

/* ─── Auth helpers ─── */
function getToken() { return localStorage.getItem('cropdr_token'); }
function setToken(t) { localStorage.setItem('cropdr_token', t); }
function clearToken() { localStorage.removeItem('cropdr_token'); }

function authHeaders() {
  return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' };
}

function getInitials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'U';
}

/* ─── Page Router & Nav ─── */
function goHome() { window.location.href = 'index.html'; }
function goAuth() { window.location.href = 'auth.html'; }
function goDashboard() { window.location.href = 'dashboard.html'; }

function updateNav() {
  const guest = document.getElementById('nav-links-guest');
  const user = document.getElementById('nav-user');
  const logoutBtn = document.getElementById('nav-logout-btn');
  if (logoutBtn) logoutBtn.style.display = currentUser ? 'block' : 'none';
  if (!guest && !user) return; // not on landing page
  
  if (currentUser) {
    if(guest) guest.style.display = 'none';
    if(user) user.style.display = 'flex';
    const initials = getInitials(currentUser.name);
    const navAvatar = document.getElementById('nav-avatar');
    const navUserName = document.getElementById('nav-user-name');
    if(navAvatar) navAvatar.textContent = initials;
    if(navUserName) navUserName.textContent = currentUser.name.split(' ')[0];
  } else {
    if(guest) guest.style.display = 'flex';
    if(user) user.style.display = 'none';
  }
}

function logout() {
  currentUser = null;
  clearToken();
  showToast('👋 Logged out successfully.');
  setTimeout(() => goHome(), 800);
}

/* ─── Toast ─── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

/* ─── Scroll Reveal ─── */
function initRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ─── Global Init ─── */
window.addEventListener('load', async () => {
  // Apply saved language immediately
  switchLanguage(currentLang);
  
  const loader = document.getElementById('page-loading');
  
  const token = getToken();
  if (token) {
    try {
      const res = await fetch(`${API}/user/profile`, { headers: { 'Authorization': 'Bearer ' + token } });
      if (res.ok) {
        const user = await res.json();
        currentUser = { ...user, token };
        updateNav();
        
        // If on auth page and logged in, redirect to dashboard
        if (window.location.pathname.includes('auth.html')) {
          goDashboard();
        }
        
        // Initialize dashboard safely now that user data is loaded
        if (typeof window.initDashboard === 'function') {
          window.initDashboard();
        }
      } else { clearToken(); }
    } catch { clearToken(); }
  } else {
    // If on dashboard and NOT logged in, redirect to auth
    if (window.location.pathname.includes('dashboard.html')) {
      goAuth();
    }
  }
  
  setTimeout(() => {
    if(loader) loader.classList.add('hidden');
    initRevealObserver();
  }, 1000);
});
