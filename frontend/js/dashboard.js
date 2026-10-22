/* ─── Dashboard State ─── */
let detectFiles = [];
let quickFiles  = [];
let chatHistory = [];
let currentChatSessionId = null;
let cachedScans = [];  // cached scans for filtering
let viewingPastScan = false;  // true when viewing a past scan detail
let currentDiagnosisData = null;  // store diagnosis data for PDF download

/* ─── Diagnosis Modal Functions ─── */
function showDiagnosisModal(diagnosis, scanDate) {
  currentDiagnosisData = diagnosis;
  const modal = document.getElementById('diagnosis-modal');
  const bodyEl = document.getElementById('diagnosis-modal-body');
  
  if (!modal || !bodyEl) return;
  
  // Render diagnosis summary in modal
  const sev = { Early: 'badge-green', Moderate: 'badge-amber', Severe: 'badge-danger', None: 'badge-green' };
  const spread = { Low: 'badge-green', Moderate: 'badge-amber', High: 'badge-danger' };
  const isHealthy = diagnosis.diseaseDetected === 'Healthy';
  
  const summary = `
  <div class="result-box">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
      <div>
        <div style="font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;">Crop Identified</div>
        <div style="font-size:1.1rem;font-weight:800;">${diagnosis.cropType || 'Unknown'}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:.75rem;color:var(--muted);">Confidence</div>
        <div style="font-size:1.5rem;font-weight:900;color:var(--green-base);">${diagnosis.confidenceScore || 0}%</div>
      </div>
    </div>
    <div class="${isHealthy ? 'result-disease result-healthy' : 'result-disease'}">${isHealthy ? '✅' : '⚠️'} ${diagnosis.diseaseDetected}</div>
    <div class="result-badges">
      <span class="badge ${sev[diagnosis.severityLevel] || 'badge-amber'}">🎯 ${diagnosis.severityLevel}</span>
      <span class="badge ${spread[diagnosis.spreadRisk] || 'badge-amber'}">📡 Spread: ${diagnosis.spreadRisk}</span>
      <span class="badge badge-sky">💪 Recovery: ${diagnosis.recoveryChance}%</span>
    </div>
    ${diagnosis.severityPercent > 0 ? `
    <div style="margin-bottom:12px;">
      <div style="font-size:.78rem;color:var(--muted);margin-bottom:4px;">Affected Area: ${diagnosis.severityPercent}%</div>
      <div style="background:#e0e0e0;border-radius:10px;height:7px;overflow:hidden;">
        <div style="height:100%;width:${diagnosis.severityPercent}%;background:${diagnosis.severityLevel==='Severe'?'#c0392b':diagnosis.severityLevel==='Moderate'?'#e9a319':'#40916c'};border-radius:10px;"></div>
      </div>
    </div>` : ''}
    <div class="result-summary">${diagnosis.summary}</div>
    ${diagnosis.immediateAction ? `<div style="font-weight:800;color:var(--danger);font-size:.85rem;margin-bottom:12px;padding:8px 12px;background:var(--danger-light);border-radius:8px;">🚨 Now: ${diagnosis.immediateAction}</div>` : ''}
    ${diagnosis.treatmentPlan?.length ? `
    <div style="font-weight:700;font-size:.9rem;margin-bottom:8px;">🗓️ Treatment Plan</div>
    ${diagnosis.treatmentPlan.map(s => `<div class="treatment-step"><span class="step-day-badge">${s.day}</span><span class="step-action">${s.action}</span></div>`).join('')}
    ` : ''}
    ${diagnosis.organicTreatments?.length ? `<div style="margin-top:12px;padding:10px;background:var(--green-pale);border-radius:8px;"><div style="font-weight:700;font-size:.82rem;color:var(--green-dark);margin-bottom:5px;">🌿 Organic</div>${diagnosis.organicTreatments.map(t=>`<div style="font-size:.82rem;">• ${t}</div>`).join('')}</div>` : ''}
    ${diagnosis.chemicalTreatments?.length ? `<div style="margin-top:8px;padding:10px;background:var(--sky-light);border-radius:8px;"><div style="font-weight:700;font-size:.82rem;color:var(--sky);margin-bottom:5px;">🧪 Chemical</div>${diagnosis.chemicalTreatments.map(t=>`<div style="font-size:.82rem;">• ${t}</div>`).join('')}</div>` : ''}
    ${diagnosis.availablePesticides?.length ? `<div style="margin-top:8px;"><div style="font-weight:700;font-size:.82rem;margin-bottom:5px;">🏪 Available in India</div><div style="display:flex;flex-wrap:wrap;gap:5px;">${diagnosis.availablePesticides.map(p=>`<span style="background:var(--sky);color:#fff;border-radius:20px;padding:2px 9px;font-size:.75rem;">${p}</span>`).join('')}</div></div>` : ''}
    ${diagnosis.prevention?.length ? `<div style="margin-top:8px;padding:10px;background:var(--cream);border-radius:8px;border:1px solid var(--border);"><div style="font-weight:700;font-size:.82rem;margin-bottom:5px;">🛡️ Prevention</div>${diagnosis.prevention.map(p=>`<div style="font-size:.82rem;">✓ ${p}</div>`).join('')}</div>` : ''}
    <div style="margin-top:12px;padding:10px;background:var(--cream);border-radius:8px;font-size:.82rem;color:var(--muted);text-align:center;">
      Scanned on ${scanDate}
    </div>
  </div>
  `;
  
  bodyEl.innerHTML = summary;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeDiagnosisModal(event) {
  // Allow closing by clicking overlay or close button
  if (event && event.target.id !== 'diagnosis-modal') return;
  
  const modal = document.getElementById('diagnosis-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
  currentDiagnosisData = null;
}

function downloadDiagnosisPDF() {
  if (typeof html2pdf === 'undefined') {
    showToast('❌ PDF library is loading, try again in a moment.');
    return;
  }
  if (!currentDiagnosisData) return;
  
  const element = document.getElementById('diagnosis-modal-body');
  if (!element) return;
  
  const clone = element.cloneNode(true);
  clone.style.padding = '30px';
  clone.style.background = '#fff';
  clone.style.color = '#000';
  // Critical for mobile: prevent scrolling or hidden overflow from clipping the canvas
  clone.style.overflow = 'visible';
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  
  const opt = {
    margin:       10,
    filename:     'CropDr_AI_Diagnostic_Report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    // Force a desktop-like render width so the mobile responsive layout doesn't break the PDF
    html2canvas:  { scale: 2, useCORS: true, windowWidth: 800, width: 800 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(clone).save();
}

/* ─── Dashboard Init ─── */
window.initDashboard = function() {
  if (currentUser) {
    updateDashUser();
    setDashDate();
    loadWeatherWidget();
    loadScansHistory();
    loadUserScans();
    loadChatSessions();
  }
};

function updateDashUser() {
  if (!currentUser) return;
  const initials = getInitials(currentUser.name);
  const avatarEl = document.getElementById('dash-nav-avatar');
  if (avatarEl) avatarEl.textContent = initials;
  const nameEl = document.getElementById('dash-nav-name');
  if (nameEl) nameEl.textContent = currentUser.name.split(' ')[0];
  const welcomeEl = document.getElementById('dash-welcome-name');
  if (welcomeEl) welcomeEl.textContent = 'Welcome back, ' + currentUser.name.split(' ')[0];
  
  const pfAvatar = document.getElementById('profile-avatar-lg');
  if (pfAvatar) pfAvatar.textContent = initials;
  
  const pNameDisp = document.getElementById('profile-name-display');
  if (pNameDisp) pNameDisp.textContent = currentUser.name;
  
  const pEmailDisp = document.getElementById('profile-email-display');
  if (pEmailDisp) pEmailDisp.textContent = currentUser.email;
  
  const pfName = document.getElementById('pf-name');
  if (pfName) pfName.textContent = currentUser.name;
  
  const pfEmail = document.getElementById('pf-email');
  if (pfEmail) pfEmail.textContent = currentUser.email;

  const pfLocation = document.getElementById('pf-location');
  if (pfLocation) pfLocation.textContent = currentUser.location || 'Maharashtra, India';

  const pfCrops = document.getElementById('pf-crops');
  if (pfCrops) pfCrops.textContent = currentUser.primaryCrops || 'Wheat, Cotton, Soybeans';

  const pfLang = document.getElementById('pf-lang');
  if (pfLang) pfLang.textContent = currentUser.preferredLanguage || 'English / हिंदी';
}

function setDashDate() {
  const d = new Date();
  const dateEl = document.getElementById('dash-date');
  if (dateEl) dateEl.textContent = d.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function dashTab(tab) {
  const tabs = ['overview','detect','weather','history','chatbot','alerts','profile'];
  tabs.forEach(t => {
    const el = document.getElementById('dtab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
    const sb = document.getElementById('sb-' + t);
    if (sb) sb.classList.toggle('active', t === tab);
  });
  
  // Load profile-specific data when profile tab is opened
  if (tab === 'profile') {
    loadUserScans();
  }
}

/* ─── Quick Upload (Overview) ─── */
function handleQuickUpload(e) {
  quickFiles = Array.from(e.target.files).slice(0, 5);
  const prevRow = document.getElementById('quick-previews');
  if (!prevRow) return;
  prevRow.innerHTML = '';
  quickFiles.forEach((f, i) => {
    const url = URL.createObjectURL(f);
    const d = document.createElement('div'); d.className = 'preview-thumb';
    d.innerHTML = `<img src="${url}" /><button class="preview-remove" onclick="removeQuickImg(${i})">✕</button>`;
    prevRow.appendChild(d);
  });
  const btn = document.getElementById('quick-analyze-btn');
  if (btn) btn.disabled = quickFiles.length === 0;
}

function removeQuickImg(i) {
  quickFiles.splice(i, 1);
  const thumbs = document.getElementById('quick-previews')?.querySelectorAll('.preview-thumb');
  if (thumbs && thumbs[i]) thumbs[i].remove();
  const btn = document.getElementById('quick-analyze-btn');
  if (btn) btn.disabled = quickFiles.length === 0;
}

async function runQuickAnalysis() {
  if (!quickFiles.length) return;
  const resultEl = document.getElementById('quick-result');
  if (!resultEl) return;
  resultEl.innerHTML = `<div class="analyzing-spinner"><div class="spinner-leaf">🌿</div><div>AI is analyzing your crop...</div></div>`;
  const res = await callCropAI(quickFiles, 'English');
  if (res.error) { resultEl.innerHTML = `<div style="color:var(--danger);padding:12px;">${res.error}</div>`; return; }
  resultEl.innerHTML = renderResultHTML(res);
}

/* ─── Full Detect Upload ─── */
function handleDetectUpload(e) {
  detectFiles = Array.from(e.target.files).slice(0, 5);
  const prevRow = document.getElementById('det-previews');
  if (!prevRow) return;
  prevRow.innerHTML = '';
  detectFiles.forEach((f, i) => {
    const url = URL.createObjectURL(f);
    const d = document.createElement('div'); d.className = 'preview-thumb';
    d.innerHTML = `<img src="${url}" /><button class="preview-remove" onclick="removeDetectImg(${i})">✕</button>`;
    prevRow.appendChild(d);
  });
  checkDetectEnable();
}

function removeDetectImg(i) {
  detectFiles.splice(i, 1);
  const thumbs = document.getElementById('det-previews')?.querySelectorAll('.preview-thumb');
  if (thumbs && thumbs[i]) thumbs[i].remove();
  checkDetectEnable();
}

function checkDetectEnable() {
  const descEl = document.getElementById('det-desc');
  const desc = descEl ? descEl.value.trim() : '';
  const btn = document.getElementById('det-analyze-btn');
  if (btn) btn.disabled = (detectFiles.length === 0 && desc === '');
}

async function runDetectAnalysis() {
  const descEl = document.getElementById('det-desc');
  const desc = descEl ? descEl.value.trim() : '';
  if (!detectFiles.length && !desc) return;
  
  const langEl = document.getElementById('det-lang');
  const lang = langEl ? langEl.value : 'English';
  
  const resultEl = document.getElementById('det-result');
  if (!resultEl) return;
  
  resultEl.innerHTML = `<div class="analyzing-spinner"><div class="spinner-leaf">🌿</div><div>AI is analyzing your input...<br><small style="font-size:.75rem;margin-top:6px;display:block;color:var(--muted);">This may take a few seconds</small></div></div>`;
  
  const res = await callCropAI(detectFiles, lang, desc);
  if (res.error) { resultEl.innerHTML = `<div style="color:var(--danger);padding:12px;">${res.error}</div>`; return; }
  
  resultEl.innerHTML = renderResultHTML(res);
  loadScansHistory();
}

/* ─── View Past Scan Detail ─── */
async function viewScanDetail(scanId) {
  try {
    const res = await fetch(`${API}/scans/${scanId}`, { headers: authHeaders() });
    const scan = await res.json();
    if (!res.ok) throw new Error(scan.error || 'Failed to load scan');

    const result = scan.result_json ? JSON.parse(scan.result_json) : scan.result || null;
    const scanDate = new Date(scan.created_at || scan.createdAt).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

    // Prepare diagnosis data
    let diagnosis;
    if (result) {
      diagnosis = result;
    } else {
      // Fallback: create diagnosis object from scan data
      diagnosis = {
        cropType: scan.crop_type || 'Unknown',
        diseaseDetected: scan.disease_detected || 'Unknown',
        confidenceScore: scan.confidence_score || 0,
        severityLevel: scan.severity_level || 'N/A',
        spreadRisk: scan.spread_risk || 'N/A',
        recoveryChance: scan.recovery_chance || 0,
        summary: 'Scan completed. Review the details above.',
        treatmentPlan: [],
        organicTreatments: [],
        chemicalTreatments: [],
        availablePesticides: [],
        prevention: []
      };
    }

    // Show modal with diagnosis
    showDiagnosisModal(diagnosis, scanDate);
  } catch (err) {
    console.error('Failed to load scan detail:', err);
    showToast('⚠️ Failed to load scan details. ' + err.message);
  }
}

function goBackToHistory() {
  resetDetectView();
  dashTab('history');
}

function resetDetectView() {
  viewingPastScan = false;
  const uploadCard = document.getElementById('detect-upload-card');
  if (uploadCard) uploadCard.style.display = '';

  const navArea = document.getElementById('scan-detail-nav-area');
  if (navArea) { navArea.style.display = 'none'; navArea.innerHTML = ''; }

  const resultEl = document.getElementById('det-result');
  if (resultEl) {
    resultEl.innerHTML = `
      <div style="font-size:2.5rem;margin-bottom:12px;">🌱</div>
      <span data-i18n="upload_to_see">Upload images and click Analyze to see results here.</span>`;
  }
}

/* ─── Delete Scan ─── */
async function deleteScan(scanId) {
  if (!confirm('Are you sure you want to delete this scan? This cannot be undone.')) return;
  try {
    const res = await fetch(`${API}/scans/${scanId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (res.ok) {
      showToast('🗑️ Scan deleted successfully');
      loadScansHistory();
    } else {
      showToast('❌ Failed to delete scan');
    }
  } catch (err) {
    console.error('Failed to delete scan:', err);
    showToast('❌ Network error while deleting scan');
  }
}

/* ─── Filter History Table ─── */
function filterHistoryTable() {
  const searchEl = document.getElementById('history-search-input');
  const query = searchEl ? searchEl.value.trim().toLowerCase() : '';
  if (!cachedScans.length) return;

  const filtered = query
    ? cachedScans.filter(s =>
        (s.cropType || '').toLowerCase().includes(query) ||
        (s.diseaseDetected || '').toLowerCase().includes(query))
    : cachedScans;

  renderHistoryRows(filtered);
}

/* ─── AI API Call → Backend ─── */
async function callCropAI(files, language, description = '') {
  try {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    fd.append('language', language);
    if (description) fd.append('description', description);

    const res = await fetch(`${API}/analyze`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + getToken() },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Analysis failed.' };
    return data;
  } catch (err) {
    return { error: '⚠️ Network error. Make sure the backend is running at localhost:3001. ' + err.message };
  }
}

/* ─── Render Result HTML ─── */
function renderResultHTML(r) {
  const sev = { Early: 'badge-green', Moderate: 'badge-amber', Severe: 'badge-danger', None: 'badge-green' };
  const spread = { Low: 'badge-green', Moderate: 'badge-amber', High: 'badge-danger' };
  const isHealthy = r.diseaseDetected === 'Healthy';
  return `
  <div class="result-box" style="margin-top:12px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
      <div>
        <div style="font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;">Crop Identified</div>
        <div style="font-size:1.1rem;font-weight:800;">${r.cropType || 'Unknown'}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:.75rem;color:var(--muted);">Confidence</div>
        <div style="font-size:1.5rem;font-weight:900;color:var(--green-base);">${r.confidenceScore || 0}%</div>
      </div>
    </div>
    <div class="${isHealthy ? 'result-disease result-healthy' : 'result-disease'}">${isHealthy ? '✅' : '⚠️'} ${r.diseaseDetected}</div>
    <div class="result-badges">
      <span class="badge ${sev[r.severityLevel] || 'badge-amber'}">🎯 ${r.severityLevel}</span>
      <span class="badge ${spread[r.spreadRisk] || 'badge-amber'}">📡 Spread: ${r.spreadRisk}</span>
      <span class="badge badge-sky">💪 Recovery: ${r.recoveryChance}%</span>
    </div>
    ${r.severityPercent > 0 ? `
    <div style="margin-bottom:12px;">
      <div style="font-size:.78rem;color:var(--muted);margin-bottom:4px;">Affected Area: ${r.severityPercent}%</div>
      <div style="background:#e0e0e0;border-radius:10px;height:7px;overflow:hidden;">
        <div style="height:100%;width:${r.severityPercent}%;background:${r.severityLevel==='Severe'?'#c0392b':r.severityLevel==='Moderate'?'#e9a319':'#40916c'};border-radius:10px;"></div>
      </div>
    </div>` : ''}
    <div class="result-summary">${r.summary}</div>
    ${r.immediateAction ? `<div style="font-weight:800;color:var(--danger);font-size:.85rem;margin-bottom:12px;padding:8px 12px;background:var(--danger-light);border-radius:8px;">🚨 Now: ${r.immediateAction}</div>` : ''}
    ${r.treatmentPlan?.length ? `
    <div style="font-weight:700;font-size:.9rem;margin-bottom:8px;">🗓️ Treatment Plan</div>
    ${r.treatmentPlan.map(s => `<div class="treatment-step"><span class="step-day-badge">${s.day}</span><span class="step-action">${s.action}</span></div>`).join('')}
    ` : ''}
    ${r.organicTreatments?.length ? `<div style="margin-top:12px;padding:10px;background:var(--green-pale);border-radius:8px;"><div style="font-weight:700;font-size:.82rem;color:var(--green-dark);margin-bottom:5px;">🌿 Organic</div>${r.organicTreatments.map(t=>`<div style="font-size:.82rem;">• ${t}</div>`).join('')}</div>` : ''}
    ${r.chemicalTreatments?.length ? `<div style="margin-top:8px;padding:10px;background:var(--sky-light);border-radius:8px;"><div style="font-weight:700;font-size:.82rem;color:var(--sky);margin-bottom:5px;">🧪 Chemical</div>${r.chemicalTreatments.map(t=>`<div style="font-size:.82rem;">• ${t}</div>`).join('')}</div>` : ''}
    ${r.availablePesticides?.length ? `<div style="margin-top:8px;"><div style="font-weight:700;font-size:.82rem;margin-bottom:5px;">🏪 Available in India</div><div style="display:flex;flex-wrap:wrap;gap:5px;">${r.availablePesticides.map(p=>`<span style="background:var(--sky);color:#fff;border-radius:20px;padding:2px 9px;font-size:.75rem;">${p}</span>`).join('')}</div></div>` : ''}
    ${r.prevention?.length ? `<div style="margin-top:8px;padding:10px;background:var(--cream);border-radius:8px;border:1px solid var(--border);"><div style="font-weight:700;font-size:.82rem;margin-bottom:5px;">🛡️ Prevention</div>${r.prevention.map(p=>`<div style="font-size:.82rem;">✓ ${p}</div>`).join('')}</div>` : ''}
    <button class="pdf-btn" onclick="downloadPDFReport()" style="margin-top:20px;width:100%;padding:12px;background:var(--green-mid);color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">📄 Download PDF Report</button>
  </div>`;
}

function downloadPDFReport() {
  if (typeof html2pdf === 'undefined') {
    showToast('❌ PDF library is loading, try again in a moment.');
    return;
  }
  const element = document.querySelector('.result-box');
  if (!element) return;
  const clone = element.cloneNode(true);
  const btn = clone.querySelector('.pdf-btn');
  if (btn) btn.remove();
  
  clone.style.padding = '30px';
  clone.style.background = '#fff';
  clone.style.color = '#000';
  
  const opt = {
    margin:       10,
    filename:     'CropDr_AI_Diagnostic_Report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  html2pdf().set(opt).from(clone).save();
}

/* ─── Markdown Parser & Formatter for Chat ─── */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  // Fenced code blocks
  html = html.replace(/```(?:[a-zA-Z]*)\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h4 class="chat-heading">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="chat-heading">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="chat-heading">$1</h2>');
  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  // Process lists and paragraphs line-by-line
  const lines = html.split('\n');
  let result = [];
  let currentList = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (currentList) {
        result.push('</' + currentList + '>');
        currentList = null;
      }
      continue;
    }

    const ulMatch = line.match(/^[\*\-]\s+(.*)/);
    const olMatch = line.match(/^\d+[\.\)]\s+(.*)/);

    if (ulMatch) {
      if (currentList !== 'ul') {
        if (currentList) result.push('</' + currentList + '>');
        result.push('<ul class="chat-list">');
        currentList = 'ul';
      }
      result.push('<li>' + ulMatch[1] + '</li>');
    } else if (olMatch) {
      if (currentList !== 'ol') {
        if (currentList) result.push('</' + currentList + '>');
        result.push('<ol class="chat-list">');
        currentList = 'ol';
      }
      result.push('<li>' + olMatch[1] + '</li>');
    } else {
      if (currentList) {
        result.push('</' + currentList + '>');
        currentList = null;
      }
      if (line.startsWith('<h') || line.startsWith('<pre')) {
        result.push(line);
      } else {
        result.push('<p>' + line + '</p>');
      }
    }
  }
  if (currentList) result.push('</' + currentList + '>');
  return result.join('');
}

/* ─── Chatbot ─── */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function startNewChat() {
  currentChatSessionId = generateUUID();
  chatHistory = [];
  const container = document.getElementById('chat-messages');
  if (container) {
    container.innerHTML = `
      <div class="chat-msg ai">
        <p>🌱 <strong>Namaste!</strong> I'm your CropDr. AI assistant. Ask me anything about crop diseases, organic treatments, fertilizers, or Indian government schemes. I can respond in Hindi and regional languages too!</p>
      </div>
      <div class="chat-msg ai">
        <p>💡 <strong>Try asking:</strong> "Why is my wheat turning yellow?" or "What organic spray helps with fungal blight?"</p>
      </div>
    `;
  }
}

async function loadChatSessions() {
  try {
    const res = await fetch(`${API}/chat/sessions`, { headers: authHeaders() });
    const data = await res.json();
    const listEl = document.getElementById('chat-sessions-list');
    if (!listEl) return;
    
    if (!data.sessions || data.sessions.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px;font-size:.9rem;">No conversations yet.</div>';
      return;
    }
    
    listEl.innerHTML = data.sessions.map(s => {
      const firstMsg = s.first_message || 'Conversation';
      const msgText = firstMsg.length > 40 ? firstMsg.substring(0, 40) + '...' : firstMsg;
      const date = new Date(s.started_at).toLocaleDateString('en-IN', { month:'short', day:'numeric' });
      return `
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid var(--border);border-radius:8px;background:#fff;transition:all 0.2s;">
          <div onclick="loadChatSession('${s.session_id}')" style="flex:1;cursor:pointer;">
            <div style="font-size:.75rem;color:var(--muted);margin-bottom:4px;">${date}</div>
            <div style="font-size:.85rem;font-weight:600;color:var(--text);">${msgText}</div>
          </div>
          <button onclick="deleteChatSession('${s.session_id}')" style="background:none;border:none;cursor:pointer;opacity:0.5;padding:4px;font-size:1.1rem;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5" title="Delete Chat">🗑️</button>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load sessions', err);
  }
}

async function deleteChatSession(sessionId) {
  if (!confirm('Are you sure you want to delete this chat conversation?')) return;
  
  try {
    const res = await fetch(`${API}/chat/history/${sessionId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (res.ok) {
      if (currentChatSessionId === sessionId) {
        startNewChat();
      }
      loadChatSessions();
    } else {
      console.error('Failed to delete chat.');
    }
  } catch (err) {
    console.error('Failed to delete session', err);
  }
}

async function loadChatSession(sessionId) {
  currentChatSessionId = sessionId;
  try {
    const res = await fetch(`${API}/chat/history/${sessionId}`, { headers: authHeaders() });
    const data = await res.json();
    
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    chatHistory = data.messages || [];
    container.innerHTML = chatHistory.map(msg => `
      <div class="chat-msg ${msg.role === 'user' ? 'user' : 'ai'}">
        ${msg.role === 'user' ? `<p>${escapeHtml(msg.content)}</p>` : formatMarkdown(msg.content)}
      </div>
    `).join('');
    
    const endEl = document.getElementById('chat-end');
    if (endEl) endEl.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error('Failed to load session history', err);
  }
}

async function sendChatMsg() {
  const input = document.getElementById('chat-input-field');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendChatMsg('user', msg);
  chatHistory.push({ role: 'user', content: msg });

  if (!currentChatSessionId) currentChatSessionId = generateUUID();
  const isNewSession = chatHistory.length === 1;

  const langEl = document.querySelector('.lang-switch');
  const language = langEl ? langEl.options[langEl.selectedIndex].text : 'English';

  const typingEl = appendChatMsg('ai', '🌱 Thinking...');
  try {
    const res  = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message: msg, history: chatHistory.slice(-10), language: language, sessionId: currentChatSessionId }),
    });
    const data = await res.json();
    const reply = data.reply || '⚠️ Could not get a response.';
    
    if (data.sessionId) currentChatSessionId = data.sessionId;
    
    typingEl.innerHTML = formatMarkdown(reply);
    chatHistory.push({ role: 'assistant', content: reply });
    
    if (isNewSession) loadChatSessions();
  } catch {
    typingEl.innerHTML = '<p>⚠️ Connection error. Is the backend running?</p>';
  }
  const endEl = document.getElementById('chat-end');
  if (endEl) endEl.scrollIntoView({ behavior: 'smooth' });
}

function quickChat(msg) {
  const input = document.getElementById('chat-input-field');
  if (input) {
    input.value = msg;
    sendChatMsg();
  }
}

function appendChatMsg(role, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return null;
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  if (role === 'ai') {
    div.innerHTML = formatMarkdown(text);
  } else {
    div.innerHTML = `<p>${escapeHtml(text)}</p>`;
  }
  container.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth' });
  return div;
}

/* ─── Weather Widget & Location Handlers ─── */
window.changeWeatherLocation = function(loc) {
  if (!loc) return;
  localStorage.setItem('cropdr_weather_loc', loc);
  
  // Sync Overview select if options exist
  const ovSelect = document.getElementById('overview-weather-select');
  if (ovSelect) {
    let matched = false;
    for (let opt of ovSelect.options) {
      if (opt.value.toLowerCase() === loc.toLowerCase()) {
        ovSelect.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const opt = new Option(`📍 ${loc}`, loc, true, true);
      ovSelect.add(opt);
    }
  }

  // Sync Weather tab select if options exist
  const stateSelect = document.getElementById('weather-state-select');
  if (stateSelect) {
    for (let opt of stateSelect.options) {
      if (opt.value.toLowerCase() === loc.toLowerCase()) {
        stateSelect.value = opt.value;
        break;
      }
    }
  }

  // Sync custom input
  const customInput = document.getElementById('weather-custom-input');
  if (customInput) customInput.value = loc;

  loadWeatherWidget(loc);
};

window.searchCustomLocation = function() {
  const input = document.getElementById('weather-custom-input');
  if (!input) return;
  const loc = input.value.trim();
  if (!loc) {
    showToast('⚠️ Please enter a city or state name in India.');
    return;
  }
  window.changeWeatherLocation(loc);
};

async function loadWeatherWidget(requestedLoc) {
  try {
    const loc = requestedLoc || localStorage.getItem('cropdr_weather_loc') || currentUser?.location || 'Maharashtra';
    
    // Sync UI selects
    const ovSelect = document.getElementById('overview-weather-select');
    if (ovSelect) {
      for (let opt of ovSelect.options) {
        if (opt.value.toLowerCase() === loc.toLowerCase()) {
          ovSelect.value = opt.value;
          break;
        }
      }
    }
    const stateSelect = document.getElementById('weather-state-select');
    if (stateSelect) {
      for (let opt of stateSelect.options) {
        if (opt.value.toLowerCase() === loc.toLowerCase()) {
          stateSelect.value = opt.value;
          break;
        }
      }
    }

    const res  = await fetch(`${API}/weather?location=${encodeURIComponent(loc)}`);
    const w    = await res.json();
    if (!res.ok) {
      console.warn('Weather fetch error:', w.error);
      return;
    }

    // 1. Overview widget
    const ovEl = document.querySelector('#dtab-overview .weather-widget');
    if (ovEl) {
      ovEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div class="weather-temp">${w.temp}°C</div>
            <div class="weather-condition">${w.conditionEmoji || '🌤'} ${w.condition} · ${w.location}</div>
          </div>
          <div style="text-align:right;font-size:.82rem;opacity:.8;">Humidity: ${w.humidity}%<br>Rainfall: ${w.rainfall}mm</div>
        </div>
        <div class="weather-risk">
          <div class="weather-risk-title">🦠 Disease Risk: <span style="color:${w.diseaseRiskColor};font-weight:800;">${w.diseaseRisk.toUpperCase()}</span></div>
          <div class="weather-risk-desc">${w.riskReason}</div>
        </div>`;
    }

    // 2. Weather Tab Header & Current conditions
    const tabLocTitle = document.getElementById('weather-tab-location-title');
    if (tabLocTitle) tabLocTitle.textContent = w.location;

    const tabLocSub = document.getElementById('weather-tab-location-sub');
    if (tabLocSub) tabLocSub.textContent = `${w.location}, India`;

    const tabTemp = document.querySelector('#dtab-weather .weather-temp');
    if (tabTemp) tabTemp.textContent = `${w.temp}°C`;

    const tabEmoji = document.getElementById('weather-tab-emoji');
    if (tabEmoji) tabEmoji.textContent = w.conditionEmoji || '🌤';

    const tabCond = document.getElementById('weather-tab-condition-text');
    if (tabCond) tabCond.textContent = `${w.condition} · Humidity ${w.humidity}% · Rainfall ${w.rainfall}mm`;

    // 3. Multi-day forecast in Weather tab
    const forecastContainer = document.getElementById('weather-tab-forecast');
    if (forecastContainer && w.forecast) {
      forecastContainer.innerHTML = w.forecast.map(f => `
        <div style="flex:1;min-width:76px;text-align:center;background:var(--gray-50);padding:12px 8px;border-radius:8px;border:1px solid var(--border);">
          <div style="font-weight:700;font-size:.85rem;margin-bottom:6px;">${f.label || f.day}</div>
          <div style="font-size:1.8rem;margin-bottom:4px;">${f.emoji}</div>
          <div style="font-weight:800;color:var(--text);">${f.temp}°C</div>
          <div style="font-size:.7rem;color:var(--muted);margin-top:4px;">Rain: ${f.rainfall}mm</div>
        </div>
      `).join('');
    }

    // 4. Disease Risk & Advisory box in Weather tab
    const tabRiskLevel = document.getElementById('weather-tab-risk-level');
    if (tabRiskLevel) {
      tabRiskLevel.innerHTML = `🦠 Disease Risk: <span style="color:${w.diseaseRiskColor};font-weight:800;">${w.diseaseRisk.toUpperCase()}</span>`;
    }
    const tabRiskDesc = document.getElementById('weather-tab-risk-desc');
    if (tabRiskDesc) {
      tabRiskDesc.textContent = w.riskReason;
    }

    // 5. Alerts in Weather Tab & Overview Banner & Alerts Tab
    const weatherAlertsList = document.getElementById('weather-tab-alerts-list');
    const ovAlertsContainer = document.getElementById('overview-alerts-container');
    const alertsTabContainer = document.getElementById('alerts-tab-container');

    if (w.alerts && w.alerts.length > 0) {
      // Weather tab alerts
      if (weatherAlertsList) {
        weatherAlertsList.innerHTML = w.alerts.map(a => `
          <div style="padding:12px;border-radius:8px;border:1px solid var(--border);background:${a.severity==='High'?'var(--danger-light)':'var(--amber-light)'};display:flex;gap:10px;align-items:flex-start;">
            <span style="font-size:1.4rem;">${a.severity === 'High' ? '🚨' : '⚠️'}</span>
            <div>
              <div style="font-weight:700;font-size:.88rem;color:var(--text);">${a.title}</div>
              <div style="font-size:.82rem;color:var(--muted);margin-top:2px;">${a.message}</div>
              ${a.crops ? `<div style="font-size:.75rem;font-weight:600;color:var(--green-dark);margin-top:4px;">Affected crops: ${a.crops}</div>` : ''}
            </div>
          </div>
        `).join('');
      }

      // Overview Banner
      if (ovAlertsContainer) {
        const topAlert = w.alerts[0];
        const isHigh = topAlert.severity === 'High' || topAlert.severity === 'Severe';
        const bg = isHigh ? 'linear-gradient(135deg,#c0392b,#e74c3c)' : 'linear-gradient(135deg,#d35400,#e67e22)';
        ovAlertsContainer.innerHTML = `
          <div style="background:${bg};border-radius:var(--radius-lg);padding:18px 22px;color:#fff;display:flex;gap:16px;align-items:center;margin-bottom:24px;">
            <span style="font-size:2rem;">${isHigh ? '🚨' : '⚠️'}</span>
            <div style="flex:1;"><div style="font-weight:700;font-size:1rem;">Active Alert: ${topAlert.title}</div><div style="font-size:.85rem;opacity:.85;margin-top:2px;">${topAlert.message}</div></div>
            <button style="background:rgba(255,255,255,.2);color:#fff;padding:8px 16px;border-radius:8px;font-weight:700;font-size:.85rem;border:none;cursor:pointer;" onclick="dashTab('chatbot'); quickChat('What should I do about the ${topAlert.title}?')">Ask AI</button>
          </div>
        `;
      }

      // Alerts Tab
      if (alertsTabContainer) {
        alertsTabContainer.innerHTML = w.alerts.map(a => `
          <div class="alert-item">
            <div class="alert-dot" style="background:${a.severity === 'High' ? 'var(--danger)' : 'var(--amber)'};"></div>
            <span class="alert-icon">${a.severity === 'High' ? '🚨' : '⚠️'}</span>
            <div><div class="alert-title">${a.title}</div><div style="font-size:.84rem;color:var(--text);margin:3px 0 4px;">${a.message}</div><div class="alert-time">${a.timeAgo || 'Just now'} · ${w.location}</div></div>
          </div>
        `).join('');
      }
    } else {
      if (weatherAlertsList) {
        weatherAlertsList.innerHTML = '<div style="text-align:center;color:var(--muted);padding:16px;font-size:.85rem;">No active weather alerts for this region. Conditions are normal.</div>';
      }
      if (ovAlertsContainer) ovAlertsContainer.innerHTML = '';
      if (alertsTabContainer) alertsTabContainer.innerHTML = '<div style="text-align:center;color:var(--muted);padding:20px;font-size:.9rem;">No active alerts. Weather conditions are favorable!</div>';
    }
  } catch (err) { console.error('Failed to load weather widget', err); }
}

/* ─── Render History Rows (used by both load and filter) ─── */
function renderHistoryRows(scans) {
  const container = document.getElementById('history-table-container');
  if (!container) return;

  if (!scans || !scans.length) {
    container.innerHTML = `
      <div class="history-empty fade-in">
        <div class="history-empty-icon">🔍</div>
        <div class="history-empty-title">No scans found</div>
        <div class="history-empty-desc">Try a different search or run your first disease detection.</div>
        <button class="history-empty-btn" onclick="dashTab('detect'); resetDetectView()">🔬 Start New Scan</button>
      </div>`;
    return;
  }

  const headerRow = '<tr><th>Date</th><th>Crop</th><th>Disease</th><th>Confidence</th><th>Severity</th><th>Treatment</th><th>Actions</th></tr>';
  const rows = scans.map(s => {
    const date = new Date(s.createdAt).toLocaleDateString('en-IN', { month:'short', day:'numeric', year:'numeric' });
    const sevClass = { Early:'badge-green', Moderate:'badge-amber', Severe:'badge-danger', None:'badge-green' }[s.severityLevel] || 'badge-amber';
    return `<tr class="fade-in">
      <td>${date}</td>
      <td>${s.cropType}</td>
      <td>${s.diseaseDetected}</td>
      <td>${s.confidenceScore}%</td>
      <td><span class="badge ${sevClass}">${s.severityLevel}</span></td>
      <td>${s.result?.chemicalTreatments?.[0] || '—'}</td>
      <td>
        <div class="history-actions">
          <button class="history-btn history-btn-view" onclick="viewScanDetail(${s.id})" title="View full analysis">👁️ View</button>
          <button class="history-btn history-btn-delete" onclick="deleteScan(${s.id})" title="Delete scan">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  container.innerHTML = `<table class="history-table" id="history-main-table" style="width:100%;">${headerRow}${rows}</table>`;
}

/* ─── Scan History (from DB) ─── */
async function loadScansHistory() {
  try {
    const res  = await fetch(`${API}/scans`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) return;

    const { scans, stats } = data;
    cachedScans = scans; // cache for filtering

    // Update stats cards on overview
    const statEls = document.querySelectorAll('.stat-value');
    if (statEls[1]) statEls[1].textContent = stats.totalScans || 0;
    if (statEls[2]) statEls[2].textContent = stats.healthyCount || 0;
    if (statEls[3]) statEls[3].textContent = stats.diseaseCount || 0;

    // Update stat pills in history tab
    const pillsEl = document.getElementById('history-stat-pills');
    if (pillsEl) {
      pillsEl.innerHTML = `
        <div class="history-stat-pill"><span class="pill-count">${stats.totalScans || 0}</span> Total</div>
        <div class="history-stat-pill green">✅ <span class="pill-count">${stats.healthyCount || 0}</span> Healthy</div>
        <div class="history-stat-pill danger">⚠️ <span class="pill-count">${stats.diseaseCount || 0}</span> Diseased</div>`;
    }

    // Update crop health score
    const total = stats.totalScans || 0;
    const healthy = stats.healthyCount || 0;
    if (total > 0) {
      const score = Math.round((healthy / total) * 100);
      const scoreEl = document.getElementById('health-score-val');
      const labelEl = document.getElementById('health-score-label');
      const descEl = document.getElementById('health-score-desc');
      if (scoreEl) scoreEl.textContent = score;
      if (labelEl) labelEl.textContent = `out of 100 · ${score >= 70 ? 'Good Health' : score >= 40 ? 'Needs Attention' : 'Critical'}`;
      if (descEl) {
        if (score >= 70) descEl.textContent = 'Your crops are showing good health. Keep up the regular monitoring and preventive measures.';
        else if (score >= 40) descEl.textContent = 'Some of your crops need attention. Review the scans with detected diseases and follow the treatment plans.';
        else descEl.textContent = 'Multiple disease detections found. Prioritize treatment for severe cases and consult an agronomist if needed.';
      }
    }

    // Render the main history table
    if (!scans.length) {
      const container = document.getElementById('history-table-container');
      if (container) {
        container.innerHTML = `
          <div class="history-empty fade-in">
            <div class="history-empty-icon">🌾</div>
            <div class="history-empty-title">No scans yet</div>
            <div class="history-empty-desc">Start your first disease detection to see your history here.</div>
            <button class="history-empty-btn" onclick="dashTab('detect'); resetDetectView()">🔬 Start First Scan</button>
          </div>`;
      }
    } else {
      renderHistoryRows(scans);
    }


  } catch(err) { console.error('Failed to load scan history:', err); }
}

/* ─── Load User's Scans (Current User Only) ─── */
async function loadUserScans() {
  try {
    const res = await fetch(`${API}/scans`, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    const scans = data.scans || [];

    // Update Overview My Scans Table (6 columns: Date, Crop, Disease, Severity, Result, Action)
    const overviewTable = document.getElementById('overview-my-scans-table');
    if (overviewTable) {
      const headerRow = '<tr><th>Date</th><th>Crop</th><th>Disease</th><th>Severity</th><th>Result</th><th>Action</th></tr>';
      if (!scans.length) {
        overviewTable.innerHTML = `${headerRow}<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px;">No scans yet. Start your first scan!</td></tr>`;
      } else {
        const rows = scans.slice(0, 5).map(s => {
          const date = new Date(s.createdAt).toLocaleDateString('en-IN', { month:'short', day:'numeric' });
          const isHealthy = s.diseaseDetected === 'Healthy';
          const sevClass = { Early:'badge-green', Moderate:'badge-amber', Severe:'badge-danger', None:'badge-green' }[s.severityLevel] || 'badge-amber';
          const resultClass = isHealthy ? 'badge-green' : 'badge-danger';
          const resultText = isHealthy ? '✅ Healthy' : '⚠️ Disease';
          return `<tr>
            <td>${date}</td>
            <td>${s.cropType}</td>
            <td>${s.diseaseDetected}</td>
            <td><span class="badge ${sevClass}">${s.severityLevel || 'N/A'}</span></td>
            <td><span class="badge ${resultClass}">${resultText}</span></td>
            <td><button class="history-btn history-btn-view" onclick="viewScanDetail(${s.id})">👁️ View</button></td>
          </tr>`;
        }).join('');
        overviewTable.innerHTML = headerRow + rows;
      }
    }

    // Update Profile Scans Section
    const profileContainer = document.getElementById('profile-scans-container');
    if (profileContainer) {
      if (!scans.length) {
        profileContainer.innerHTML = `
          <div style="text-align:center;padding:30px;color:var(--muted);">
            <div style="font-size:2rem;margin-bottom:12px;">📭</div>
            <div style="font-size:.95rem;">No scans yet. Start your first disease detection!</div>
            <button class="history-empty-btn" style="margin-top:16px;" onclick="dashTab('detect'); resetDetectView()">🔬 Start First Scan</button>
          </div>`;
      } else {
        const scansHTML = scans.map(s => {
          const date = new Date(s.createdAt).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
          const isHealthy = s.diseaseDetected === 'Healthy';
          const resultBg = isHealthy ? 'var(--green-pale)' : 'var(--danger-light)';
          const resultColor = isHealthy ? 'var(--green-dark)' : 'var(--danger)';
          return `
            <div style="padding:14px;border:1px solid var(--border);border-radius:10px;margin-bottom:12px;background:#fff;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                <div>
                  <div style="font-size:.8rem;color:var(--muted);margin-bottom:4px;">📅 ${date}</div>
                  <div style="font-weight:700;font-size:1rem;color:var(--text);">${s.cropType}</div>
                </div>
                <button class="history-btn history-btn-view" onclick="viewScanDetail(${s.id})">👁️ View</button>
              </div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <div style="padding:4px 12px;border-radius:20px;background:${resultBg};color:${resultColor};font-weight:600;font-size:.8rem;">
                  ${isHealthy ? '✅ Healthy' : '⚠️ ' + s.diseaseDetected}
                </div>
                <div style="padding:4px 12px;border-radius:20px;background:var(--amber-light);color:var(--amber);font-weight:600;font-size:.8rem;">
                  🎯 ${s.severityLevel || 'N/A'}
                </div>
              </div>
            </div>
          `;
        }).join('');
        profileContainer.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px;">${scansHTML}</div>`;
      }
    }
  } catch(err) { console.error('Failed to load user scans:', err); }
}

/* ─── Profile Edit Functions ─── */
function openEditProfileModal() {
  if (!currentUser) return;
  const modal = document.getElementById('edit-profile-modal');
  if (!modal) return;

  document.getElementById('edit-pf-name').value = currentUser.name || '';
  document.getElementById('edit-pf-location').value = currentUser.location || '';
  document.getElementById('edit-pf-crops').value = currentUser.primaryCrops || '';
  document.getElementById('edit-pf-lang').value = currentUser.preferredLanguage || 'English';

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeEditProfileModal(event) {
  if (event && event.target.id !== 'edit-profile-modal') return;
  const modal = document.getElementById('edit-profile-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

async function handleEditProfileSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('edit-pf-name').value.trim();
  const location = document.getElementById('edit-pf-location').value.trim();
  const primaryCrops = document.getElementById('edit-pf-crops').value.trim();
  const preferredLanguage = document.getElementById('edit-pf-lang').value;

  if (!name) {
    showToast('⚠️ Name is required.');
    return;
  }

  try {
    const res = await fetch(`${API}/user/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ name, location, primaryCrops, preferredLanguage })
    });

    const data = await res.json();
    if (res.ok) {
      showToast('✅ Profile updated successfully!');
      currentUser = { ...currentUser, ...data };
      localStorage.setItem('cropdr_user', JSON.stringify(currentUser));
      updateDashUser();
      closeEditProfileModal();
    } else {
      showToast('❌ Update failed: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    console.error('Profile update error:', err);
    showToast('❌ Network error while updating profile.');
  }
}


/* ─── Voice-to-Text (Web Speech API) ─── */
(function initVoiceEngine() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    window.addEventListener('load', () => {
      document.querySelectorAll('.mic-btn').forEach(btn => btn.style.display = 'none');
    });
    window.toggleVoice = () => showToast('⚠️ Voice input is not supported in this browser. Try Chrome or Edge.');
    return;
  }

  let activeRecognition = null;
  let activeTargetId    = null;
  let activeBtnId       = null;
  let userStopped       = false;   // true only when the user clicked Stop

  function getLangCode() {
    const lang = localStorage.getItem('cropdr_lang') || 'en';
    return { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' }[lang] || 'en-IN';
  }

  function resetUI() {
    if (activeBtnId) {
      const btn = document.getElementById(activeBtnId);
      if (btn) btn.classList.remove('recording');
    }
    const detStatus = document.getElementById('det-voice-status');
    if (detStatus) detStatus.classList.remove('show');
    activeTargetId    = null;
    activeBtnId       = null;
    activeRecognition = null;
    userStopped       = false;
  }

  function stopCurrentRecognition() {
    userStopped = true;
    if (activeRecognition) {
      try { activeRecognition.stop(); } catch (_) {}
    } else {
      resetUI();
    }
  }

  window.toggleVoice = function(targetId, btnId) {
    // Already recording this target → user wants to stop
    if (activeTargetId === targetId) {
      stopCurrentRecognition();
      return;
    }

    // Recording a different target → stop it first, then start new
    if (activeRecognition) {
      stopCurrentRecognition();
    }

    const btn    = document.getElementById(btnId);
    const target = document.getElementById(targetId);
    if (!btn || !target) return;

    // Snapshot of whatever was already typed before voice started
    const baseText = target.value.trim();

    // confirmed holds all final segments accumulated so far
    let confirmed = '';

    function buildRecognition() {
      const r = new SpeechRecognition();
      r.lang            = getLangCode();
      r.interimResults  = true;   // live-stream partial words
      r.maxAlternatives = 1;
      r.continuous      = true;   // keep listening until user stops

      r.onresult = (event) => {
        let interim = '';
        // Walk only new results from this event
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            confirmed += chunk + ' ';
          } else {
            interim = chunk;
          }
        }
        // Update field: base + all confirmed words + current partial word
        const prefix = baseText ? baseText + ' ' : '';
        target.value = prefix + confirmed + interim;
        if (typeof checkDetectEnable === 'function') checkDetectEnable();
      };

      r.onerror = (event) => {
        // 'no-speech' is normal during continuous use — just ignore it silently
        // 'aborted' fires when we call .stop() ourselves — also ignore
        const fatal = { 'not-allowed': '🎤 Microphone permission denied. Please allow mic access.',
                        'network':     '🌐 Network error during voice recognition.' };
        if (fatal[event.error]) {
          showToast(fatal[event.error]);
          userStopped = true;   // treat as user stop so onend doesn't restart
        }
      };

      r.onend = () => {
        if (userStopped) {
          // User clicked Stop — clean up for real
          if (target.value) target.value = target.value.trim();
          if (typeof checkDetectEnable === 'function') checkDetectEnable();
          resetUI();
        } else {
          // Natural end of an utterance (browser paused) — restart immediately
          // to keep the mic open continuously
          try {
            activeRecognition = buildRecognition();
            activeRecognition.start();
          } catch (_) {
            // If restart fails just reset gracefully
            resetUI();
          }
        }
      };

      return r;
    }

    activeRecognition = buildRecognition();
    activeTargetId    = targetId;
    activeBtnId       = btnId;
    userStopped       = false;

    // Show recording state in UI
    btn.classList.add('recording');
    const detStatus = document.getElementById('det-voice-status');
    if (detStatus && targetId === 'det-desc') detStatus.classList.add('show');

    try {
      activeRecognition.start();
    } catch (err) {
      showToast('⚠️ Could not start voice input: ' + err.message);
      resetUI();
    }
  };
})();
