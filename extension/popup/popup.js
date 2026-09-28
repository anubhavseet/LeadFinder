document.addEventListener('DOMContentLoaded', async () => {
  const btnStart = document.getElementById('btn-start');
  const btnStartText = document.getElementById('btn-start-text');
  const btnOpenMaps = document.getElementById('btn-open-maps');
  const btnDashboard = document.getElementById('btn-dashboard');
  const selectMaxLeads = document.getElementById('max-leads');
  const filterNoWebsite = document.getElementById('filter-no-website');
  const filterMustPhone = document.getElementById('filter-must-phone');
  const filterMaxRating = document.getElementById('filter-max-rating');
  const filterMaxReviews = document.getElementById('filter-max-reviews');
  const statScraped = document.getElementById('stat-scraped');
  const serverStatus = document.getElementById('server-status');
  const tabStatusText = document.getElementById('tab-status-text');
  const noticeBanner = document.getElementById('notice-banner');
  const noticeText = document.getElementById('notice-text');

  function showNotice(msg, isWarning = false) {
    if (noticeText && noticeBanner) {
      noticeText.innerText = msg;
      noticeBanner.className = `notice-banner ${isWarning ? 'warning' : ''}`;
    }
  }

  function hideNotice() {
    if (noticeBanner) {
      noticeBanner.className = 'notice-banner hidden';
    }
  }

  // Load saved settings from chrome.storage.local
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(
      ['maxLeads', 'noWebsiteOnly', 'mustHavePhone', 'maxRating', 'maxReviews'],
      (items) => {
        if (items.maxLeads) selectMaxLeads.value = items.maxLeads;
        if (items.noWebsiteOnly !== undefined) filterNoWebsite.checked = items.noWebsiteOnly;
        if (items.mustHavePhone !== undefined) filterMustPhone.checked = items.mustHavePhone;
        if (items.maxRating) filterMaxRating.value = items.maxRating;
        if (items.maxReviews) filterMaxReviews.value = items.maxReviews;
      }
    );
  }

  // Save settings helper
  function saveSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        maxLeads: selectMaxLeads.value,
        noWebsiteOnly: filterNoWebsite.checked,
        mustHavePhone: filterMustPhone.checked,
        maxRating: filterMaxRating.value,
        maxReviews: filterMaxReviews.value,
      });
    }
  }

  // Bind change listeners to save state
  selectMaxLeads.addEventListener('change', saveSettings);
  filterNoWebsite.addEventListener('change', saveSettings);
  filterMustPhone.addEventListener('change', saveSettings);
  filterMaxRating.addEventListener('change', saveSettings);
  filterMaxReviews.addEventListener('change', saveSettings);

  // Check NestJS Backend status
  async function checkBackend() {
    try {
      const res = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ leadStats { totalLeads } }' }),
      });
      if (res.ok) {
        serverStatus.classList.add('online');
      } else {
        serverStatus.classList.remove('online');
      }
    } catch {
      serverStatus.classList.remove('online');
    }
  }

  checkBackend();

  // Detect Active Tab
  async function detectCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('google.com/maps')) {
      tabStatusText.innerText = 'Active Tab: Google Maps ✅';
      tabStatusText.style.color = '#4ade80';
      btnStartText.innerText = 'Start Scraper';
      hideNotice();
    } else {
      tabStatusText.innerText = 'Active Tab: Not Google Maps';
      tabStatusText.style.color = '#fbbf24';
      btnStartText.innerText = 'Open Google Maps & Start';
      showNotice('Clicking "Open Google Maps & Start" will switch you to Google Maps.', true);
    }
    return tab;
  }

  await detectCurrentTab();

  // Open Google Maps button
  btnOpenMaps.addEventListener('click', async () => {
    const mapsTabs = await chrome.tabs.query({ url: '*://*.google.com/maps/*' });
    if (mapsTabs.length > 0) {
      chrome.tabs.update(mapsTabs[0].id, { active: true });
    } else {
      chrome.tabs.create({ url: 'https://www.google.com/maps' });
    }
    window.close();
  });

  // Open Dashboard button
  btnDashboard.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
    window.close();
  });

  // Start Scraper button handler
  btnStart.addEventListener('click', async () => {
    saveSettings();
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // If not currently on Google Maps, automatically open/switch to Google Maps
    if (!tab || !tab.url || !tab.url.includes('google.com/maps')) {
      const mapsTabs = await chrome.tabs.query({ url: '*://*.google.com/maps/*' });
      if (mapsTabs.length > 0) {
        chrome.tabs.update(mapsTabs[0].id, { active: true });
      } else {
        chrome.tabs.create({ url: 'https://www.google.com/maps' });
      }
      showNotice('Switched to Google Maps! Search your target query, then click Start.', false);
      setTimeout(() => window.close(), 1500);
      return;
    }

    const maxLeads = parseInt(selectMaxLeads.value, 10);
    const filters = {
      noWebsiteOnly: filterNoWebsite.checked,
      mustHavePhone: filterMustPhone.checked,
      maxRating: filterMaxRating.value,
      maxReviews: filterMaxReviews.value,
    };

    // Inject content script if not already present
    try {
      if (chrome.scripting) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/maps_scraper.js'],
        }).catch(() => {});
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content/overlay.css'],
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Script injection attempt:', e);
    }

    // Send start command to content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'START_SCRAPING',
      maxLeads: maxLeads,
      filters: filters,
    }, (response) => {
      if (chrome.runtime.lastError) {
        showNotice('Reloading Google Maps page to initialize extension overlay...', true);
        chrome.tabs.reload(tab.id);
        setTimeout(() => window.close(), 1000);
      } else if (response) {
        btnStartText.innerText = 'Scraper Active in Google Maps';
        showNotice('Scraper launched! See overlay on Google Maps page.', false);
        setTimeout(() => window.close(), 1200);
      }
    });
  });

  // Poll stats from content script
  async function updateStats() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('google.com/maps')) {
      chrome.tabs.sendMessage(tab.id, { action: 'GET_STATS' }, (response) => {
        if (response && response.totalLeads !== undefined) {
          statScraped.innerText = response.totalLeads;
          if (response.isScraping) {
            btnStartText.innerText = 'Scraper Active in Google Maps';
          }
        }
      });
    }
  }

  updateStats();
  setInterval(updateStats, 2000);
});
