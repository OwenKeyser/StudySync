// Study sessions are saved in this browser only (localStorage).
const STORAGE_KEY = 'studysync.sessions.v1';
const calendar = document.querySelector('#calendar');
const weekLabel = document.querySelector('#week-label');
const form = document.querySelector('#session-form');
const message = document.querySelector('#form-message');
const dateInput = document.querySelector('#session-date');
const formatDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = new Date();
let weekStart = startOfWeek(today);
let sessions = loadSessions();
dateInput.value = formatDate(today);

function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - result.getDay()); // Sunday
  return result;
}
function loadSessions() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(s => s && typeof s.id === 'string' && typeof s.date === 'string') : [];
  } catch { return []; }
}
function saveSessions() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); return true; }
  catch { message.textContent = 'Storage is unavailable. Changes will not be saved after reload.'; return false; }
}
function render() {
  calendar.replaceChildren();
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const dateFormat = new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric'});
  weekLabel.textContent = `${dateFormat.format(weekStart)} – ${dateFormat.format(end)}, ${end.getFullYear()}`;
  for (let day = 0; day < 7; day++) {
    const current = new Date(weekStart);
    current.setDate(current.getDate() + day);
    const iso = formatDate(current);
    const section = document.createElement('section');
    section.className = `day${iso === formatDate(new Date()) ? ' today' : ''}`;
    const heading = document.createElement('h3');
    heading.textContent = new Intl.DateTimeFormat('en-US', {weekday:'short', month:'short', day:'numeric'}).format(current);
    section.append(heading);
    const items = sessions.filter(s => s.date === iso).sort((a,b) => a.time.localeCompare(b.time));
    if (!items.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'No sessions'; section.append(empty); }
    for (const session of items) {
      const item = document.createElement('article'); item.className = 'session';
      const title = document.createElement('strong'); title.textContent = session.title;
      const details = document.createElement('small'); details.textContent = `${session.time} · ${session.duration} min · ${session.course}`;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete'; remove.setAttribute('aria-label', `Delete ${session.title}`);
      remove.addEventListener('click', () => { sessions = sessions.filter(s => s.id !== session.id); saveSessions(); render(); message.textContent = 'Session deleted.'; });
      item.append(title, details, remove); section.append(item);
    }
    calendar.append(section);
  }
}
document.querySelector('#prev-week').addEventListener('click', () => { weekStart.setDate(weekStart.getDate() - 7); render(); });
document.querySelector('#next-week').addEventListener('click', () => { weekStart.setDate(weekStart.getDate() + 7); render(); });
document.querySelector('#today').addEventListener('click', () => { weekStart = startOfWeek(new Date()); render(); });
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const title = String(data.get('title')).trim();
  const course = String(data.get('course')).trim();
  const date = String(data.get('date'));
  const time = String(data.get('time'));
  const duration = Number(data.get('duration'));
  if (!title || !course || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || !Number.isInteger(duration) || duration < 5 || duration > 480) {
    message.textContent = 'Please enter a valid title, course, date, time, and duration (5–480 minutes).'; return;
  }
  sessions.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, title, course, date, time, duration });
  const saved = saveSessions();
  weekStart = startOfWeek(new Date(`${date}T12:00:00`));
  form.reset(); dateInput.value = date; render();
  if (saved) message.textContent = 'Study session added!';
});
render();
