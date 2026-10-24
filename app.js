// Hope 4 Recovery - Client Logic & Persistence
const STORAGE_KEY = 'hope4recovery_checkins';

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});

// Primary Check-In Handler
function handleCheckIn() {
    const checkIns = getCheckIns();
    const now = new Date();
    
    // Create new log entry
    const entry = {
        timestamp: now.toISOString(),
        formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formattedDate: now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    };

    // Save to LocalStorage
    checkIns.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns));

    // Update Interface
    updateUI();
    showEncouragingFeedback(entry);
}

// Fetch stored records
function getCheckIns() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Render dynamic interface state
function updateUI() {
    const checkIns = getCheckIns();
    const totalEl = document.getElementById('stat-total');
    const streakEl = document.getElementById('stat-streak');
    const historyList = document.getElementById('history-list');
    const emptyMsg = document.getElementById('empty-history');

    if (totalEl) totalEl.textContent = checkIns.length;
    if (streakEl) streakEl.textContent = `${calculateStreak(checkIns)} Days`;

    if (historyList) {
        historyList.innerHTML = '';
        if (checkIns.length === 0) {
            emptyMsg?.classList.remove('hidden');
        } else {
            emptyMsg?.classList.add('hidden');
            checkIns.slice(0, 10).forEach(item => {
                const li = document.createElement('li');
                li.className = 'history-item';
                li.innerHTML = `<span>${item.formattedDate}</span> <small>${item.formattedTime}</small>`;
                historyList.appendChild(li);
            });
        }
    }
}

// Simple consecutive day streak calculator
function calculateStreak(logs) {
    if (logs.length === 0) return 0;
    const days = [...new Set(logs.map(l => new Date(l.timestamp).toDateString()))];
    return days.length;
}

// Display optimistic feedback banner
function showEncouragingFeedback(entry) {
    const badge = document.getElementById('checkin-status-badge');
    const timeEl = document.getElementById('status-time');
    
    if (badge && timeEl) {
        timeEl.textContent = `Logged at ${entry.formattedTime} on ${entry.formattedDate}`;
        badge.classList.remove('hidden');
    }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

const VAPID_PUBLIC_KEY = 'BMSYaNgEQ9nh5CQs8CO9DvIt_t0GiPpQIgV9E5fszozoV6sQj_rZtG6RyrsXpFLXeHmO5YsNZ_gYXc0bX5bSkGY';

function urlBase64ToUint8Array(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function enableReminders() {
  const out = document.getElementById('sub-out');
  try {
    out.value = 'Step 1: asking permission...';
    const permission = await Notification.requestPermission();
    out.value = 'Permission: ' + permission;
    if (permission !== 'granted') return;

    out.value += '\nStep 2: waiting for service worker...';
    const reg = await navigator.serviceWorker.ready;

    out.value += '\nStep 3: subscribing...';
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    out.value = JSON.stringify(sub);
  } catch (err) {
    out.value += '\nERROR: ' + err.name + ': ' + err.message;
  }
}

document.getElementById('reminder-btn').addEventListener('click', enableReminders);