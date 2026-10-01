/**
 * LeadFinder - Google Maps Stealth Lead Extractor & Humanized Scroller
 * 1-Click Bookmarklet Edition (100% Identical UI & Functionalities to Chrome Extension)
 * Works on Google Maps (https://www.google.com/maps/*) and across any active browser tab.
 */

(function () {
  const CONTAINER_ID = 'leadfinder-bookmarklet-root';
  const MINIMIZED_ID = 'leadfinder-bookmarklet-minimized';
  const STYLES_ID = 'leadfinder-bookmarklet-styles';

  // If overlay already exists, remove it cleanly to ensure latest script and handlers take effect
  const existingContainer = document.getElementById(CONTAINER_ID);
  const existingMinimized = document.getElementById(MINIMIZED_ID);

  if (existingContainer) {
    try { existingContainer.remove(); } catch (e) {}
  }
  if (existingMinimized) {
    try { existingMinimized.remove(); } catch (e) {}
  }

  function highlightElement(el) {
    el.style.transform = 'scale(1.02)';
    el.style.boxShadow = '0 0 35px rgba(59, 130, 246, 0.6)';
    setTimeout(() => {
      el.style.transform = 'scale(1)';
      el.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)';
    }, 600);
  }

  console.log('🚀 LeadFinder Bookmarklet loaded: Initializing Extension-identical interface...');

  // Detect Current Tab / Page Environment
  const isGoogleMaps = window.location.href.includes('google.com/maps');

  // State
  let isScraping = false;
  let isPaused = false;
  let scrapedLeadsMap = new Map(); // Key: uniqueKey
  let maxLeadsTarget = 100;
  let targetSearchQuery = '';
  let backendOnline = false;
  let currentUser = null;
  let authToken = null;
  let lastSyncedLeads = [];

  // Active Pre-Scrape Quality Filters (Identical to Extension)
  let activeFilters = {
    noWebsiteOnly: false,
    mustHavePhone: false,
    maxRating: 'any',
    maxReviews: 'any',
  };

  // Human Emulation delays matching extension UI ("2.0s - 4.5s Humanized")
  const MIN_DELAY_MS = 2000;
  const MAX_DELAY_MS = 4500;

  // Layer 1: Check URL Search & Hash Parameters (Cross-tab passed parameters)
  function parseUrlParameters() {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashClean = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
      const hashParams = new URLSearchParams(hashClean);

      const getVal = (k) => searchParams.get(k) || hashParams.get(k);

      const pCap = getVal('lf_cap');
      const pNoWeb = getVal('lf_noweb');
      const pPhone = getVal('lf_phone');
      const pRating = getVal('lf_rating');
      const pReviews = getVal('lf_reviews');
      const pAutoStart = getVal('lf_autostart');
      const pToken = getVal('lf_token');
      const pQuery = getVal('lf_query');

      let hasParam = false;
      if (pToken) {
        authToken = pToken;
        try {
          localStorage.setItem('leadfinder_token', pToken);
        } catch (e) {}
      }

      if (pQuery) {
        targetSearchQuery = decodeURIComponent(pQuery.replace(/\+/g, ' '));
        hasParam = true;
      }

      if (pCap) {
        maxLeadsTarget = parseInt(pCap, 10);
        hasParam = true;
      }
      if (pNoWeb !== null && pNoWeb !== undefined) {
        activeFilters.noWebsiteOnly = pNoWeb === 'true' || pNoWeb === '1';
        hasParam = true;
      }
      if (pPhone !== null && pPhone !== undefined) {
        activeFilters.mustHavePhone = pPhone === 'true' || pPhone === '1';
        hasParam = true;
      }
      if (pRating) {
        activeFilters.maxRating = pRating;
        hasParam = true;
      }
      if (pReviews) {
        activeFilters.maxReviews = pReviews;
        hasParam = true;
      }

      return {
        hasParam,
        autoStart: pAutoStart === '1' || pAutoStart === 'true',
      };
    } catch (e) {
      return { hasParam: false, autoStart: false };
    }
  }

  const urlParamsResult = parseUrlParameters();

  // Also check window.__LF_USER or stored domain user
  if (!currentUser && typeof window !== 'undefined' && window.__LF_USER) {
    currentUser = window.__LF_USER;
  }
  if (!currentUser && typeof localStorage !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('leadfinder_user');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    } catch (e) {}
  }

  // Also check window.__LF_TOKEN or stored domain token
  if (!authToken && typeof window !== 'undefined' && window.__LF_TOKEN) {
    authToken = window.__LF_TOKEN;
    try {
      localStorage.setItem('leadfinder_token', authToken);
    } catch (e) {}
  }
  if (!authToken && typeof localStorage !== 'undefined') {
    try {
      authToken = localStorage.getItem('leadfinder_token') || sessionStorage.getItem('leadfinder_token');
    } catch (e) {}
  }
  if (authToken && typeof authToken === 'string') {
    authToken = authToken.replace(/^["']|["']$/g, '').trim();
  }

  // Layer 2: Load saved preferences from domain localStorage if not in URL
  try {
    if (!urlParamsResult.hasParam) {
      const savedCap = localStorage.getItem('lf_max_leads');
      if (savedCap) maxLeadsTarget = parseInt(savedCap, 10);
      const savedNoWeb = localStorage.getItem('lf_no_web_only');
      if (savedNoWeb !== null) activeFilters.noWebsiteOnly = savedNoWeb === 'true';
      const savedPhone = localStorage.getItem('lf_must_phone');
      if (savedPhone !== null) activeFilters.mustHavePhone = savedPhone === 'true';
      const savedRating = localStorage.getItem('lf_max_rating');
      if (savedRating) activeFilters.maxRating = savedRating;
      const savedReviews = localStorage.getItem('lf_max_reviews');
      if (savedReviews) activeFilters.maxReviews = savedReviews;
      const savedQuery = localStorage.getItem('lf_target_query');
      if (savedQuery && !targetSearchQuery) targetSearchQuery = savedQuery;
    }

    // Clear any leftover stale leads from previous runs so new crawls start clean
    try {
      localStorage.removeItem('leadfinder_leads');
    } catch (e) {}
  } catch (e) {
    console.warn('LeadFinder: localStorage read error', e);
  }

  // 1. Inject EXACT Extension CSS scoped to LeadFinder Bookmarklet
  if (!document.getElementById(STYLES_ID)) {
    const styleEl = document.createElement('style');
    styleEl.id = STYLES_ID;
    styleEl.textContent = `
      #${CONTAINER_ID} {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 40px);
        background-color: #0b0f19;
        color: #f1f5f9;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 16px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06);
        z-index: 2147483647;
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
        user-select: text;
        line-height: 1.4;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
      }

      #${CONTAINER_ID} * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      /* Custom sleek scrollbar for popup */
      #${CONTAINER_ID}::-webkit-scrollbar {
        width: 6px;
      }
      #${CONTAINER_ID}::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.6);
        border-radius: 8px;
      }
      #${CONTAINER_ID}::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 8px;
      }
      #${CONTAINER_ID}::-webkit-scrollbar-thumb:hover {
        background: #475569;
      }

      #${CONTAINER_ID} .popup-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      #${CONTAINER_ID} .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: grab;
        padding-bottom: 2px;
      }
      #${CONTAINER_ID} .header:active {
        cursor: grabbing;
      }

      #${CONTAINER_ID} .logo {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #${CONTAINER_ID} .logo-icon {
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        color: #ffffff;
        box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
      }

      #${CONTAINER_ID} .logo-text h1 {
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.1;
      }

      #${CONTAINER_ID} .logo-text .version {
        font-size: 10px;
        color: #94a3b8;
      }

      #${CONTAINER_ID} .header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      #${CONTAINER_ID} .auth-status {
        font-size: 10px;
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 3px 8px;
        display: flex;
        align-items: center;
        gap: 5px;
        color: #cbd5e1;
        cursor: pointer;
        max-width: 130px;
        transition: all 0.2s ease;
      }
      #${CONTAINER_ID} .auth-status:hover {
        background: rgba(51, 65, 85, 0.9);
      }
      #${CONTAINER_ID} .auth-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #ef4444;
        flex-shrink: 0;
        transition: all 0.3s ease;
      }
      #${CONTAINER_ID} .auth-status.authenticated .auth-dot {
        background-color: #22c55e;
        box-shadow: 0 0 6px #22c55e;
      }
      #${CONTAINER_ID} .auth-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${CONTAINER_ID} .server-status {
        font-size: 10px;
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 3px 8px;
        display: flex;
        align-items: center;
        gap: 5px;
        color: #cbd5e1;
        cursor: pointer;
      }

      #${CONTAINER_ID} .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #ef4444;
        transition: all 0.3s ease;
      }

      #${CONTAINER_ID} .auth-warning-box {
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.35);
        border-radius: 10px;
        padding: 10px 12px;
        margin-bottom: 12px;
        font-size: 11px;
        color: #fca5a5;
        line-height: 1.4;
      }
      #${CONTAINER_ID} .auth-warning-box.hidden {
        display: none;
      }

      #${CONTAINER_ID} .server-status.online .status-dot {
        background-color: #22c55e;
        box-shadow: 0 0 6px #22c55e;
      }

      #${CONTAINER_ID} .window-btn {
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        border-radius: 8px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      #${CONTAINER_ID} .window-btn:hover {
        background: #334155;
        color: #ffffff;
      }

      #${CONTAINER_ID} .notice-banner {
        background: rgba(59, 130, 246, 0.15);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 11px;
        color: #93c5fd;
        line-height: 1.4;
        transition: all 0.2s ease;
      }

      #${CONTAINER_ID} .notice-banner.hidden {
        display: none;
      }

      #${CONTAINER_ID} .notice-banner.warning {
        background: rgba(245, 158, 11, 0.15);
        border-color: rgba(245, 158, 11, 0.4);
        color: #fcd34d;
      }

      #${CONTAINER_ID} .notice-banner.success {
        background: rgba(34, 197, 94, 0.15);
        border-color: rgba(34, 197, 94, 0.4);
        color: #86efac;
      }

      #${CONTAINER_ID} .card {
        background: rgba(17, 24, 39, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 12px;
      }

      #${CONTAINER_ID} .main-controls h2,
      #${CONTAINER_ID} .filter-card h2 {
        font-size: 13px;
        font-weight: 600;
        color: #e2e8f0;
        margin-bottom: 4px;
      }

      #${CONTAINER_ID} .subtitle {
        font-size: 11px;
        color: #94a3b8;
        margin-bottom: 12px;
        line-height: 1.3;
      }

      #${CONTAINER_ID} .input-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 8px;
        flex: 1;
      }

      #${CONTAINER_ID} .input-group label {
        font-size: 11px;
        color: #cbd5e1;
      }

      #${CONTAINER_ID} .input-group select {
        background: #1e293b;
        border: 1px solid #334155;
        color: #f8fafc;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 11px;
        outline: none;
        cursor: pointer;
      }
      #${CONTAINER_ID} .input-group select:focus {
        border-color: #3b82f6;
      }

      #${CONTAINER_ID} .input-group input[type="text"] {
        background: #1e293b;
        border: 1px solid #334155;
        color: #f8fafc;
        padding: 7px 10px;
        border-radius: 6px;
        font-size: 11px;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        width: 100%;
        box-sizing: border-box;
      }
      #${CONTAINER_ID} .input-group input[type="text"]:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
      }
      #${CONTAINER_ID} .input-group input[type="text"]::placeholder {
        color: #64748b;
      }

      #${CONTAINER_ID} .filter-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      #${CONTAINER_ID} .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        color: #f1f5f9;
        cursor: pointer;
      }

      #${CONTAINER_ID} .checkbox-label input[type="checkbox"] {
        accent-color: #3b82f6;
        width: 14px;
        height: 14px;
        cursor: pointer;
      }

      #${CONTAINER_ID} .filter-row {
        display: flex;
        gap: 8px;
        margin-top: 4px;
      }

      #${CONTAINER_ID} .btn-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      #${CONTAINER_ID} .btn {
        width: 100%;
        padding: 8px 12px;
        border-radius: 8px;
        border: none;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      #${CONTAINER_ID} .btn-primary {
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        color: white;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }
      #${CONTAINER_ID} .btn-primary:hover {
        background: linear-gradient(135deg, #1d4ed8, #2563eb);
      }

      #${CONTAINER_ID} .btn-stop {
        background: linear-gradient(135deg, #dc2626, #ef4444);
        color: white;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        animation: lf-pulse-border 2s infinite;
      }
      #${CONTAINER_ID} .btn-stop:hover {
        background: linear-gradient(135deg, #b91c1c, #dc2626);
      }

      @keyframes lf-pulse-border {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }

      #${CONTAINER_ID} .btn-secondary {
        background: #1e293b;
        color: #cbd5e1;
        border: 1px solid #334155;
      }
      #${CONTAINER_ID} .btn-secondary:hover {
        background: #334155;
        color: white;
      }

      #${CONTAINER_ID} .btn-row {
        display: flex;
        gap: 8px;
      }
      #${CONTAINER_ID} .btn-row .btn {
        flex: 1;
      }

      #${CONTAINER_ID} .stats-card {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      #${CONTAINER_ID} .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
      }

      #${CONTAINER_ID} .stat-label {
        color: #94a3b8;
      }

      #${CONTAINER_ID} .stat-value {
        font-weight: 600;
        color: #f1f5f9;
      }

      #${CONTAINER_ID} .stat-value.highlight {
        color: #38bdf8;
      }

      #${CONTAINER_ID} .stat-progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(30, 41, 59, 0.8);
        border-radius: 4px;
        overflow: hidden;
        margin-top: 4px;
      }

      #${CONTAINER_ID} .stat-progress-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #3b82f6, #38bdf8);
        transition: width 0.3s ease;
      }

      #${CONTAINER_ID} .footer {
        text-align: center;
        font-size: 10px;
        color: #64748b;
        margin-top: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #${CONTAINER_ID} .footer a {
        color: #60a5fa;
        text-decoration: none;
      }
      #${CONTAINER_ID} .footer a:hover {
        text-decoration: underline;
      }

      /* Minimized Floating Pill */
      #${MINIMIZED_ID} {
        position: fixed;
        bottom: 24px;
        right: 24px;
        height: 44px;
        padding: 0 16px 0 10px;
        background: rgba(11, 15, 25, 0.95);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(59, 130, 246, 0.4);
        border-radius: 24px;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.6), 0 0 15px rgba(59, 130, 246, 0.3);
        z-index: 2147483647;
        display: none;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        color: #f1f5f9;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s ease;
        user-select: none;
      }
      #${MINIMIZED_ID}:hover {
        transform: translateY(-2px);
        border-color: #60a5fa;
        box-shadow: 0 16px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(59, 130, 246, 0.5);
      }
      #${MINIMIZED_ID} .min-logo {
        width: 26px;
        height: 26px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 800;
        color: white;
      }
      #${MINIMIZED_ID} .min-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #22c55e;
        box-shadow: 0 0 8px #22c55e;
        animation: min-pulse 1.5s infinite;
      }
      @keyframes min-pulse {
        0% { opacity: 0.4; }
        50% { opacity: 1; }
        100% { opacity: 0.4; }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 2. Build the DOM Hierarchy identical to Extension popup.html
  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.innerHTML = `
    <div class="popup-container">
      <!-- Header -->
      <div class="header" id="lf-drag-header" title="Drag to move">
        <div class="logo">
          <div class="logo-icon">LF</div>
          <div class="logo-text">
            <h1>LeadFinder</h1>
            <span class="version">v1.2 Stealth &amp; Filters</span>
          </div>
        </div>
        <div class="header-actions">
          <div class="auth-status" id="auth-status" title="User Session (Click to log in / view account)">
            <span class="auth-dot" id="auth-dot"></span>
            <span class="auth-text" id="auth-status-text">Checking Auth...</span>
          </div>
          <div class="server-status" id="server-status" title="NestJS GraphQL Backend Status (Click to ping)">
            <span class="status-dot"></span>
            <span class="status-text" id="server-status-text">Port 4000</span>
          </div>
          <button class="window-btn" id="btn-minimize" title="Minimize to Floating Pill">−</button>
          <button class="window-btn" id="btn-close" title="Close LeadFinder">✕</button>
        </div>
      </div>

      <!-- Notice Banner -->
      <div id="notice-banner" class="notice-banner hidden">
        <span id="notice-text"></span>
      </div>

      <!-- Main Controls Card -->
      <div class="card main-controls">
        <!-- Auth Warning Banner if Logged Out -->
        <div id="auth-warning-box" class="auth-warning-box hidden">
          <div style="font-weight: 700; color: #f87171; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span>🔒 Authentication Required</span>
          </div>
          <p style="margin-bottom: 8px;">You must be logged into your LeadFinder account to extract leads and save them to your CRM.</p>
          <button id="btn-login-redirect" style="width: 100%; padding: 6px 10px; background: #3b82f6; color: #ffffff; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Log In to LeadFinder</span> &rarr;
          </button>
        </div>

        <h2>Target Google Maps Tab</h2>
        <p class="subtitle" id="tab-status-text">Detecting active browser tab...</p>
        
        <div class="input-group">
          <label for="search-query-input">Target Search Query (Optional)</label>
          <input
            type="text"
            id="search-query-input"
            placeholder="e.g. Dentists in Seattle, Plumbers in Miami..."
            autocomplete="off"
          />
        </div>

        <div class="input-group">
          <label for="max-leads">Max Leads Cap</label>
          <select id="max-leads">
            <option value="25">25 Leads</option>
            <option value="50">50 Leads</option>
            <option value="100">100 Leads</option>
            <option value="200">200 Leads</option>
            <option value="500">500 Leads (Deep Search)</option>
          </select>
        </div>

        <div class="btn-group">
          <button id="btn-start" class="btn btn-primary">
            <svg id="btn-start-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span id="btn-start-text">Start Scraper</span>
          </button>
          <button id="btn-open-maps" class="btn btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Open Google Maps
          </button>
          <button id="btn-dashboard" class="btn btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Open CRM Dashboard
          </button>
        </div>
      </div>

      <!-- Pre-Scrape Target Filters Card (Quality Control) -->
      <div class="card filter-card">
        <h2>Pre-Scrape Filters (Quality Control)</h2>
        <p class="subtitle">Prevent CRM clutter by only extracting high-intent leads</p>

        <div class="filter-options">
          <label class="checkbox-label">
            <input type="checkbox" id="filter-no-website" />
            <span>Only Leads WITH NO WEBSITE 🌐</span>
          </label>

          <label class="checkbox-label">
            <input type="checkbox" id="filter-must-phone" />
            <span>Must Have Phone Number 📞</span>
          </label>

          <div class="filter-row">
            <div class="input-group">
              <label for="filter-max-rating">Max Rating Cap</label>
              <select id="filter-max-rating">
                <option value="any">Any Rating</option>
                <option value="4.0">≤ 4.0 ⭐ (Low Rating)</option>
                <option value="4.3">≤ 4.3 ⭐</option>
                <option value="4.5">≤ 4.5 ⭐</option>
              </select>
            </div>

            <div class="input-group">
              <label for="filter-max-reviews">Max Reviews Cap</label>
              <select id="filter-max-reviews">
                <option value="any">Any Reviews</option>
                <option value="15">≤ 15 Reviews</option>
                <option value="50">≤ 50 Reviews</option>
                <option value="100">≤ 100 Reviews</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Card -->
      <div class="card stats-card">
        <div class="stat-row">
          <span class="stat-label">Session Scraped</span>
          <span class="stat-value" id="stat-scraped">0</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Stealth Scroll Delay</span>
          <span class="stat-value highlight">2.0s - 4.5s (Humanized)</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Crawl Status</span>
          <span class="stat-value" id="stat-status-text" style="font-size: 10px; color: #94a3b8;">Ready</span>
        </div>
        <div class="stat-progress-bar">
          <div class="stat-progress-fill" id="stat-progress-fill"></div>
        </div>
        <div class="btn-row" style="margin-top: 6px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px;">
          <button id="btn-sync-now" class="btn btn-secondary" style="font-size: 10px; padding: 6px 4px;" title="Sync collected leads to CRM">
            ⚡ Sync CRM
          </button>
          <button id="btn-export-csv" class="btn btn-secondary" style="font-size: 10px; padding: 6px 4px;" title="Export leads as CSV file">
            📥 CSV
          </button>
          <button id="btn-reset-session" class="btn btn-secondary" style="font-size: 10px; padding: 6px 4px;" title="Reset session for a new search">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <span>LeadFinder Anti-Blocking Engine</span>
        <a href="http://localhost:5173/#crm" target="_blank">Go to CRM &rarr;</a>
      </div>
    </div>
  `;

  // Create Minimized Floating Pill
  const minPill = document.createElement('div');
  minPill.id = MINIMIZED_ID;
  minPill.innerHTML = `
    <div class="min-logo">LF</div>
    <div class="min-dot" id="min-dot"></div>
    <span id="min-text">0 Leads Scraped</span>
    <span style="color: #60a5fa; font-weight: bold; margin-left: 4px;">+</span>
  `;

  document.body.appendChild(container);
  document.body.appendChild(minPill);

  // References to UI elements
  const btnStart = document.getElementById('btn-start');
  const btnStartText = document.getElementById('btn-start-text');
  const btnStartIcon = document.getElementById('btn-start-icon');
  const btnOpenMaps = document.getElementById('btn-open-maps');
  const btnDashboard = document.getElementById('btn-dashboard');
  const inputSearchQuery = document.getElementById('search-query-input');
  const selectMaxLeads = document.getElementById('max-leads');
  const filterNoWebsite = document.getElementById('filter-no-website');
  const filterMustPhone = document.getElementById('filter-must-phone');
  const filterMaxRating = document.getElementById('filter-max-rating');
  const filterMaxReviews = document.getElementById('filter-max-reviews');
  const statScraped = document.getElementById('stat-scraped');
  const statStatusText = document.getElementById('stat-status-text');
  const statProgressFill = document.getElementById('stat-progress-fill');
  const serverStatus = document.getElementById('server-status');
  const serverStatusText = document.getElementById('server-status-text');
  const authStatus = document.getElementById('auth-status');
  const authStatusText = document.getElementById('auth-status-text');
  const authDot = document.getElementById('auth-dot');
  const authWarningBox = document.getElementById('auth-warning-box');
  const btnLoginRedirect = document.getElementById('btn-login-redirect');
  const tabStatusText = document.getElementById('tab-status-text');
  const noticeBanner = document.getElementById('notice-banner');
  const noticeText = document.getElementById('notice-text');
  const btnMinimize = document.getElementById('btn-minimize');
  const btnClose = document.getElementById('btn-close');
  const btnSyncNow = document.getElementById('btn-sync-now');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnResetSession = document.getElementById('btn-reset-session');
  const minText = document.getElementById('min-text');

  // Populate loaded values in UI
  selectMaxLeads.value = String(maxLeadsTarget);
  filterNoWebsite.checked = activeFilters.noWebsiteOnly;
  filterMustPhone.checked = activeFilters.mustHavePhone;
  filterMaxRating.value = activeFilters.maxRating;
  filterMaxReviews.value = activeFilters.maxReviews;
  statScraped.innerText = scrapedLeadsMap.size;

  // Pre-populate authenticated state immediately if user session is cached
  if (currentUser) {
    if (authStatus) authStatus.classList.add('authenticated');
    if (authStatusText) authStatusText.innerText = currentUser.name || currentUser.email;
    if (authStatus) authStatus.title = `Logged in as: ${currentUser.name || currentUser.email} (Click to open CRM)`;
    if (authWarningBox) authWarningBox.classList.add('hidden');
  }
  updateStartButtonState();

  if (inputSearchQuery) {
    if (targetSearchQuery) {
      inputSearchQuery.value = targetSearchQuery;
    } else if (isGoogleMaps) {
      const q = detectSearchQuery();
      if (q && q !== 'Google Maps Query') {
        inputSearchQuery.value = q;
        targetSearchQuery = q;
      }
    }

    inputSearchQuery.addEventListener('input', (e) => {
      targetSearchQuery = e.target.value.trim();
      try {
        localStorage.setItem('lf_target_query', targetSearchQuery);
      } catch (err) {}
    });

    inputSearchQuery.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isGoogleMaps) {
          const q = (inputSearchQuery.value || '').trim();
          if (q) {
            await executeGoogleMapsSearch(q);
          }
          if (!isScraping) toggleScraping();
        } else {
          handleOpenMapsAndStart();
        }
      }
    });
  }

  if (btnResetSession) {
    btnResetSession.addEventListener('click', () => {
      scrapedLeadsMap.clear();
      if (typeof inspectedCardsSet !== 'undefined') inspectedCardsSet.clear();
      try { localStorage.removeItem('leadfinder_leads'); } catch (e) {}
      updateStats();
      showNotice('Session reset! Enter your search on Google Maps and click Start Scraper.', 'info');
      statStatusText.innerText = 'Ready';
      statStatusText.style.color = '#94a3b8';
    });
  }

  if (authStatus) {
    authStatus.addEventListener('click', () => {
      window.open('http://localhost:5173/#crm', '_blank');
    });
  }
  if (btnLoginRedirect) {
    btnLoginRedirect.addEventListener('click', () => {
      window.open('http://localhost:5173/#crm', '_blank');
    });
  }

  // Helper functions for Banner
  function showNotice(msg, type = 'info') {
    if (noticeText && noticeBanner) {
      noticeText.innerText = msg;
      noticeBanner.className = `notice-banner ${type}`;
    }
  }

  function hideNotice() {
    if (noticeBanner) {
      noticeBanner.className = 'notice-banner hidden';
    }
  }

  // Save Settings helper to localStorage and NestJS Backend
  function saveSettings(autoStart = false) {
    maxLeadsTarget = parseInt(selectMaxLeads.value, 10);
    activeFilters.noWebsiteOnly = filterNoWebsite.checked;
    activeFilters.mustHavePhone = filterMustPhone.checked;
    activeFilters.maxRating = filterMaxRating.value;
    activeFilters.maxReviews = filterMaxReviews.value;

    try {
      localStorage.setItem('lf_max_leads', String(maxLeadsTarget));
      localStorage.setItem('lf_no_web_only', String(activeFilters.noWebsiteOnly));
      localStorage.setItem('lf_must_phone', String(activeFilters.mustHavePhone));
      localStorage.setItem('lf_max_rating', activeFilters.maxRating);
      localStorage.setItem('lf_max_reviews', activeFilters.maxReviews);
    } catch (e) {}

    updateStats();

    // Async sync to NestJS GraphQL Backend to preserve settings across tabs/domains
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({
        query: `
          mutation SaveConfig($input: SaveScraperConfigInput!) {
            saveScraperConfig(input: $input) {
              maxLeads
              noWebsiteOnly
              mustHavePhone
              maxRating
              maxReviews
              autoStart
            }
          }
        `,
        variables: {
          input: {
            maxLeads: maxLeadsTarget,
            noWebsiteOnly: activeFilters.noWebsiteOnly,
            mustHavePhone: activeFilters.mustHavePhone,
            maxRating: activeFilters.maxRating,
            maxReviews: activeFilters.maxReviews,
            autoStart: autoStart,
          },
        },
      }),
    }).catch(() => {});
  }

  // Layer 3: Check NestJS Backend status, Auth session & sync global settings
  async function checkBackendAndSyncConfig() {
    let json = null;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          query: `
            query CheckAuthAndConfig {
              me {
                id
                name
                email
                role
                apiKey
              }
              scraperConfig {
                maxLeads
                noWebsiteOnly
                mustHavePhone
                maxRating
                maxReviews
                autoStart
              }
            }
          `,
        }),
      });

      if (res.ok) {
        json = await res.json();
        if (serverStatus) serverStatus.classList.add('online');
        backendOnline = true;
        if (serverStatusText) serverStatusText.innerText = 'Port 4000';

        // Process Auth State
        if (json && json.data && json.data.me) {
          currentUser = json.data.me;
          try {
            localStorage.setItem('leadfinder_user', JSON.stringify(currentUser));
          } catch (e) {}
          if (authStatus) authStatus.classList.add('authenticated');
          if (authStatusText) authStatusText.innerText = currentUser.name || currentUser.email;
          if (authStatus) authStatus.title = `Logged in as: ${currentUser.name || currentUser.email} (Click to open CRM)`;
          if (authWarningBox) authWarningBox.classList.add('hidden');
        } else {
          // If query returned no me (or unauthenticated error), fallback to cached user if valid
          if (!currentUser) {
            currentUser = null;
            if (authStatus) authStatus.classList.remove('authenticated');
            if (authStatusText) authStatusText.innerText = '🔒 Log In';
            if (authStatus) authStatus.title = 'Not authenticated. Click to log in to LeadFinder.';
            if (authWarningBox) authWarningBox.classList.remove('hidden');
          }
        }
        updateStartButtonState();

        // Process Scraper Config
        let cfg = json && json.data ? json.data.scraperConfig : null;
        if (!cfg) {
          // If me threw UNAUTHENTICATED, GraphQL standard sets data: null, so fetch scraperConfig independently
          try {
            const cfgRes = await fetch('http://localhost:4000/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `query GetConfig { scraperConfig { maxLeads noWebsiteOnly mustHavePhone maxRating maxReviews autoStart } }`,
              }),
            });
            if (cfgRes.ok) {
              const cfgJson = await cfgRes.json();
              if (cfgJson.data && cfgJson.data.scraperConfig) {
                cfg = cfgJson.data.scraperConfig;
              }
            }
          } catch (e) {}
        }

        if (cfg) {
          // If URL params were NOT explicitly set on this page, populate from backend
          if (!urlParamsResult.hasParam) {
            if (cfg.maxLeads) maxLeadsTarget = cfg.maxLeads;
            if (cfg.noWebsiteOnly !== undefined) activeFilters.noWebsiteOnly = cfg.noWebsiteOnly;
            if (cfg.mustHavePhone !== undefined) activeFilters.mustHavePhone = cfg.mustHavePhone;
            if (cfg.maxRating) activeFilters.maxRating = cfg.maxRating;
            if (cfg.maxReviews) activeFilters.maxReviews = cfg.maxReviews;

            // Reflect in DOM
            selectMaxLeads.value = String(maxLeadsTarget);
            filterNoWebsite.checked = activeFilters.noWebsiteOnly;
            filterMustPhone.checked = activeFilters.mustHavePhone;
            filterMaxRating.value = activeFilters.maxRating;
            filterMaxReviews.value = activeFilters.maxReviews;
            updateStats();
          }
        }
      } else {
        if (serverStatus) serverStatus.classList.remove('online');
        backendOnline = false;
        if (serverStatusText) serverStatusText.innerText = 'Offline';
        if (!currentUser) {
          if (authStatus) authStatus.classList.remove('authenticated');
          if (authStatusText) authStatusText.innerText = '🔒 Log In';
        }
        updateStartButtonState();
      }

      // Check autoStart regardless of backend config response if requested via URL
      const shouldAutoStart = urlParamsResult.autoStart || (json && json.data && json.data.scraperConfig && json.data.scraperConfig.autoStart);
      if (shouldAutoStart && isGoogleMaps && !isScraping) {
        triggerAutoStart();
      }
    } catch (err) {
      if (serverStatus) serverStatus.classList.remove('online');
      backendOnline = false;
      if (serverStatusText) serverStatusText.innerText = 'Offline';
      if (!currentUser) {
        if (authStatus) authStatus.classList.remove('authenticated');
        if (authStatusText) authStatusText.innerText = '🔒 Log In';
        if (authWarningBox) authWarningBox.classList.remove('hidden');
      }
      updateStartButtonState();

      if (urlParamsResult.autoStart && isGoogleMaps && !isScraping) {
        triggerAutoStart();
      }
    }
  }

  // Auto-Start Handler: Waits for Google Maps cards or timeout, then initiates scraping
  function triggerAutoStart() {
    const q = targetSearchQuery || detectSearchQuery();
    showNotice(
      q && q !== 'Google Maps Query'
        ? `🚀 Auto-starting lead crawl for "${q}"...`
        : `🚀 Auto-starting lead crawl with your saved filters...`,
      'success'
    );
    let attempts = 0;
    const checkTimer = setInterval(() => {
      attempts++;
      const cards = document.querySelectorAll('div.Nv2PK, div[role="article"]');
      if (cards.length > 0 || attempts >= 8) {
        clearInterval(checkTimer);
        if (!isScraping) toggleScraping();
      }
    }, 300);
  }

  checkBackendAndSyncConfig();
  serverStatus.addEventListener('click', checkBackendAndSyncConfig);

  // Bind change listeners to instantly save settings
  selectMaxLeads.addEventListener('change', () => saveSettings(false));
  filterNoWebsite.addEventListener('change', () => saveSettings(false));
  filterMustPhone.addEventListener('change', () => saveSettings(false));
  filterMaxRating.addEventListener('change', () => saveSettings(false));
  filterMaxReviews.addEventListener('change', () => saveSettings(false));

  let lastDetectedQuery = detectSearchQuery();

  function updateTabStatus() {
    if (isGoogleMaps) {
      tabStatusText.innerText = 'Active Tab: Google Maps ✅';
      tabStatusText.style.color = '#4ade80';
      if (!isScraping) {
        btnStartText.innerText = 'Start Scraper';
      }
      const query = targetSearchQuery || detectSearchQuery();
      if (query && query !== 'Google Maps Query') {
        showNotice(`Target: "${query}" detected. Click Start Scraper.`, 'success');
      } else {
        showNotice('Enter a target search query or search on Maps, then click Start.', 'info');
      }
    } else {
      tabStatusText.innerText = 'Active Tab: Not Google Maps';
      tabStatusText.style.color = '#fbbf24';
      btnStartText.innerText = 'Open Google Maps & Start';
      const query = targetSearchQuery || (inputSearchQuery ? inputSearchQuery.value.trim() : '');
      if (query) {
        showNotice(`Clicking "Open Google Maps & Start" will launch "${query}" in Google Maps.`, 'info');
      } else {
        showNotice('Clicking "Open Google Maps & Start" will switch you to Google Maps in a new tab.', 'warning');
      }
    }
  }
  updateTabStatus();

  // Watch for search query input without wiping active scraped leads
  function handleSearchQueryChange() {
    const currentQuery = detectSearchQuery();
    if (currentQuery && currentQuery !== 'Google Maps Query' && currentQuery !== lastDetectedQuery) {
      lastDetectedQuery = currentQuery;
      if (inputSearchQuery && !inputSearchQuery.value) {
        inputSearchQuery.value = currentQuery;
        targetSearchQuery = currentQuery;
      }
      updateTabStatus();
    }
  }

  if (isGoogleMaps) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const target = e.target;
        if (target && target.id === 'searchboxinput') {
          setTimeout(handleSearchQueryChange, 800);
        }
      }
    });
  }

  // Programmatically execute search on Google Maps in the active tab
  async function executeGoogleMapsSearch(query) {
    if (!query) return false;
    const searchInput = document.querySelector('input#searchboxinput, input[name="q"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.value = query;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));

      const searchBtn = document.querySelector('button#searchbox-searchbutton, button[aria-label*="Search" i]');
      if (searchBtn && typeof searchBtn.click === 'function') {
        searchBtn.click();
      } else {
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        searchInput.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        searchInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
      }

      statStatusText.innerText = `Searching Maps for "${query}"...`;
      const start = Date.now();
      while (Date.now() - start < 3000) {
        await new Promise((r) => setTimeout(r, 200));
        const cards = document.querySelectorAll('div.Nv2PK, div[role="article"]');
        if (cards.length > 0) break;
      }
      await new Promise((r) => setTimeout(r, 400));
      return true;
    }
    return false;
  }

  // Helper to build Google Maps URL with embedded filter parameters, query & auth token
  function buildMapsUrl(autoStart = false, query = '') {
    const q = new URLSearchParams({
      lf_cap: String(maxLeadsTarget),
      lf_noweb: String(activeFilters.noWebsiteOnly),
      lf_phone: String(activeFilters.mustHavePhone),
      lf_rating: activeFilters.maxRating,
      lf_reviews: activeFilters.maxReviews,
    });
    if (autoStart) {
      q.set('lf_autostart', '1');
    }
    if (authToken) {
      q.set('lf_token', authToken);
    }
    const cleanQuery = (query || (inputSearchQuery ? inputSearchQuery.value : '') || targetSearchQuery || '').trim();
    if (cleanQuery) {
      q.set('lf_query', cleanQuery);
      return `https://www.google.com/maps/search/${encodeURIComponent(cleanQuery).replace(/%20/g, '+')}?${q.toString()}`;
    }
    return `https://www.google.com/maps?${q.toString()}`;
  }

  // Handle "Open Google Maps & Start" from a non-maps tab
  function handleOpenMapsAndStart() {
    saveSettings(true); // Save with autoStart flag!
    const query = (inputSearchQuery ? inputSearchQuery.value : '').trim() || targetSearchQuery;
    const targetUrl = buildMapsUrl(true, query);

    // OPEN IN A NEW TAB (preserving current page)
    window.open(targetUrl, '_blank');

    showNotice(
      query
        ? `🚀 Google Maps opened with search "${query}"! Switch to the new tab and click your LeadFinder bookmark once to auto-run.`
        : `🚀 Google Maps opened in a new tab! Switch to the new tab and click your LeadFinder bookmark once to auto-run.`,
      'success'
    );
  }

  // Navigation Buttons
  btnOpenMaps.addEventListener('click', () => {
    if (isGoogleMaps) {
      const searchInput = document.querySelector('input#searchboxinput');
      if (searchInput) searchInput.focus();
    } else {
      saveSettings(false);
      const query = (inputSearchQuery ? inputSearchQuery.value : '').trim() || targetSearchQuery;
      const targetUrl = buildMapsUrl(false, query);
      // OPEN IN A NEW TAB
      window.open(targetUrl, '_blank');
      showNotice('Google Maps opened in a new tab with your filters ready.', 'info');
    }
  });

  btnDashboard.addEventListener('click', () => {
    window.open('http://localhost:5173/#crm', '_blank');
  });

  // Minimize / Expand logic
  btnMinimize.addEventListener('click', () => {
    container.style.display = 'none';
    minPill.style.display = 'flex';
  });

  minPill.addEventListener('click', () => {
    minPill.style.display = 'none';
    container.style.display = 'block';
  });

  btnClose.addEventListener('click', () => {
    if (isScraping) {
      isScraping = false;
    }
    container.remove();
    minPill.remove();
  });

  // Make header draggable
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  const headerEl = document.getElementById('lf-drag-header');

  headerEl.addEventListener('mousedown', (e) => {
    if (e.target.closest('.header-actions')) return; // Ignore clicks on buttons/status
    isDragging = true;
    dragOffsetX = e.clientX - container.getBoundingClientRect().left;
    dragOffsetY = e.clientY - container.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const newLeft = Math.max(10, Math.min(window.innerWidth - container.offsetWidth - 10, e.clientX - dragOffsetX));
    const newTop = Math.max(10, Math.min(window.innerHeight - container.offsetHeight - 10, e.clientY - dragOffsetY));
    container.style.left = `${newLeft}px`;
    container.style.top = `${newTop}px`;
    container.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // UI Stats update
  function updateStats() {
    const total = scrapedLeadsMap.size;
    statScraped.innerText = total;
    if (minText) minText.innerText = `${total} Leads Scraped`;

    const pct = Math.min(100, Math.round((total / maxLeadsTarget) * 100));
    statProgressFill.style.width = `${pct}%`;
  }

  // Update button visual state (locks scraper if user is not authenticated)
  function updateStartButtonState() {
    if (!currentUser) {
      btnStart.className = 'btn btn-secondary';
      btnStart.style.background = '#334155';
      btnStart.style.color = '#f8fafc';
      btnStart.style.borderColor = '#475569';
      btnStartText.innerText = '🔒 Log In to Start Scraper';
      btnStartIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
      statStatusText.innerText = 'Auth Required';
      statStatusText.style.color = '#f87171';
      return;
    }

    btnStart.style.background = '';
    btnStart.style.color = '';
    btnStart.style.borderColor = '';

    if (isScraping) {
      btnStart.className = 'btn btn-stop';
      btnStartText.innerText = 'Stop Scraper';
      btnStartIcon.innerHTML = '<rect x="6" y="6" width="12" height="12" fill="currentColor"></rect>';
      statStatusText.innerText = 'Scraping in progress...';
      statStatusText.style.color = '#38bdf8';
    } else {
      btnStart.className = 'btn btn-primary';
      btnStartText.innerText = isGoogleMaps ? 'Start Scraper' : 'Open Google Maps & Start';
      btnStartIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
      statStatusText.innerText = 'Ready';
      statStatusText.style.color = '#94a3b8';
    }
  }

  // Detect Search Query from Google Maps Input or URL
  function detectSearchQuery() {
    const inputEl = document.querySelector('input#searchboxinput');
    if (inputEl && inputEl.value) return inputEl.value.trim();
    const urlMatch = window.location.href.match(/\/maps\/search\/([^/]+)/);
    if (urlMatch && urlMatch[1]) return decodeURIComponent(urlMatch[1].replace(/\+/g, ' '));
    const placeMatch = window.location.href.match(/\/maps\/place\/([^/]+)/);
    if (placeMatch && placeMatch[1]) return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return 'Google Maps Query';
  }

  // Feed container discovery with multi-strategy & parent walk
  function getFeedContainer() {
    // 1. PRIMARY STRATEGY: Find any visible lead card and walk up to its scrollable ancestor!
    // This GUARANTEES we target the search results feed and never get confused by place detail panels.
    const cardEl = document.querySelector('div.Nv2PK, div[role="article"]');
    if (cardEl) {
      let cur = cardEl.parentElement;
      while (cur && cur !== document.body) {
        const style = window.getComputedStyle(cur);
        const overflowY = style.overflowY || style.overflow;
        if (
          (overflowY === 'auto' || overflowY === 'scroll') ||
          (cur.scrollHeight > cur.clientHeight && cur.clientHeight > 100)
        ) {
          return cur;
        }
        cur = cur.parentElement;
      }
    }

    // 2. Specialized role="feed"
    const feedRole = document.querySelector('div[role="feed"]');
    if (feedRole) return feedRole;

    // 3. Multi-language candidates (English, French, Spanish, German, Italian, etc.)
    const candidates = [
      'div[aria-label*="Results for"]',
      'div[aria-label*="Results"]',
      'div[aria-label*="Résultats pour"]',
      'div[aria-label*="Résultats"]',
      'div[aria-label*="Resultados de"]',
      'div[aria-label*="Resultados"]',
      'div[aria-label*="Ergebnisse für"]',
      'div[aria-label*="Ergebnisse"]',
      'div[aria-label*="Risultati per"]',
      'div.m6QErb.section-scrollbox',
      '#qa3WKe',
    ];

    for (const sel of candidates) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        let current = el;
        while (current && current !== document.body) {
          const style = window.getComputedStyle(current);
          const overflowY = style.overflowY || style.overflow;
          const isScrollable =
            overflowY === 'auto' ||
            overflowY === 'scroll' ||
            (current.scrollHeight > current.clientHeight && current.clientHeight > 0);
          if (isScrollable) return current;
          current = current.parentElement;
        }
      }
    }

    return (
      document.querySelector('div[role="feed"]') ||
      document.querySelector('div[aria-label*="Results"]') ||
      document.querySelector('div[aria-label*="Résultats"]') ||
      document.querySelector('.m6QErb.DshB1')
    );
  }

  // URL cleaning
  function cleanAndDecodeUrl(href) {
    if (!href) return null;
    let target = href.trim();

    if (target.includes('google.com/url?') || target.includes('google.com/url') || target.includes('/url?q=')) {
      try {
        const urlObj = new URL(target.startsWith('http') ? target : 'https://www.google.com' + target);
        const q = urlObj.searchParams.get('q');
        if (q) target = q;
      } catch (e) {
        const match = target.match(/[?&]q=([^&]+)/);
        if (match && match[1]) target = decodeURIComponent(match[1]);
      }
    }

    if (!target) return null;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (/^(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(target)) {
        target = `https://${target}`;
      } else {
        return null;
      }
    }

    const lower = target.toLowerCase();
    if (
      lower.includes('google.com') ||
      lower.includes('googleadservices.com') ||
      lower.includes('gstatic.com') ||
      lower.includes('ggpht.com') ||
      lower.includes('schema.org') ||
      lower.includes('waze.com')
    ) {
      return null;
    }

    return target;
  }

  // Extract website from card
  function extractWebsiteUrl(card) {
    if (!card) return null;

    const selectors = [
      'a[aria-label*="Website"]',
      'a[aria-label*="website"]',
      'a[aria-label*="Site"]',
      'a[aria-label*="site"]',
      'a[data-value="Website"]',
      'a[data-value="website"]',
      'a[data-tooltip*="Website"]',
      'a.lCanBc',
      'a.authority',
      'a[data-value*="website"]',
    ];

    for (const sel of selectors) {
      const btns = card.querySelectorAll(sel);
      for (const btn of btns) {
        const href = btn.getAttribute('href') || btn.getAttribute('data-url');
        const decoded = cleanAndDecodeUrl(href);
        if (decoded) return decoded;
      }
    }

    const anchors = card.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href');
      const decoded = cleanAndDecodeUrl(href);
      if (decoded) return decoded;
    }

    const cardText = card.innerText || '';
    const lines = cardText.split('\n');
    for (const line of lines) {
      const domainMatch = line.trim().match(
        /\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)\b/i
      );
      if (domainMatch && domainMatch[0]) {
        const candidate = domainMatch[0].trim();
        const decoded = cleanAndDecodeUrl(candidate.startsWith('http') ? candidate : `https://${candidate}`);
        if (decoded) return decoded;
      }
    }

    return null;
  }

  // Universal Helper for Phone Number Cleansing
  function cleanPhone(raw) {
    if (!raw) return '';
    return raw.replace(/^[^\d+(]+/, '').replace(/[^\d)]+$/, '').trim();
  }

  // Universal Validator for Phone Number strings
  function isPhoneNumber(str) {
    if (!str) return false;
    const s = str.trim();
    // Reject currency symbols
    if (/[\$€£₹¥₽]/.test(s)) return false;
    // Reject words with 3+ letters
    if (/[a-zA-Z\u00C0-\u024F]{3,}/.test(s)) return false;

    const digits = s.replace(/\D/g, '');
    // Global phone numbers have 7 to 15 digits
    if (digits.length < 7 || digits.length > 15) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    // Must match phone punctuation & digit structure
    return /^(\+?\d{1,4}[\s.\-\/]?)?(\(?\d{1,5}\)?[\s.\-\/]?)?[\d\s.\-\/]{4,14}\d$/.test(s);
  }

  // Universal Scanner for Phone Numbers from any string
  function extractPhoneFromAnyText(text) {
    if (!text) return null;

    const phonePatterns = [
      // 1. International format (+33..., +91..., +1..., +44...)
      /(?:(?:\+|00)[1-9]\d{0,3}[\s.\-\/]?)?(?:\(?\d{1,5}\)?[\s.\-\/]?)[\d\s.\-\/]{6,14}\d/g,
      // 2. French/European 10-digit formats (01 42 68 00 00, 06.12.34.56.78, 01-42-68-00-00)
      /(?:0[1-9][\s.\-\/]?[0-9]{2}[\s.\-\/]?[0-9]{2}[\s.\-]?[0-9]{2}[\s.\-]?[0-9]{2})/g,
      // 3. Indian 10-digit mobile or STD landline (9876543210, 098765 43210, 011 2341 5678)
      /(?:[6-9]\d{9}|0[1-9]\d{8,10})/g,
      // 4. US/UK standard format (214-555-1234, (214) 555-1234, 020 7946 0912)
      /(?:\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/g,
      // 5. Generic continuous 8-14 digits
      /(?:\b\d{8,14}\b)/g,
    ];

    for (const pat of phonePatterns) {
      const matches = text.match(pat);
      if (matches) {
        for (const m of matches) {
          const candidate = m.trim();
          // Skip ISO dates like 2026-09-29
          if (/^\d{4}[\-\/]\d{2}[\-\/]\d{2}$/.test(candidate)) continue;
          const digits = candidate.replace(/\D/g, '');
          if (digits.length >= 7 && digits.length <= 15) {
            if (!/^(\d)\1+$/.test(digits)) {
              return cleanPhone(candidate);
            }
          }
        }
      }
    }
    return null;
  }

  // Universal Phone Extractor across element, attributes, tooltips, and text
  function extractPhone(container) {
    if (!container) return null;

    // 1. Direct tel link
    const telLink = container.querySelector('a[href^="tel:"]');
    if (telLink) {
      const raw = (telLink.getAttribute('href') || '').replace(/^tel:/i, '').trim();
      if (raw) return cleanPhone(raw);
    }

    // 2. Specific phone data-item-id
    const phoneBtn = container.querySelector('[data-item-id*="phone"] .Io6YTe, [data-item-id*="phone"]');
    if (phoneBtn) {
      const text = phoneBtn.innerText.trim();
      const p = extractPhoneFromAnyText(text) || (isPhoneNumber(text) ? cleanPhone(text) : null);
      if (p) return p;
    }

    // 3. Aria-labels or tooltips on buttons (Appeler, Call, Llamar, Anrufen, Chiama)
    const callButtons = container.querySelectorAll(
      'button[aria-label*="phone" i], button[aria-label*="call" i], button[aria-label*="appeler" i], button[aria-label*="llamar" i], button[aria-label*="anrufen" i], button[aria-label*="chiama" i], button[data-tooltip*="phone" i], button[data-tooltip*="call" i], button[data-tooltip*="appeler" i], button[data-tooltip*="llamar" i]'
    );
    for (const btn of callButtons) {
      const text = btn.getAttribute('aria-label') || btn.getAttribute('data-tooltip') || '';
      const phone = extractPhoneFromAnyText(text);
      if (phone) return phone;
    }

    // 4. Check each .W4Efsd info block line
    const infoLines = container.querySelectorAll('.W4Efsd');
    for (const line of infoLines) {
      const lineText = line.innerText.trim();
      if (!lineText) continue;

      // Check parts split by middle dots or bullets
      const parts = lineText.split(/[\u00b7\u22c5\u2022\u2027·⋅•|]/).map((p) => p.trim());
      for (const p of parts) {
        if (isPhoneNumber(p)) {
          return cleanPhone(p);
        }
      }

      // Check whole line
      const fromLine = extractPhoneFromAnyText(lineText);
      if (fromLine) return fromLine;
    }

    // 5. Fallback: check entire container text
    return extractPhoneFromAnyText(container.innerText || '');
  }

  // Support for Single Place Pages (/maps/place/...) or Open Place Details Panel
  function parseCurrentSinglePlace() {
    const hasFeed = !!getFeedContainer();
    const isDirectPlaceUrl = window.location.href.includes('/maps/place/');
    if (hasFeed && !isDirectPlaceUrl) return false;

    try {
      const detailPane = document.querySelector('div[role="main"], div.m6QErb.DshB1');
      const nameEl = (detailPane || document).querySelector('h1.DUwDvf, h1.fontHeadlineLarge, h1');
      if (!nameEl) return false;
      const name = nameEl.innerText.trim();
      if (!name || name === 'Google Maps') return false;

      let rating = null;
      const ratingEl = (detailPane || document).querySelector('span.ceNzKf, div.F7nice span[aria-hidden="true"], span.ZkP5Je');
      if (ratingEl) {
        const match = ratingEl.innerText.match(/([0-9]+[.,][0-9]+|[0-9]+)/);
        if (match) rating = parseFloat(match[1].replace(',', '.'));
      }

      let reviewCount = null;
      const reviewEl = (detailPane || document).querySelector(
        'div.F7nice span[aria-label*="review" i], span[aria-label*="review" i], span[aria-label*="avis" i]'
      );
      if (reviewEl) {
        const match = (reviewEl.getAttribute('aria-label') || reviewEl.innerText || '').replace(/[,. \u00a0\u202f]/g, '').match(/([0-9]+)/);
        if (match) reviewCount = parseInt(match[1], 10);
      }

      let category = null;
      const catEl = (detailPane || document).querySelector('button.DkEaL, button[jsaction*="pane.rating.category"]');
      if (catEl) category = catEl.innerText.trim();

      let phone = null;
      const phoneEl = (detailPane || document).querySelector(
        'button[data-item-id*="phone"] .Io6YTe, button[data-tooltip*="phone" i] .Io6YTe, [data-item-id*="phone"]'
      );
      if (phoneEl && phoneEl.innerText) {
        const pText = phoneEl.innerText.trim();
        phone = extractPhoneFromAnyText(pText) || (isPhoneNumber(pText) ? cleanPhone(pText) : null);
      } else {
        const telLink = (detailPane || document).querySelector('a[href^="tel:"]');
        if (telLink) {
          phone = cleanPhone(telLink.getAttribute('href').replace(/^tel:/i, ''));
        }
      }

      let address = null;
      const addrEl = (detailPane || document).querySelector('button[data-item-id*="address"] .Io6YTe, [data-item-id="address"]');
      if (addrEl) address = addrEl.innerText.trim();

      let website = null;
      const webEl = (detailPane || document).querySelector('a[data-item-id*="authority"], a[aria-label*="Website" i], a[aria-label*="Site" i]');
      if (webEl) website = cleanAndDecodeUrl(webEl.getAttribute('href'));

      // Apply Pre-Scrape Filters
      if (activeFilters.noWebsiteOnly && website) return false;
      if (activeFilters.mustHavePhone && !phone) return false;
      if (activeFilters.maxRating !== 'any' && rating !== null) {
        const cap = parseFloat(activeFilters.maxRating);
        if (!isNaN(cap) && rating > cap) return false;
      }
      if (activeFilters.maxReviews !== 'any' && reviewCount !== null) {
        const cap = parseInt(activeFilters.maxReviews, 10);
        if (!isNaN(cap) && reviewCount > cap) return false;
      }

      const uniqueKey = `${name}_${address || ''}_${phone || ''}`.toLowerCase();
      if (!scrapedLeadsMap.has(uniqueKey)) {
        scrapedLeadsMap.set(uniqueKey, {
          name,
          category,
          address,
          phone,
          website,
          rating,
          reviewCount,
          googleMapsUrl: window.location.href,
          searchQuery: detectSearchQuery(),
        });
        updateStats();
        showNotice(`Extracted place "${name}" ✅`, 'success');
        return true;
      }
    } catch (e) {
      console.warn('Error parsing single place:', e);
    }
    return false;
  }

  // Helpers for Rating and Review Extraction
  function extractRating(container) {
    if (!container) return null;
    const ratingEl = container.querySelector(
      '.MW4pfd, span[aria-label*="star" i], span[aria-label*="étoile" i], span[aria-label*="estrella" i], span[aria-label*="stern" i], span.ceNzKf, span.ZkP5Je'
    );
    if (ratingEl) {
      const ratingText = ratingEl.innerText || ratingEl.getAttribute('aria-label') || '';
      const match = ratingText.match(/([0-9]+[.,][0-9]+|[0-9]+)/);
      if (match) return parseFloat(match[1].replace(',', '.'));
    }
    return null;
  }

  function extractReviewCount(container) {
    if (!container) return null;
    const reviewEl = container.querySelector(
      '.UY7F9, span[aria-label*="review" i], span[aria-label*="avis" i], span[aria-label*="opinione" i], span[aria-label*="bewertung" i], div.F7nice span[aria-label*="review" i]'
    );
    if (reviewEl) {
      const reviewText = (reviewEl.getAttribute('aria-label') || reviewEl.innerText || '').replace(/[,. \u00a0\u202f]/g, '');
      const match = reviewText.match(/([0-9]+)/);
      if (match) return parseInt(match[1], 10);
    }
    return null;
  }

  // Set of card identifiers already inspected in this session
  const inspectedCardsSet = new Set();

  // Helper to safely click Back button and return to search list
  async function returnToFeedList() {
    const getBack = () => {
      const btn = document.querySelector(
        'button[jsaction*="pane.back"], button[aria-label="Back"], button[aria-label="Retour"], button[aria-label="Volver"], button[aria-label="Zurück"], button[aria-label*="Back" i], button[aria-label*="Retour" i], button[aria-label*="Back to search results" i], button[aria-label*="Retour aux résultats" i], button[data-tooltip*="Back" i], header button[jsaction*="back"], button.VfPpkd-icon-LgbsSe[jsaction*="back"], button.hArJGc'
      );
      if (!btn) return null;
      if (btn.offsetParent === null && window.getComputedStyle(btn).display === 'none') return null;
      return btn;
    };

    let backBtn = getBack();
    if (!backBtn) return true; // Already on the feed list!

    if (backBtn && typeof backBtn.click === 'function') {
      backBtn.click();
    }

    // Wait up to 800ms for search results feed to reappear
    const start = Date.now();
    while (Date.now() - start < 800) {
      if (getFeedContainer() && !getBack()) break;
      await new Promise((r) => setTimeout(r, 45));
      backBtn = getBack();
      if (backBtn && Date.now() - start > 400) {
        try { backBtn.click(); } catch (e) {}
      }
    }

    if (getBack()) {
      try { window.history.back(); } catch (e) {}
      await new Promise((r) => setTimeout(r, 250));
    }
    return !!getFeedContainer();
  }

  // Helper to check if two business names match
  function isPlaceNameMatch(targetName, candidateName) {
    if (!targetName || !candidateName) return false;
    const clean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const c1 = clean(targetName);
    const c2 = clean(candidateName);
    if (!c1 || !c2) return false;
    if (c1 === c2) return true;
    const minLen = Math.min(c1.length, c2.length);
    const maxLen = Math.max(c1.length, c2.length);
    return minLen >= 4 && (c1.includes(c2) || c2.includes(c1)) && (minLen / maxLen > 0.4);
  }

  // Deep Place Details Inspector (clicks card, reads phone/website strictly from active pane, returns to feed)
  async function inspectCardDetails(card, expectedName) {
    const targetName = expectedName || (card.querySelector('.qBF1Pd, .fontHeadlineSmall')?.innerText || '').trim();
    const clickTarget =
      card.querySelector('a.hfTTh') ||
      card.querySelector('.qBF1Pd, .fontHeadlineSmall') ||
      card;
    if (!clickTarget) return null;

    try {
      if (typeof clickTarget.click === 'function') {
        clickTarget.click();
      } else {
        clickTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    } catch (e) {
      console.warn('Error clicking card:', e);
    }

    // Poll up to 1200ms for THIS specific place's details pane to appear (heading matching target name)
    const start = Date.now();
    let matchedPane = null;
    while (Date.now() - start < 1200) {
      const headings = Array.from(document.querySelectorAll('h1.DUwDvf, h1.fontHeadlineLarge, div[role="main"] h1'));
      for (const h1 of headings) {
        if (h1 && h1.innerText && isPlaceNameMatch(targetName, h1.innerText)) {
          matchedPane = h1.closest('div[role="main"]') || h1.closest('div.m6QErb') || h1.parentElement;
          break;
        }
      }
      if (matchedPane) break;
      await new Promise((r) => setTimeout(r, 45));
    }

    if (!matchedPane) {
      // Could not verify active pane for target business; safely return to feed without capturing stale data
      await returnToFeedList();
      return null;
    }

    // Buffer for DOM text hydration inside the newly active pane
    await new Promise((r) => setTimeout(r, 60));

    // STRICTLY query inside matchedPane — never globally on document or document.body
    let phone = null;
    const phoneEl = matchedPane.querySelector(
      'button[data-item-id*="phone"] .Io6YTe, button[data-tooltip*="phone" i] .Io6YTe, [data-item-id*="phone"]'
    );
    if (phoneEl && phoneEl.innerText) {
      const pText = phoneEl.innerText.trim();
      phone = extractPhoneFromAnyText(pText) || (isPhoneNumber(pText) ? cleanPhone(pText) : null);
    } else {
      const telLink = matchedPane.querySelector('a[href^="tel:"]');
      if (telLink) {
        phone = cleanPhone(telLink.getAttribute('href').replace(/^tel:/i, ''));
      } else {
        const callBtn = matchedPane.querySelector(
          'button[aria-label*="phone" i], button[aria-label*="call" i], button[aria-label*="appeler" i], button[aria-label*="llamar" i], button[data-tooltip*="phone" i], button[data-tooltip*="call" i]'
        );
        if (callBtn) {
          const text = callBtn.getAttribute('aria-label') || callBtn.getAttribute('data-tooltip') || '';
          phone = extractPhoneFromAnyText(text);
        }
      }
    }

    let website = null;
    const webEl = matchedPane.querySelector(
      'a[data-item-id="authority"], a[aria-label*="Website" i], a[aria-label*="Site Web" i], a[aria-label*="Site web" i], a[aria-label*="Sitio web" i], a[aria-label*="Webseite" i]'
    );
    if (webEl) {
      const clean = cleanAndDecodeUrl(webEl.getAttribute('href'));
      if (clean) website = clean;
    }

    let address = null;
    const addrEl = matchedPane.querySelector('button[data-item-id="address"] .Io6YTe, [data-item-id="address"]');
    if (addrEl && addrEl.innerText) {
      address = addrEl.innerText.trim();
    }

    let category = null;
    const catEl = matchedPane.querySelector('button.DkEaL, button[jsaction*="pane.rating.category"], span.DkEaL');
    if (catEl && catEl.innerText) {
      category = catEl.innerText.trim();
    }

    const rating = extractRating(matchedPane);
    const reviewCount = extractReviewCount(matchedPane);

    // ALWAYS return back to search feed
    await returnToFeedList();

    // Settle buffer after returning back so feed is interactive for subsequent inspections
    await new Promise((r) => setTimeout(r, 100));

    return { phone, website, address, category, rating, reviewCount };
  }

  // Parse cards with FULL filter enforcement and Deep Inspection when phone is hidden in summary
  async function parseVisibleCards(allowClickInspection = true) {
    const currentQuery = detectSearchQuery();
    let newlyExtracted = 0;
    let skippedNoPhone = 0;
    let skippedHasWebsite = 0;
    let skippedRating = 0;
    let skippedReviews = 0;

    let maxInspectionPasses = 30;
    while (isScraping && maxInspectionPasses > 0) {
      maxInspectionPasses--;
      if (scrapedLeadsMap.size >= maxLeadsTarget) break;

      const liveCards = Array.from(document.querySelectorAll('div.Nv2PK, div[role="article"]'));
      // Find the first card in current DOM view that has not yet been processed
      const uninspectedCard = liveCards.find((card) => {
        const linkEl = card.querySelector('a.hfTTh, a[href*="/maps/place/"]');
        const nameEl = card.querySelector('.qBF1Pd, .fontHeadlineSmall');
        const key = (linkEl?.getAttribute('href') || nameEl?.innerText || '').toLowerCase();
        return key && !inspectedCardsSet.has(key);
      });

      if (!uninspectedCard) {
        break; // All visible cards currently loaded have been inspected
      }

      const card = uninspectedCard;
      const nameEl = card.querySelector('.qBF1Pd, .fontHeadlineSmall');
      if (!nameEl) continue;
      const name = nameEl.innerText.trim();
      if (!name || name === 'Google Maps') continue;

      let googleMapsUrl = null;
      const linkEl = card.querySelector('a.hfTTh, a[href*="/maps/place/"]');
      if (linkEl) {
        googleMapsUrl = linkEl.getAttribute('href');
        if (googleMapsUrl && !googleMapsUrl.startsWith('http')) {
          googleMapsUrl = 'https://www.google.com' + googleMapsUrl;
        }
      }

      const cardKey = (googleMapsUrl || name).toLowerCase();
      inspectedCardsSet.add(cardKey);

      // Multilingual Rating & Review Count from summary
      let rating = extractRating(card);
      let reviewCount = extractReviewCount(card);

      // Category, Address, Phone parsing from summary card lines
      let category = null;
      let address = null;
      let phone = extractPhone(card);
      let website = extractWebsiteUrl(card);

      const infoLines = card.querySelectorAll('.W4Efsd');
      infoLines.forEach((line) => {
        const text = line.innerText.trim();
        if (!text) return;

        if (!phone) {
          phone = extractPhone(line);
        }

        const parts = text.split(/[\u00b7\u22c5\u2022\u2027·⋅•|]/).map((p) => p.trim()).filter(Boolean);

        for (const p of parts) {
          if (isPhoneNumber(p)) {
            if (!phone) phone = cleanPhone(p);
            continue;
          }

          const lower = p.toLowerCase();
          const isIgnored =
            /[\$€£₹¥₽]/.test(p) ||
            /^\d+([.,]\d+)?\s*\(\d+/.test(p) ||
            lower.includes('open') ||
            lower.includes('closed') ||
            lower.includes('ouvert') ||
            lower.includes('fermé') ||
            lower.includes('abierto') ||
            lower.includes('geschlossen') ||
            lower.includes('dine-in') ||
            lower.includes('takeaway') ||
            lower.includes('delivery') ||
            lower.includes('sur place') ||
            lower.includes('emporter') ||
            lower.includes('livraison');

          if (isIgnored) continue;

          if (!category) {
            category = p;
            continue;
          }

          if (!address && p.length > 3) {
            address = p;
          }
        }
      });

      // Quick filter check before deep inspect:
      // If user specified maxRating or maxReviews and this summary card clearly exceeds it, skip!
      if (activeFilters.maxRating !== 'any' && rating !== null) {
        const maxR = parseFloat(activeFilters.maxRating);
        if (!isNaN(maxR) && rating > maxR) {
          skippedRating++;
          continue;
        }
      }
      if (activeFilters.maxReviews !== 'any' && reviewCount !== null) {
        const maxRev = parseInt(activeFilters.maxReviews, 10);
        if (!isNaN(maxRev) && reviewCount > maxRev) {
          skippedReviews++;
          continue;
        }
      }

      // Check if Deep Inspection is needed:
      // When summary card does not display phone and user wants phone, OR user wants no-website only and summary has no website or phone
      const needsDeepInspect =
        allowClickInspection &&
        ((!phone && activeFilters.mustHavePhone) || (!website && activeFilters.noWebsiteOnly));

      if (needsDeepInspect) {
        statStatusText.innerText = `Inspecting "${name}" details... (${scrapedLeadsMap.size}/${maxLeadsTarget})`;
        const details = await inspectCardDetails(card, name);
        if (details) {
          if (details.phone) phone = details.phone;
          if (details.website) website = details.website;
          if (details.address) address = details.address;
          if (details.category) category = details.category;
          if (details.rating !== null && rating === null) rating = details.rating;
          if (details.reviewCount !== null && reviewCount === null) reviewCount = details.reviewCount;
        }
      }

      // ENFORCE ALL 4 PRE-SCRAPE QUALITY CONTROL FILTERS
      if (activeFilters.noWebsiteOnly && website) {
        skippedHasWebsite++;
        continue;
      }
      if (activeFilters.mustHavePhone && !phone) {
        skippedNoPhone++;
        continue;
      }
      if (activeFilters.maxRating !== 'any' && rating !== null) {
        const maxR = parseFloat(activeFilters.maxRating);
        if (!isNaN(maxR) && rating > maxR) {
          skippedRating++;
          continue;
        }
      }
      if (activeFilters.maxReviews !== 'any' && reviewCount !== null) {
        const maxRev = parseInt(activeFilters.maxReviews, 10);
        if (!isNaN(maxRev) && reviewCount > maxRev) {
          skippedReviews++;
          continue;
        }
      }

      const uniqueKey = (googleMapsUrl || `${name}_${address || ''}_${phone || ''}`).toLowerCase();
      const existingLead = scrapedLeadsMap.get(uniqueKey);

      if (!existingLead) {
        scrapedLeadsMap.set(uniqueKey, {
          name,
          category,
          address,
          phone,
          website,
          rating,
          reviewCount,
          googleMapsUrl,
          searchQuery: currentQuery,
        });
        newlyExtracted++;
        updateStats();
        showNotice(`Extracted: "${name}" ${phone ? '📞 ' + phone : ''} ${!website ? '⭐ (No Web)' : ''}`, 'success');

        if (allowClickInspection) {
          await new Promise((r) => setTimeout(r, 200));
        }
      } else {
        if (!existingLead.website && website) existingLead.website = website;
        if (!existingLead.phone && phone) existingLead.phone = phone;
        if (!existingLead.category && category) existingLead.category = category;
        if (!existingLead.address && address) existingLead.address = address;
        if (!existingLead.rating && rating) existingLead.rating = rating;
        if (!existingLead.reviewCount && reviewCount) existingLead.reviewCount = reviewCount;
      }
    }

    updateStats();
    return newlyExtracted;
  }

  // Stealth Human-Emulated Auto-Scroll & Deep Extraction Engine
  async function runStealthScrollLoop() {
    let feed = getFeedContainer();

    // Try extracting any open single place first (e.g. details panel open on maps)
    parseCurrentSinglePlace();

    if (!feed) {
      const backBtn = document.querySelector(
        'button[aria-label*="Back" i], button[aria-label*="Retour" i], button[jsaction*="pane.back"]'
      );
      if (backBtn) {
        backBtn.click();
        await new Promise((r) => setTimeout(r, 1200));
        feed = getFeedContainer();
      }
    }

    if (!feed) {
      if (scrapedLeadsMap.size > 0) {
        showNotice(`Extracted open business! Search a category in Maps to crawl full lists.`, 'success');
      } else {
        showNotice('Could not find Google Maps feed. Search an industry/city first!', 'warning');
      }
      isScraping = false;
      updateStartButtonState();
      return;
    }

    let noNewLeadsCount = 0;
    let lastSize = scrapedLeadsMap.size;

    while (isScraping && !isPaused) {
      if (scrapedLeadsMap.size >= maxLeadsTarget) {
        showNotice(`Target cap of ${maxLeadsTarget} leads reached! Auto-syncing...`, 'success');
        break;
      }

      // Process visible items (with deep inspection for phone numbers)
      await parseVisibleCards(true);

      if (scrapedLeadsMap.size === lastSize) {
        noNewLeadsCount++;
      } else {
        noNewLeadsCount = 0;
        lastSize = scrapedLeadsMap.size;
      }

      // Check if end of list reached (multi-language support)
      const endEl = document.querySelector('.H2A7ed, .pbTBAe');
      const hasEndText = Array.from(document.querySelectorAll('span.H2A7ed, div.H2A7ed, span, p')).some(
        (el) =>
          el.innerText &&
          (el.innerText.includes("You've reached the end of the list") ||
            el.innerText.includes('Vous avez atteint la fin de la liste') ||
            el.innerText.includes('Has llegado al final de la lista') ||
            el.innerText.includes('Sie haben das Ende der Liste erreicht'))
      );
      if ((endEl && endEl.offsetParent !== null) || hasEndText) {
        showNotice('Reached the end of Google Maps results!', 'info');
        break;
      }

      if (noNewLeadsCount > 15) {
        showNotice('No new results found after repeated scrolling. Finishing crawl...', 'info');
        break;
      }

      feed = getFeedContainer() || feed;
      if (!feed) {
        await returnToFeedList();
        feed = getFeedContainer();
      }
      if (!feed) break;

      // MULTI-STRATEGY DEEP SCROLL TO GUARANTEE CONTINUOUS LAZY-LOADING
      const scrollStep = Math.floor(400 + Math.random() * 400);

      // 1. Smooth scrollBy API
      if (typeof feed.scrollBy === 'function') {
        feed.scrollBy({ top: scrollStep, behavior: 'smooth' });
      }

      // 2. Direct incremental scrollTop adjustment
      feed.scrollTop += scrollStep;

      // 3. Scroll to full container bottom
      feed.scrollTop = feed.scrollHeight;

      // 4. Scroll last card element into view
      const cardElements = document.querySelectorAll('div.Nv2PK, div[role="article"]');
      if (cardElements.length > 0) {
        const lastCard = cardElements[cardElements.length - 1];
        if (lastCard && typeof lastCard.scrollIntoView === 'function') {
          lastCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }

      // 5. If stuck, micro-bounce up and down to trigger lazy loading event
      if (noNewLeadsCount > 3) {
        feed.scrollTop = Math.max(0, feed.scrollTop - 400);
        await new Promise((r) => setTimeout(r, 400));
        feed.scrollTop = feed.scrollHeight;
      }

      feed.dispatchEvent(new Event('scroll', { bubbles: true }));
      window.dispatchEvent(new Event('scroll', { bubbles: true }));

      // Delay between scrolls (1.8s - 3.5s)
      const randomDelay = Math.floor(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
      statStatusText.innerText = `Micro-scroll (${scrapedLeadsMap.size}/${maxLeadsTarget} leads)...`;

      await new Promise((resolve) => setTimeout(resolve, randomDelay));
    }

    // Final pass
    await parseVisibleCards(false);
    const count = scrapedLeadsMap.size;
    isScraping = false;
    updateStartButtonState();

    if (count > 0) {
      showNotice(`Crawl completed! ${count} leads extracted. Syncing to CRM...`, 'info');
      await syncLeadsToBackend();
    } else {
      const cardElements = document.querySelectorAll('div.Nv2PK, div[role="article"]');
      if (cardElements.length > 0 && activeFilters.mustHavePhone) {
        showNotice(
          `Crawl finished with 0 leads: places skipped because they didn't match filters. Try unchecking "Must Have Phone Number" or "Only Leads WITH NO WEBSITE".`,
          'warning'
        );
      } else {
        showNotice('No matching leads found for current filters.', 'info');
      }
    }
  }

  // Start a fresh scraping session
  function startScrapingSession() {
    scrapedLeadsMap.clear();
    inspectedCardsSet.clear();
    try { localStorage.removeItem('leadfinder_leads'); } catch (e) {}
    updateStats();

    isScraping = true;
    isPaused = false;
    updateStartButtonState();
    runStealthScrollLoop();
  }

  // Toggle Scraping (guarded by active user session)
  function toggleScraping() {
    saveSettings(false);

    if (!currentUser) {
      showNotice('🔒 Authentication required! Please log in to LeadFinder to use the scraper.', 'warning');
      window.open('http://localhost:5173/#crm', '_blank');
      return;
    }

    if (!isGoogleMaps) {
      handleOpenMapsAndStart();
      return;
    }

    if (!isScraping) {
      const typedQuery = (inputSearchQuery ? inputSearchQuery.value : '').trim();
      const currentQuery = detectSearchQuery();
      // If user typed a specific query in the bookmarklet input that hasn't been searched on Maps yet
      if (typedQuery && (currentQuery === 'Google Maps Query' || typedQuery.toLowerCase() !== currentQuery.toLowerCase())) {
        (async () => {
          showNotice(`Searching Maps for "${typedQuery}"...`, 'info');
          await executeGoogleMapsSearch(typedQuery);
          startScrapingSession();
        })();
        return;
      }

      startScrapingSession();
    } else {
      isScraping = false;
      updateStartButtonState();
      showNotice('Scraping paused by user.', 'info');
    }
  }

  btnStart.addEventListener('click', toggleScraping);

  // Sync Leads to NestJS Backend Mutation (scoped to logged-in user)
  async function syncLeadsToBackend() {
    if (!currentUser) {
      showNotice('🔒 Login required: Cannot sync leads to CRM without an active user session.', 'warning');
      return false;
    }

    const leadsArray = Array.from(scrapedLeadsMap.values());
    if (leadsArray.length === 0) {
      showNotice('No leads collected yet to sync.', 'info');
      return false;
    }

    showNotice(`Syncing ${leadsArray.length} leads to your CRM account (${currentUser.name || currentUser.email})...`, 'info');

    // Backup to localStorage for safety
    try {
      localStorage.setItem('leadfinder_leads', JSON.stringify(leadsArray));
    } catch (e) {}

    const graphqlQuery = {
      query: `
        mutation SyncLeads($input: SyncLeadsInput!) {
          syncLeads(input: $input) {
            addedCount
            updatedCount
            totalProcessed
          }
        }
      `,
      variables: {
        input: {
          leads: leadsArray,
          filterOptions: {
            noWebsiteOnly: activeFilters.noWebsiteOnly,
            mustHavePhone: activeFilters.mustHavePhone,
            maxRating: activeFilters.maxRating,
            maxReviews: activeFilters.maxReviews,
          },
        },
      },
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(graphqlQuery),
      });

      const result = await response.json();
      if (result.data && result.data.syncLeads) {
        const { addedCount, updatedCount } = result.data.syncLeads;
        serverStatus.classList.add('online');
        lastSyncedLeads = [...leadsArray];
        showNotice(`✅ Synced! Added: ${addedCount}, Updated: ${updatedCount} in your CRM. Ready for next search!`, 'success');

        // CRITICAL RESET: Clear session map so user can immediately run next search without getting stuck
        scrapedLeadsMap.clear();
        try { localStorage.removeItem('leadfinder_leads'); } catch (e) {}
        updateStats();
        statStatusText.innerText = 'Ready';
        statStatusText.style.color = '#94a3b8';
        return true;
      } else if (result.errors && result.errors.length > 0) {
        const errMsg = result.errors[0].message || 'Sync error';
        showNotice(`⚠️ Sync failed: ${errMsg}`, 'warning');
        if (errMsg.toLowerCase().includes('auth') || errMsg.toLowerCase().includes('unauthorized')) {
          currentUser = null;
          if (authStatus) authStatus.classList.remove('authenticated');
          if (authStatusText) authStatusText.innerText = '🔒 Log In';
          if (authWarningBox) authWarningBox.classList.remove('hidden');
          updateStartButtonState();
        }
        return false;
      } else {
        showNotice('⚠️ Sync saved locally (GraphQL returned non-data format)', 'warning');
        return false;
      }
    } catch (err) {
      console.warn('Backend sync failed:', err);
      serverStatus.classList.remove('online');
      showNotice(`Saved ${leadsArray.length} leads in browser storage (Backend port 4000 offline)`, 'warning');
      return false;
    }
  }

  btnSyncNow.addEventListener('click', syncLeadsToBackend);

  // CSV Export utility (supports active session leads or last synced batch)
  function exportLeadsCsv() {
    const leadsArray = scrapedLeadsMap.size > 0
      ? Array.from(scrapedLeadsMap.values())
      : lastSyncedLeads;
    if (leadsArray.length === 0) {
      showNotice('No leads available to export.', 'warning');
      return;
    }

    const headers = ['Name', 'Category', 'Phone', 'Website', 'Rating', 'Reviews', 'Address', 'Google Maps URL'];
    const rows = leadsArray.map((l) => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.website || '').replace(/"/g, '""')}"`,
      l.rating || '',
      l.reviewCount || '',
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${(l.googleMapsUrl || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leadfinder_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`📥 Downloaded ${leadsArray.length} leads as CSV!`, 'success');
  }

  btnExportCsv.addEventListener('click', exportLeadsCsv);

  // Auto-extract open single place if present upon load
  if (isGoogleMaps) {
    parseCurrentSinglePlace();
  }
})();
