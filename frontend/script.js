const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

const dropdownsEl = document.getElementById('dropdowns');
const dateInput = document.getElementById('dateInput');
const calculateBtn = document.getElementById('calculateBtn');
const resultSection = document.getElementById('result');
const breakdownDiv = document.getElementById('breakdown');
const totalP = document.getElementById('total');
const dateInfoP = document.getElementById('dateInfo');

// Spec Panel Elements
const specPlaceholder = document.getElementById('specPlaceholder');
const specDetails = document.getElementById('specDetails');
const specComponentLabel = document.getElementById('specComponentLabel');
const specPartTitle = document.getElementById('specPartTitle');
const specHistoryContainer = document.getElementById('specHistoryContainer');
const specDashboardPanel = document.querySelector('.spec-dashboard-panel');

// Navigation Selectors
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

// Cookie Elements
const cookieCard = document.getElementById('cookieCard');
const cookieAcceptBtn = document.getElementById('cookieAcceptBtn');
const cookieCloseBtn = document.getElementById('cookieCloseBtn');

// Chatbot Elements
const chatLauncher = document.getElementById('chatLauncher');
const chatDrawer = document.getElementById('chatDrawer');
const chatCloseBtn = document.getElementById('chatCloseBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

const componentLabels = {
  frame: 'Frame',
  handlebar: 'Handlebar',
  brakes: 'Brakes',
  wheels: 'Wheels',
  chain: 'Chain Assembly',
  seating: 'Seating',
};

const componentOrder = ['frame', 'handlebar', 'brakes', 'wheels', 'chain', 'seating'];

function latestPrice(part) {
  const sorted = [...part.priceHistory].sort(
    (a, b) => new Date(b.validFrom) - new Date(a.validFrom)
  );
  return sorted.length > 0 ? sorted[0].price : 0;
}

function formatPartName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Build select fields
function buildDropdowns(parts) {
  const grouped = {};
  for (const part of parts) {
    if (!grouped[part.component]) grouped[part.component] = [];
    grouped[part.component].push(part);
  }

  dropdownsEl.innerHTML = componentOrder
    .map((comp) => {
      const compParts = grouped[comp] || [];
      const label = componentLabels[comp] || comp;

      const options = compParts
        .map(
          (p) =>
            `<option value="${p.name}">${formatPartName(p.name)} — ₹${latestPrice(p)}</option>`
        )
        .join('');

      return `
        <div class="field">
          <label for="comp-${comp}">${label}</label>
          <div class="select-wrapper">
            <select id="comp-${comp}" class="part-select" data-component="${comp}">
              <option value="">— Select ${label} —</option>
              ${options}
            </select>
          </div>
        </div>
      `;
    })
    .join('');

  // Attach change listeners to active component selections
  const selects = document.querySelectorAll('.part-select');
  selects.forEach((select) => {
    select.addEventListener('change', (e) => {
      const partName = e.target.value;
      const component = e.target.dataset.component;
      if (partName) {
        fetchPartHistory(partName, component);
      } else {
        checkActiveSelection();
      }
    });
  });
}

// Check if any dropdown is selected, otherwise reset the spec preview
function checkActiveSelection() {
  const selects = document.querySelectorAll('.part-select');
  let activeSelect = null;
  for (const select of selects) {
    if (select.value) {
      activeSelect = select;
      break;
    }
  }

  if (activeSelect) {
    fetchPartHistory(activeSelect.value, activeSelect.dataset.component);
  } else {
    specDetails.classList.add('hidden');
    specPlaceholder.classList.remove('hidden');
  }
}

// Fetch part pricing history and render in right-hand spec dashboard panel
async function fetchPartHistory(partName, component) {
  try {
    const res = await fetch(`${API}/pricing/history/${partName}`);
    const history = await res.json();

    specComponentLabel.textContent = componentLabels[component] || component;
    specPartTitle.textContent = formatPartName(partName);

    if (history && history.length > 0) {
      specHistoryContainer.innerHTML = history
        .map((entry, index) => {
          const fromDate = new Date(entry.validFrom).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const toDate = entry.validUntil
            ? new Date(entry.validUntil).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'Present';

          const isActive = index === 0; // Most recent is active
          return `
            <div class="spec-cell ${isActive ? 'current-active' : ''}">
              <div class="spec-cell-label">
                <span class="spec-date">${isActive ? 'Active Now' : 'Historical Tier'}</span>
                <span class="spec-range">${fromDate} — ${toDate}</span>
              </div>
              <span class="spec-cell-value">₹${entry.price}</span>
            </div>
          `;
        })
        .join('');
    } else {
      specHistoryContainer.innerHTML = `
        <div class="spec-cell">
          <div class="spec-cell-label">
            <span class="spec-date">No pricing records found</span>
          </div>
        </div>
      `;
    }

    specPlaceholder.classList.add('hidden');
    specDetails.classList.remove('hidden');

    // Auto-scroll on smaller viewports to highlight loaded pricing history telemetry
    if (window.innerWidth <= 1024 && specDashboardPanel) {
      setTimeout(() => {
        specDashboardPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  } catch (err) {
    console.error('Error loading pricing history telemetry:', err);
  }
}

calculateBtn.addEventListener('click', async () => {
  const selects = document.querySelectorAll('.part-select');
  const selected = [];

  for (const sel of selects) {
    if (sel.value) selected.push(sel.value);
  }

  if (selected.length === 0) return alert('Please select at least one component specification to calculate pricing.');

  const date = dateInput.value || undefined;

  const res = await fetch(`${API}/pricing/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, parts: selected }),
  });

  const data = await res.json();

  breakdownDiv.innerHTML = data.parts
    .map(
      (p) =>
        `<div class="breakdown-row">
          <div class="breakdown-part-info">
            <span class="breakdown-part-name">${formatPartName(p.name)}</span>
            <span class="breakdown-part-comp">${componentLabels[p.component] || p.component}</span>
          </div>
          <span class="breakdown-part-price">₹${p.effectivePrice}</span>
        </div>`
    )
    .join('');

  totalP.textContent = `TOTAL: ₹${data.total}`;
  dateInfoP.textContent = `VALUATION LOGGED AS OF: ${new Date(data.queriedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`;
  resultSection.classList.remove('hidden');
  
  // Smooth scroll to results
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// --- Overlays and Widgets Action Wire-up ---

// Mobile Menu Toggle
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close navigation menu when clicking an option/anchor link
  const links = navLinks.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// Cookie Card Check
if (cookieCard) {
  const isApproved = localStorage.getItem('hero_cookie_approved');
  if (isApproved === 'true') {
    cookieCard.classList.add('hidden');
    document.body.classList.add('cookie-closed');
  }

  cookieAcceptBtn.addEventListener('click', () => {
    localStorage.setItem('hero_cookie_approved', 'true');
    cookieCard.classList.add('hidden');
    document.body.classList.add('cookie-closed');
  });

  cookieCloseBtn.addEventListener('click', () => {
    cookieCard.classList.add('hidden');
    document.body.classList.add('cookie-closed');
  });
}

// Chatbot Active Telemetry Assistant
if (chatLauncher && chatDrawer && chatCloseBtn) {
  chatLauncher.addEventListener('click', () => {
    chatDrawer.classList.toggle('open');
  });

  chatCloseBtn.addEventListener('click', () => {
    chatDrawer.classList.remove('open');
  });

  // Chat message send handler
  const sendChatMessage = () => {
    const text = chatInput.value.trim();
    if (!text) return;

    // Append user bubble
    appendChatBubble(text, 'user');
    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Play simulated response with micro-delay
    setTimeout(() => {
      const response = generateAssistantResponse(text);
      appendChatBubble(response, 'assistant');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600);
  };

  chatSendBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
}

function appendChatBubble(text, sender) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
}

function generateAssistantResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('carbon') || q.includes('frame')) {
    return "Our M-Performance Carbon Frame is fabricated from high-modulus aerospace carbon layers. It reduces frame mass to just 980g while delivering absolute competitive torsional stiffness.";
  }
  if (q.includes('price') || q.includes('pricing') || q.includes('history') || q.includes('cost')) {
    return "All components are modeled with time-sensitive pricing attributes. If you set a historical date in the configurator, our services dynamically inspect historical valid periods to display corresponding pricing metrics.";
  }
  if (q.includes('brake') || q.includes('brakes') || q.includes('hydraulic')) {
    return "We offer Rim, Disc, and Hydraulic Brake systems. The active hydraulic braking tier utilizes dual-piston mineral oil calipers, guaranteeing solid braking pressure even under wet track conditions.";
  }
  if (q.includes('wheel') || q.includes('tyre') || q.includes('tubeless')) {
    return "Our M-Performance Tubeless Wheel sets use an anodized aluminum double-wall profile. Running at 120 PSI provides minimal rolling resistance and absolute bead seating safety.";
  }
  if (q.includes('saddle') || q.includes('seating')) {
    return "Comfort saddles feature pressure-relief zones, while Racing saddles utilize carbon-reinforced hulls with micro-fiber outer covers to optimize driver weight transfer.";
  }
  return "Active telemetry received. Telemetry system is fully connected. Select components in the active configurator block on the page to query real-time pricing trends!";
}

async function init() {
  try {
    const res = await fetch(`${API}/pricing/parts`);
    const parts = await res.json();
    buildDropdowns(parts);
  } catch (err) {
    console.error('Failed to initialize configurator dropdown telemetry:', err);
  }
}

init();
