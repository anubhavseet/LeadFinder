/**
 * LeadFinder - Google Maps Stealth Lead Extractor & Humanized Scroller
 * Injected into https://www.google.com/maps/*
 */

(function () {
  if (window.leadFinderInjected) return;
  window.leadFinderInjected = true;

  console.log('🚀 LeadFinder Content Script initialized on Google Maps');

  let isScraping = false;
  let isPaused = false;
  let scrapedLeadsMap = new Map(); // Key: name + address
  let maxLeadsTarget = 100;

  // Active Pre-Scrape Quality Filters
  let activeFilters = {
    noWebsiteOnly: false,
    mustHavePhone: false,
    maxRating: 'any',
    maxReviews: 'any',
  };

  let overlayEl = null;

  // Configuration for Human Emulation
  const MIN_DELAY_MS = 1800;
  const MAX_DELAY_MS = 3800;

  // Load persistent settings from storage if available
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['maxLeads', 'noWebsiteOnly', 'mustHavePhone', 'maxRating', 'maxReviews'], (items) => {
      if (items.maxLeads) maxLeadsTarget = parseInt(items.maxLeads, 10);
      if (items.noWebsiteOnly !== undefined) activeFilters.noWebsiteOnly = !!items.noWebsiteOnly;
      if (items.mustHavePhone !== undefined) activeFilters.mustHavePhone = !!items.mustHavePhone;
      if (items.maxRating) activeFilters.maxRating = items.maxRating;
      if (items.maxReviews) activeFilters.maxReviews = items.maxReviews;
      updateOverlayUIState();
    });
  }

  // Initialize UI Overlay
  function createOverlayUI() {
    if (document.getElementById('leadfinder-overlay')) return;

    overlayEl = document.createElement('div');
    overlayEl.id = 'leadfinder-overlay';
    overlayEl.innerHTML = `
      <div class="lf-header">
        <div class="lf-title-group">
          <div class="lf-logo-icon">LF</div>
          <span class="lf-title">LeadFinder Stealth</span>
        </div>
        <div class="lf-badge-live">
          <div class="lf-dot"></div>
          <span id="lf-status-badge">READY</span>
        </div>
      </div>

      <div class="lf-stats-grid">
        <div class="lf-stat-box">
          <div class="lf-stat-val" id="lf-total-count">0</div>
          <div class="lf-stat-lbl">Target Leads</div>
        </div>
        <div class="lf-stat-box">
          <div class="lf-stat-val gold" id="lf-noweb-count">0</div>
          <div class="lf-stat-lbl">No Website ⭐</div>
        </div>
      </div>

      <!-- Quick Filter Bar on Overlay -->
      <div class="lf-filters-panel">
        <div class="lf-filter-badge" id="lf-badge-noweb">🌐 No Web: OFF</div>
        <div class="lf-filter-badge" id="lf-badge-phone">📞 Phone: OFF</div>
        <div class="lf-filter-badge" id="lf-badge-cap">Cap: ${maxLeadsTarget}</div>
      </div>

      <div class="lf-status-line" id="lf-status-msg">Click 'Start Scraping' to begin crawl</div>
      <div class="lf-actions">
        <button class="lf-btn lf-btn-primary" id="lf-btn-toggle">Start Scraping</button>
        <button class="lf-btn lf-btn-secondary" id="lf-btn-sync">Sync Backend</button>
      </div>
    `;

    document.body.appendChild(overlayEl);

    document.getElementById('lf-btn-toggle').addEventListener('click', toggleScraping);
    document.getElementById('lf-btn-sync').addEventListener('click', syncLeadsToBackend);

    updateOverlayUIState();
  }

  function updateOverlayUIState() {
    if (!overlayEl) return;
    const badgeCap = document.getElementById('lf-badge-cap');
    const badgeNoWeb = document.getElementById('lf-badge-noweb');
    const badgePhone = document.getElementById('lf-badge-phone');

    if (badgeCap) badgeCap.innerText = `Cap: ${maxLeadsTarget}`;
    if (badgeNoWeb) {
      badgeNoWeb.innerText = `🌐 No Web: ${activeFilters.noWebsiteOnly ? 'ON' : 'OFF'}`;
      badgeNoWeb.className = `lf-filter-badge ${activeFilters.noWebsiteOnly ? 'active' : ''}`;
    }
    if (badgePhone) {
      badgePhone.innerText = `📞 Phone: ${activeFilters.mustHavePhone ? 'ON' : 'OFF'}`;
      badgePhone.className = `lf-filter-badge ${activeFilters.mustHavePhone ? 'active' : ''}`;
    }
  }

  function updateOverlayStats() {
    if (!overlayEl) return;
    const totalCount = scrapedLeadsMap.size;
    let noWebCount = 0;
    scrapedLeadsMap.forEach(lead => {
      if (!lead.website || lead.website.trim() === '') noWebCount++;
    });

    const totalEl = document.getElementById('lf-total-count');
    const noWebEl = document.getElementById('lf-noweb-count');
    if (totalEl) totalEl.innerText = totalCount;
    if (noWebEl) noWebEl.innerText = noWebCount;
  }

  function setStatusMsg(msg, isLive = true) {
    const msgEl = document.getElementById('lf-status-msg');
    const badgeEl = document.getElementById('lf-status-badge');
    if (msgEl) msgEl.innerText = msg;
    if (badgeEl) badgeEl.innerText = isLive ? 'SCRAPING' : 'PAUSED';
  }

  // Detect Search Query from Google Maps Input or URL
  function detectSearchQuery() {
    const inputEl = document.querySelector('input#searchboxinput');
    if (inputEl && inputEl.value) return inputEl.value;
    const urlMatch = window.location.href.match(/\/maps\/search\/([^/]+)/);
    if (urlMatch && urlMatch[1]) return decodeURIComponent(urlMatch[1].replace(/\+/g, ' '));
    return 'Google Maps Query';
  }

  // Find Google Maps Feed Container (and resolve true scrollable element)
  function getFeedContainer() {
    const candidates = [
      'div[role="feed"]',
      'div[aria-label*="Results for"]',
      'div[aria-label*="Results"]',
      '.m6QErb.DshB1',
      '.m6QErb[aria-label]',
      'div.m6QErb.section-scrollbox',
      '#qa3WKe'
    ];

    for (const sel of candidates) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        let current = el;
        while (current && current !== document.body) {
          const style = window.getComputedStyle(current);
          const overflowY = style.overflowY || style.overflow;
          const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') || (current.scrollHeight > current.clientHeight && current.clientHeight > 0);
          if (isScrollable) return current;
          current = current.parentElement;
        }
      }
    }
    return document.querySelector('div[role="feed"]') || document.querySelector('div[aria-label*="Results"]') || document.querySelector('.m6QErb.DshB1');
  }

  // Helper to sanitize & validate external website URLs
  function cleanAndDecodeUrl(href) {
    if (!href) return null;
    let target = href.trim();

    // Decode Google redirect URL (/url?q=https://...)
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

    // Relative links or non-http links
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (/^(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(target)) {
        target = `https://${target}`;
      } else {
        return null;
      }
    }

    const lower = target.toLowerCase();
    // Exclude internal Google/Map/Search/Ad links
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

  // Helper to extract and decode website URLs from Google Maps card elements
  function extractWebsiteUrl(card) {
    if (!card) return null;

    // 1. High-priority Google Maps website button selectors
    const websiteSelectors = [
      'a[aria-label*="Website"]',
      'a[aria-label*="website"]',
      'a[aria-label*="Site"]',
      'a[aria-label*="site"]',
      'a[data-value="Website"]',
      'a[data-value="website"]',
      'a[data-tooltip*="Website"]',
      'a[data-tooltip*="website"]',
      'a.lCanBc',
      'a.authority',
      'a[data-value*="website"]'
    ];

    for (const sel of websiteSelectors) {
      const btns = card.querySelectorAll(sel);
      for (const btn of btns) {
        const href = btn.getAttribute('href') || btn.getAttribute('data-url');
        const decoded = cleanAndDecodeUrl(href);
        if (decoded) return decoded;
      }
    }

    // 2. Fallback: Check ALL anchor tags inside card for valid external URLs
    const allAnchors = card.querySelectorAll('a[href]');
    for (const a of allAnchors) {
      const href = a.getAttribute('href');
      const decoded = cleanAndDecodeUrl(href);
      if (decoded) return decoded;
    }

    // 3. Fallback: Search card text for website domain text (e.g., example.com)
    const cardText = card.innerText || '';
    const lines = cardText.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      const domainMatch = trimmed.match(/\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)\b/i);
      if (domainMatch && domainMatch[0]) {
        const candidate = domainMatch[0].trim();
        const decoded = cleanAndDecodeUrl(candidate.startsWith('http') ? candidate : `https://${candidate}`);
        if (decoded) return decoded;
      }
    }

    return null;
  }

  // Extract visible business items from current DOM with Pre-Scrape Filters
  function parseVisibleCards() {
    const currentQuery = detectSearchQuery();
    const cardElements = document.querySelectorAll('div.Nv2PK, div[role="article"]');
    let newlyExtracted = 0;

    cardElements.forEach(card => {
      try {
        // Business Name
        const nameEl = card.querySelector('.qBF1Pd, .fontHeadlineSmall');
        if (!nameEl) return;
        const name = nameEl.innerText.trim();

        // Rating
        let rating = null;
        const ratingEl = card.querySelector('.MW4pfd, span[aria-label*="stars"]');
        if (ratingEl) {
          const ratingText = ratingEl.innerText || ratingEl.getAttribute('aria-label') || '';
          const match = ratingText.match(/([0-9]+\.[0-9]+|[0-9]+)/);
          if (match) rating = parseFloat(match[1]);
        }

        // Review Count
        let reviewCount = null;
        const reviewEl = card.querySelector('.UY7F9, span[aria-label*="reviews"]');
        if (reviewEl) {
          const reviewText = reviewEl.innerText || reviewEl.getAttribute('aria-label') || '';
          const match = reviewText.replace(/,/g, '').match(/([0-9]+)/);
          if (match) reviewCount = parseInt(match[1], 10);
        }

        // Category, Address, Phone parsing from info block
        let category = null;
        let address = null;
        let phone = null;
        const infoLines = card.querySelectorAll('.W4Efsd');
        
        infoLines.forEach(line => {
          const text = line.innerText.trim();
          if (!text) return;
          
          // Phone regex check
          const phoneMatch = text.match(/(\+?[0-9]{1,4}[\s-]?)?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{4}/);
          if (phoneMatch && !phone) {
            phone = phoneMatch[0];
          }

          // Category identification
          const parts = text.split('·').map(p => p.trim());
          if (parts.length > 0 && !category) {
            if (!parts[0].includes('$') && !parts[0].includes('Open') && !parts[0].includes('Closed')) {
              category = parts[0];
            }
          }

          if (parts.length > 1 && !address) {
            const possibleAddress = parts[parts.length - 1];
            if (possibleAddress && possibleAddress.length > 5 && !possibleAddress.includes('Open') && !possibleAddress.includes('Closed')) {
              address = possibleAddress;
            }
          }
        });

        // Website link extraction & decoding
        const website = extractWebsiteUrl(card);

        // Google Maps Link
        let googleMapsUrl = null;
        const linkEl = card.querySelector('a.hfTTh, a[href*="/maps/place/"]');
        if (linkEl) {
          googleMapsUrl = linkEl.getAttribute('href');
          if (googleMapsUrl && !googleMapsUrl.startsWith('http')) {
            googleMapsUrl = 'https://www.google.com' + googleMapsUrl;
          }
        }

        // Add to extracted leads map
        const uniqueKey = `${name}_${address || ''}_${phone || ''}`.toLowerCase();
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
        } else {
          // Enrich existing lead if new info was extracted on scroll pass
          if (!existingLead.website && website) existingLead.website = website;
          if (!existingLead.phone && phone) existingLead.phone = phone;
          if (!existingLead.category && category) existingLead.category = category;
          if (!existingLead.rating && rating) existingLead.rating = rating;
          if (!existingLead.reviewCount && reviewCount) existingLead.reviewCount = reviewCount;
        }
      } catch (err) {
        console.warn('Error parsing business card:', err);
      }
    });

    updateOverlayStats();
    return newlyExtracted;
  }

  // Stealth Human-Emulated Auto-Scroll Engine (Unlimited / Deep Scroll Fix)
  async function runStealthScrollLoop() {
    const feed = getFeedContainer();
    if (!feed) {
      setStatusMsg('Could not find Google Maps feed. Perform a search first!', false);
      isScraping = false;
      updateToggleButtonText();
      return;
    }

    let noNewLeadsCount = 0;
    let lastSize = scrapedLeadsMap.size;

    while (isScraping && !isPaused) {
      if (scrapedLeadsMap.size >= maxLeadsTarget) {
        setStatusMsg(`Target of ${maxLeadsTarget} leads reached! Auto-syncing...`, false);
        break;
      }

      // Parse current visible items
      parseVisibleCards();

      if (scrapedLeadsMap.size === lastSize) {
        noNewLeadsCount++;
      } else {
        noNewLeadsCount = 0;
        lastSize = scrapedLeadsMap.size;
      }

      // Check if end of list reached
      const endEl = document.querySelector('.H2A7ed, .pbTBAe');
      const hasEndText = Array.from(document.querySelectorAll('span.H2A7ed, div.H2A7ed, span, p')).some(
        el => el.innerText && el.innerText.includes("You've reached the end of the list")
      );
      if ((endEl && endEl.offsetParent !== null) || hasEndText) {
        setStatusMsg('Reached end of Google Maps results!', false);
        break;
      }

      // Increased tolerance for slow Google Maps lazy loads
      if (noNewLeadsCount > 25) {
        setStatusMsg('No new results found after repeated scrolling. Ending crawl...', false);
        break;
      }

      // --- MULTI-STRATEGY DEEP SCROLL TO GUARANTEE CONTINUOUS LAZY-LOADING ---
      
      // Strategy 1: Scroll to bottom of container
      feed.scrollTop = feed.scrollHeight;

      // Strategy 2: Scroll last card element into view
      const cardElements = document.querySelectorAll('div.Nv2PK, div[role="article"]');
      if (cardElements.length > 0) {
        const lastCard = cardElements[cardElements.length - 1];
        if (lastCard && typeof lastCard.scrollIntoView === 'function') {
          lastCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }

      // Strategy 3: If stuck, bump scroll position up and down to trigger Google Maps lazy-load event listener
      if (noNewLeadsCount > 3) {
        feed.scrollTop = Math.max(0, feed.scrollTop - 400);
        await new Promise(r => setTimeout(r, 400));
        feed.scrollTop = feed.scrollHeight;
      }

      // Strategy 4: Dispatch scroll events
      feed.dispatchEvent(new Event('scroll', { bubbles: true }));
      window.dispatchEvent(new Event('scroll', { bubbles: true }));

      // Random delay between scrolls (1.8s - 3.8s) to avoid bot detection
      const randomDelay = Math.floor(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
      setStatusMsg(`Human micro-scroll (${scrapedLeadsMap.size}/${maxLeadsTarget} leads)... (${(randomDelay / 1000).toFixed(1)}s delay)`);
      
      await new Promise(resolve => setTimeout(resolve, randomDelay));
    }

    // Final extraction pass
    parseVisibleCards();
    setStatusMsg(`Crawl complete! ${scrapedLeadsMap.size} total leads extracted.`, false);
    isScraping = false;
    updateToggleButtonText();
    
    // Auto-sync leads to NestJS GraphQL Backend
    await syncLeadsToBackend();
  }

  function toggleScraping() {
    if (!isScraping) {
      isScraping = true;
      isPaused = false;
      updateToggleButtonText();
      runStealthScrollLoop();
    } else {
      isScraping = false;
      updateToggleButtonText();
      setStatusMsg('Scraping stopped by user.', false);
    }
  }

  function updateToggleButtonText() {
    const btn = document.getElementById('lf-btn-toggle');
    if (!btn) return;
    if (isScraping) {
      btn.innerText = 'Stop Scraping';
      btn.className = 'lf-btn lf-btn-danger';
    } else {
      btn.innerText = 'Start Scraping';
      btn.className = 'lf-btn lf-btn-primary';
    }
  }

  // GraphQL Sync to NestJS Backend
  async function syncLeadsToBackend() {
    const leadsArray = Array.from(scrapedLeadsMap.values());
    if (leadsArray.length === 0) {
      setStatusMsg('No leads to sync yet!', false);
      return;
    }

    setStatusMsg('Syncing filtered leads to NestJS GraphQL Backend...');

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
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphqlQuery),
      });

      const result = await response.json();
      if (result.data && result.data.syncLeads) {
        const { addedCount, updatedCount } = result.data.syncLeads;
        setStatusMsg(`✅ Synced! Added: ${addedCount}, Updated: ${updatedCount}`, false);
      } else {
        setStatusMsg('⚠️ Sync completed with warning check console.', false);
      }
    } catch (err) {
      console.warn('Backend sync error:', err);
      // Fallback: save to chrome storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ leadfinder_leads: leadsArray });
        setStatusMsg('Saved to Local Extension Storage (Backend unreachable)', false);
      }
    }
  }

  // Extension Message Listener
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'START_SCRAPING') {
        if (request.maxLeads) maxLeadsTarget = request.maxLeads;
        if (request.filters) {
          activeFilters = { ...activeFilters, ...request.filters };
        }
        updateOverlayUIState();
        if (!isScraping) toggleScraping();
        sendResponse({ status: 'STARTED' });
      } else if (request.action === 'STOP_SCRAPING') {
        isScraping = false;
        updateToggleButtonText();
        sendResponse({ status: 'STOPPED' });
      } else if (request.action === 'GET_STATS') {
        sendResponse({
          totalLeads: scrapedLeadsMap.size,
          isScraping,
        });
      }
    });
  }

  // Inject overlay on DOM ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createOverlayUI();
  } else {
    document.addEventListener('DOMContentLoaded', createOverlayUI);
  }
})();
