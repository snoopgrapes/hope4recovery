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