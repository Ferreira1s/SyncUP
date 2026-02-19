// App State and Navigation Logic

const STATE = {
    view: 'landing', // landing, create, availability, results
    user: null, // { name, id }
    group: null // { id, name, slots: {} }
};

// DOM Elements
const mainContent = document.getElementById('main-content');

// Simple Router/Renderer
function render() {
    mainContent.innerHTML = '';

    switch (STATE.view) {
        case 'landing':
            renderLanding();
            break;
        case 'create':
            renderCreateGroup();
            break;
        case 'availability':
            renderAvailabilityGrid();
            break;
        case 'results':
            renderResults();
            break;
        default:
            renderLanding();
    }
}

// --- Views ---

function renderLanding() {
    const container = document.createElement('div');
    container.className = 'view-content';
    container.innerHTML = `
        <div class="card">
            <h2>Welcome!</h2>
            <p style="margin-bottom: var(--spacing-lg); color: var(--text-muted)">
                Organize your hangout in seconds. No more group chat chaos.
            </p>
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md)">
                <button id="btn-create" class="btn">Start a New Plan</button>
                <button id="btn-join" class="btn secondary">Join Existing Plan</button>
            </div>
        </div>
    `;

    container.querySelector('#btn-create').addEventListener('click', () => {
        STATE.view = 'create';
        render();
    });

    container.querySelector('#btn-join').addEventListener('click', () => {
        // For MVP demo, we'll just go to create/join flow. 
        // In real app, this would ask for a code.
        alert('Join feature coming in next step!');
    });

    mainContent.appendChild(container);
}

function renderCreateGroup() {
    const container = document.createElement('div');
    container.className = 'view-content card';
    container.innerHTML = `
        <h3 style="margin-bottom: var(--spacing-md)">Name your event</h3>
        <input type="text" id="event-name" placeholder="e.g. Friday Dinner, Coffee at Joe's" autofocus>
        <button id="btn-next" class="btn" style="margin-top: var(--spacing-lg)">Next</button>
        <button id="btn-back" class="btn secondary" style="margin-top: var(--spacing-sm)">Back</button>
    `;

    mainContent.appendChild(container);

    const input = container.querySelector('#event-name');
    const btnNext = container.querySelector('#btn-next');

    btnNext.addEventListener('click', () => {
        if (!input.value.trim()) {
            showNotification('Please enter a name!', 'error');
            return;
        }
        STATE.group = {
            id: Date.now().toString(36),
            name: input.value,
            slots: {}
        };
        // Next: Ask for user name, then show grid
        // For brevity, let's just assume we go to availability and prompt for name there
        STATE.view = 'availability';
        render();
    });

    container.querySelector('#btn-back').addEventListener('click', () => {
        STATE.view = 'landing';
        render();
    });
}


// --- Availability Grid Logic ---

