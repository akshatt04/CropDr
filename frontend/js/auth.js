/* ─── Auth Logic ─── */
function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-signup').style.display = tab === 'signup' ? 'block' : 'none';
  clearErrors();
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
}

async function emailLogin() {
  clearErrors();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  let valid = true;
  if (!email || !email.includes('@')) { document.getElementById('login-email-err').classList.add('show'); valid = false; }
  if (pass.length < 6) { document.getElementById('login-pass-err').classList.add('show'); valid = false; }
  if (!valid) return;

  const btn = document.querySelector('#form-login .btn-primary');
  btn.textContent = 'Signing in…'; btn.disabled = true;
  try {
    const res  = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pass }) });
    const data = await res.json();
    if (!res.ok) { showToast('❌ ' + data.error); return; }
    setToken(data.token);
    // Since currentUser is in main.js, it's global
    currentUser = data.user;
    showToast(`✅ Welcome, ${data.user.name.split(' ')[0]}!`);
    setTimeout(() => goDashboard(), 800);
  } catch { showToast('❌ Network error. Is the backend running?'); }
  finally { btn.textContent = 'Sign In to Dashboard →'; btn.disabled = false; }
}

async function emailSignup() {
  clearErrors();
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass  = document.getElementById('signup-password').value;
  let valid = true;
  if (!name)  { document.getElementById('signup-name-err').classList.add('show');  valid = false; }
  if (!email || !email.includes('@')) { document.getElementById('signup-email-err').classList.add('show'); valid = false; }
  if (pass.length < 6) { document.getElementById('signup-pass-err').classList.add('show'); valid = false; }
  if (!valid) return;

  const btn = document.querySelector('#form-signup .btn-primary');
  btn.textContent = 'Creating account…'; btn.disabled = true;
  try {
    const res  = await fetch(`${API}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password: pass }) });
    const data = await res.json();
    if (!res.ok) { showToast('❌ ' + data.error); return; }
    setToken(data.token);
    currentUser = data.user;
    showToast(`✅ Welcome, ${data.user.name.split(' ')[0]}!`);
    setTimeout(() => goDashboard(), 800);
  } catch { showToast('❌ Network error. Is the backend running?'); }
  finally { btn.textContent = 'Create Account & Start →'; btn.disabled = false; }
}

/* ─── Google OAuth Integration ─── */
let googleClientId = null;
let googleTokenClient = null;

async function initGoogleAuth() {
  try {
    const res = await fetch(`${API}/auth/google/client-id`);
    if (res.ok) {
      const data = await res.json();
      googleClientId = data.clientId && data.clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? data.clientId : null;
      
      // If client ID is present and GIS library is loaded
      if (googleClientId && window.google?.accounts?.oauth2) {
        googleTokenClient = google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              showToast('❌ Google Sign-In error: ' + tokenResponse.error);
              return;
            }
            if (tokenResponse.access_token) {
              await completeGoogleLogin({ accessToken: tokenResponse.access_token });
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('Could not fetch Google client ID:', err);
  }
}

async function googleLogin() {
  if (!googleClientId) {
    await initGoogleAuth();
  }
  if (googleClientId && window.google?.accounts?.oauth2) {
    if (!googleTokenClient) {
      googleTokenClient = google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.access_token) {
            await completeGoogleLogin({ accessToken: tokenResponse.access_token });
          }
        }
      });
    }
    googleTokenClient.requestAccessToken({ prompt: 'select_account' });
  } else if (!googleClientId) {
    // If client ID is not yet configured, provide easy 1-click Google Demo login
    const proceed = confirm(
      'Google Client ID is not configured in backend/.env.\n\n' +
      'To test Google login now, click OK to sign in with a demo Google Farmer account.\n\n' +
      '(To use real Google accounts, add GOOGLE_CLIENT_ID to backend/.env)'
    );
    if (proceed) {
      await completeGoogleLogin({ demo: true });
    }
  } else {
    showToast('⚠️ Google service is initializing. Please try again in a few seconds.');
  }
}

async function completeGoogleLogin(payload) {
  try {
    showToast('⏳ Signing in with Google…');
    const res = await fetch(`${API}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      showToast('❌ ' + (data.error || 'Google login failed'));
      return;
    }
    setToken(data.token);
    currentUser = data.user;
    showToast(`✅ Welcome, ${data.user.name.split(' ')[0]}!`);
    setTimeout(() => goDashboard(), 800);
  } catch (err) {
    console.error('Google login error:', err);
    showToast('❌ Network error during Google sign-in.');
  }
}

window.addEventListener('load', () => {
  initGoogleAuth();
});

