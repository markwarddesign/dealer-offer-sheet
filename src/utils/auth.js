// Simple auth utility for local/demo admin and 1hr trial

const ADMIN_PASSWORD = '4ward'; // Change as needed
const DEMO_DURATION_MS = 60 * 60 * 1000; // 1 hour

export function loginAdmin(password) {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem('miles_auth', JSON.stringify({ type: 'admin', expires: null }));
    return true;
  }
  return false;
}

export function loginDemo() {
  const expires = Date.now() + DEMO_DURATION_MS;
  localStorage.setItem('miles_auth', JSON.stringify({ type: 'demo', expires }));
}

export function isAuthenticated() {
  const data = JSON.parse(localStorage.getItem('miles_auth') || 'null');
  if (!data) return false;
  if (data.type === 'admin') return true;
  if (data.type === 'demo' && data.expires > Date.now()) return true;
  logout();
  return false;
}

export function logout() {
  localStorage.removeItem('miles_auth');
}
