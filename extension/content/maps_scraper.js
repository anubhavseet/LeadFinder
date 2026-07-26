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
  let maxLeadsTarget = 50;
  let currentQuery = '';
  let overlayEl = null;

  // Configuration for Human Emulation
  const MIN_DELAY_MS = 2000;
  const MAX_DELAY_MS = 4500;

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
          <div class="lf-stat-lbl">Leads Found</div>
        </div>
        <div class="lf-stat-box">
          <div class="lf-stat-val gold" id="lf-noweb-count">0</div>
          <div class="lf-stat-lbl">No Website ⭐</div>
        </div>
      </div>
      <div class="lf-status-line" id="lf-status-msg">Click 'Start Scraping' to begin human-emulated crawl</div>
      <div class="lf-actions">
        <button class="lf-btn lf-btn-primary" id="lf-btn-toggle">Start Scraping</button>
        <button class="lf-btn lf-btn-danger" id="lf-btn-sync">Sync Backend</button>
      </div>
    `;

    document.body.appendChild(overlayEl);

    document.getElementById('lf-btn-toggle').addEventListener('click', toggleScraping);
    document.getElementById('lf-btn-sync').addEventListener('click', syncLeadsToBackend);
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

  // Find Google Maps Feed Container (and resolve the true scrollable element)
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

  // Helper to extract and decode website URLs from Google Maps card elements
  function extractWebsiteUrl(card) {
    const websiteSelectors = [
      'a[data-value="Website"]',
      'a[aria-label*="Website"]',
      'a[aria-label*="website"]',
      'a[data-tooltip*="Website"]',
      'a.lCanBc',
      'a[href*="url?q="]',
      'a[href*="http"]'
    ];

    for (const sel of websiteSelectors) {
      const btns = card.querySelectorAll(sel);
      for (const btn of btns) {
        let href = btn.getAttribute('href');
        if (!href) continue;

        // Decode google redirect URL if present
        if (href.includes('google.com/url?') || href.includes('google.com/url')) {
          try {
            const urlObj = new URL(href.startsWith('http') ? href : 'https://www.google.com' + href);
            const targetQ = urlObj.searchParams.get('q');
            if (targetQ && !targetQ.includes('google.com/maps') && !targetQ.includes('google.com/search')) {
              return targetQ;
            }
          } catch (e) {
            const match = href.match(/[?&]q=([^&]+)/);
            if (match && match[1]) {
              const decoded = decodeURIComponent(match[1]);
              if (!decoded.includes('google.com/maps') && !decoded.includes('google.com/search')) {
                return decoded;
              }
            }
          }
        } else if (href.startsWith('http') && !href.includes('google.com/maps') && !href.includes('google.com/search')) {
          return href;
        }
      }
    }
    return null;
  }

  // Extract visible business items from current DOM
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

        // Robust Website link extraction & decoding
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
          // Enrich existing lead if new info (such as website or phone) was extracted on scroll pass
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

  // Stealth Human-Emulated Auto-Scroll Engine
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
      const newlyFound = parseVisibleCards();

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

      if (noNewLeadsCount > 10) {
        setStatusMsg('No new results found after repeated scrolling. Ending crawl...', false);
        break;
      }

      // Multi-strategy auto-scroll step to guarantee movement on all Google Maps versions
      const scrollStep = Math.floor(350 + Math.random() * 350);

      // Strategy 1: Container scrollTop adjustment
      feed.scrollTop += scrollStep;

      // Strategy 2: Smooth scrollBy API
      if (typeof feed.scrollBy === 'function') {
        feed.scrollBy({ top: scrollStep, behavior: 'smooth' });
      }

      // Strategy 3: Scroll last visible card into view (forces Google Maps lazy load triggers)
      const cardElements = document.querySelectorAll('div.Nv2PK, div[role="article"]');
      if (cardElements.length > 0) {
        const lastCard = cardElements[cardElements.length - 1];
        if (lastCard && typeof lastCard.scrollIntoView === 'function') {
          lastCard.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }

      // Strategy 4: Dispatch native scroll events
      feed.dispatchEvent(new Event('scroll', { bubbles: true }));
      window.dispatchEvent(new Event('scroll', { bubbles: true }));

      // Random delay between scrolls (2.0s - 4.5s) to avoid bot detection
      const randomDelay = Math.floor(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
      setStatusMsg(`Human micro-scroll step (${scrapedLeadsMap.size}/${maxLeadsTarget} leads)... (${(randomDelay / 1000).toFixed(1)}s delay)`);
      
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

    setStatusMsg('Syncing leads to NestJS GraphQL Backend...');

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