function renderAvailabilityGrid() {
    // Generate dates (Next 7 days for MVP)
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push({
            date: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate()
        });
    }

    // Generate hours (e.g., 8 AM to 11 PM)
    const hours = [];
    for (let i = 8; i <= 23; i++) {
        hours.push(i);
    }

    const container = document.createElement('div');
    container.className = 'view-content card';
    container.style.maxWidth = '800px'; // Wider for grid
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md)">
            <h3>Select your free times</h3>
            <button id="btn-done" class="btn" style="width: auto; padding: 8px 24px">Done</button>
        </div>
        <p style="margin-bottom: var(--spacing-md); color: var(--text-muted)">Click and drag to paint your availability.</p>
        
        <div class="grid-container" style="display: grid; grid-template-columns: 50px repeat(7, 1fr); gap: 4px; overflow-x: auto;">
            <!-- Header Row -->
            <div></div> <!-- Empty top-left -->
            ${dates.map(d => `
                <div style="text-align: center; font-size: 0.9rem;">
                    <div style="font-weight: bold; color: var(--accent)">${d.dayName}</div>
                    <div style="color: var(--text-muted)">${d.dayNum}</div>
                </div>
            `).join('')}

            <!-- Time Rows -->
            ${hours.map(h => `
                <div style="text-align: right; font-size: 0.8rem; color: var(--text-muted); padding-right: 8px; transform: translateY(-50%); height: 30px;">
                    ${h}:00
                </div>
                ${dates.map(d => `
                    <div class="grid-cell" 
                         data-day="${d.date}" 
                         data-hour="${h}"
                         style="
                            background: rgba(255,255,255,0.05); 
                            border-radius: 4px; 
                            height: 30px; 
                            cursor: pointer;
                            transition: background 0.1s;
                         "></div>
                `).join('')}
            `).join('')}
        </div>
    `;

    mainContent.appendChild(container);

    // Interaction Logic
    let isDragging = false;
    let isPainting = true; // true = selecting, false = deselecting
    const cells = container.querySelectorAll('.grid-cell');

    const toggleCell = (cell) => {
        if (isPainting) {
            cell.classList.add('selected');
            cell.style.background = 'var(--success)';
        } else {
            cell.classList.remove('selected');
            cell.style.background = 'rgba(255,255,255,0.05)';
        }
    };

    cells.forEach(cell => {
        cell.addEventListener('mousedown', (e) => {
            isDragging = true;
            // Determine mode based on start cell state
            isPainting = !cell.classList.contains('selected');
            toggleCell(cell);
            e.preventDefault(); // Prevent text selection
        });

        cell.addEventListener('mouseenter', () => {
            if (isDragging) toggleCell(cell);
        });
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Done Button
    container.querySelector('#btn-done').addEventListener('click', () => {
        // Collect selected slots
        const selected = [];
        container.querySelectorAll('.grid-cell.selected').forEach(cell => {
            selected.push(`${cell.dataset.day}T${cell.dataset.hour}`);
        });

        if (selected.length === 0) {
            showNotification('Please select at least one time!', 'error');
            return;
        }

        // Save to state (Mocking current user for now)
        if (!STATE.user) STATE.user = { id: 'me', name: 'Me' }; // Fallback if skipped

        // Add to group data
        // In a real app, we'd push to an array of users. Here just overwrite 'me'
        if (!STATE.group.participants) STATE.group.participants = [];

        // Remove existing entry for this user if any
        STATE.group.participants = STATE.group.participants.filter(p => p.id !== STATE.user.id);

        STATE.group.participants.push({
            id: STATE.user.id,
            name: STATE.user.name,
            availability: selected
        });

        STATE.view = 'results';
        render();
    });
}



// --- Results View Logic ---

function renderResults() {
    // 1. Calculate Heatmap
    const slotsMap = {}; // "dateTtime" -> count

    // In this MVP, we only have one user in local state usually, 
    // unless we mocked more. Let's add some mock data if it's just 1 user to show off the UI.
    const participants = STATE.group.participants || [];

    // Aggregate slots
    participants.forEach(p => {
        p.availability.forEach(slot => {
            slotsMap[slot] = (slotsMap[slot] || 0) + 1;
        });
    });

    // Find Max Overlap
    let maxOverlap = 0;
    Object.values(slotsMap).forEach(count => {
        if (count > maxOverlap) maxOverlap = count;
    });

    // Generate Grid (Similar structure to Availability, but read-only heatmap)
    // Reuse date gen logic (would refactor in real app)
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push({
            date: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate()
        });
    }
    const hours = [];
    for (let i = 8; i <= 23; i++) { hours.push(i); }

    const container = document.createElement('div');
    container.className = 'view-content card';
    container.style.maxWidth = '800px';

    const bestSlots = Object.entries(slotsMap)
        .filter(([_, count]) => count === maxOverlap && count > 0)
        .map(([slot, _]) => slot);

    const bestTimeText = bestSlots.length > 0
        ? `${bestSlots.length} optimal time(s) found!`
        : 'No overlapping times yet.';

    container.innerHTML = `
        <h3 style="margin-bottom: var(--spacing-sm)">Group Results: ${STATE.group.name}</h3>
        <p style="color: var(--accent); font-weight: bold; margin-bottom: var(--spacing-lg)">${bestTimeText}</p>
        
        <div class="grid-container" style="display: grid; grid-template-columns: 50px repeat(7, 1fr); gap: 4px; overflow-x: auto; margin-bottom: var(--spacing-lg);">
            <!-- Header -->
            <div></div>
            ${dates.map(d => `
                <div style="text-align: center; font-size: 0.9rem;">
                    <div style="font-weight: bold;">${d.dayName}</div>
                    <div style="color: var(--text-muted)">${d.dayNum}</div>
                </div>
            `).join('')}

            <!-- Rows -->
            ${hours.map(h => `
                <div style="text-align: right; font-size: 0.8rem; color: var(--text-muted); padding-right: 8px; transform: translateY(-50%); height: 30px;">
                    ${h}:00
                </div>
                ${dates.map(d => {
        const slotKey = `${d.date}T${h}`;
        const count = slotsMap[slotKey] || 0;
        const opacity = maxOverlap > 0 ? (count / maxOverlap) : 0;
        const isBest = count === maxOverlap && count > 0;

        return `
                    <div class="result-cell" 
                         title="${count} available"
                         style="
                            background: ${isBest ? 'var(--accent)' : `rgba(255, 255, 255, ${opacity * 0.5})`};
                            border-radius: 4px; 
                            height: 30px; 
                            ${isBest ? 'box-shadow: 0 0 10px var(--accent-glow);' : ''}
                         "></div>
                    `;
    }).join('')}
            `).join('')}
        </div>

        <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
            <button id="btn-copy" class="btn">Copy Best Time</button>
            <button id="btn-restart" class="btn secondary">Start Over</button>
        </div>
    `;

    mainContent.appendChild(container);

    container.querySelector('#btn-restart').addEventListener('click', () => {
        location.reload();
    });

    container.querySelector('#btn-copy').addEventListener('click', () => {
        if (bestSlots.length === 0) {
            showNotification('No times to copy!', 'error');
            return;
        }

        // Format the clipboard text
        const bestSlot = bestSlots[0]; // Just take first for now
        const [date, hour] = bestSlot.split('T');
        const text = `Let's hangout for "${STATE.group.name}"! Best time: ${date} at ${hour}:00 (${maxOverlap} people free).`;

        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!');
        });
    });
}


// --- Utilities ---

function showNotification(msg, type = 'info') {
    const area = document.getElementById('notification-area');
    const notif = document.createElement('div');
    notif.textContent = msg;
    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.left = '50%';
    notif.style.transform = 'translateX(-50%)';
    notif.style.background = type === 'error' ? 'red' : 'var(--accent)';
    notif.style.color = 'white';
    notif.style.padding = '10px 20px';
    notif.style.borderRadius = '99px';
    notif.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    notif.style.zIndex = '1000';

    area.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Initialize
render();
