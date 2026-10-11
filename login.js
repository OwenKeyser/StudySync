// Milestone prototype only: no authentication server or protected routes.
// Do not store the entered password or use real credentials.
const loginForm = document.querySelector('#login-form');
const loginMessage = document.querySelector('#login-message');
loginForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;
  const email = document.querySelector('#email').value.trim();
  if (!email) { loginMessage.textContent = 'Please enter your email.'; return; }
  try { sessionStorage.setItem('studysync.demoEmail', email); }
  catch { /* Demo navigation still works without session storage. */ }
  // Password is deliberately not read, checked, transmitted, or saved.
  window.location.assign('dashboard.html');
});
