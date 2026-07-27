// LeadFinder Service Worker Background Script

chrome.runtime.onInstalled.addListener(() => {
  console.log('🚀 LeadFinder Extension service worker initialized.');
});

// Shared Message Handler for internal and external web dashboard requests
async function handleMessage(message) {
  if (message.action === 'SYNC_LEADS_BACKGROUND') {
    const res = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation SyncLeads($input: SyncLeadsInput!) {
            syncLeads(input: $input) {
              addedCount
              updatedCount
              totalProcessed
            }
          }
        `,
        variables: { input: { leads: message.leads } },
      }),
    });
    const data = await res.json();
    return { success: true, data };
  }

  if (message.action === 'SEARCH_LEAD_EMAIL') {
    const { leadId, name, address } = message;
    console.log(`[Extension OSINT] Searching email for: ${name} (${address || 'No location'})`);

    const result = await performBrowserOsintSearch(leadId, name, address);
    if (result.email) {
      // Sync discovered email directly to MongoDB backend
      await syncEmailToBackend(leadId, result.email, result.emailSource);
    }
    return result;
  }

  return { success: false, error: 'Unknown action' };
}

// Internal listener (from popup or content scripts)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message)
    .then((res) => sendResponse(res))
    .catch((err) => sendResponse({ success: false, error: err.toString() }));
  return true; // Keep async channel open
});

// External listener (from React Web Dashboard running on localhost:5173 / localhost:3000)
if (chrome.runtime.onMessageExternal) {
  chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    handleMessage(message)
      .then((res) => sendResponse(res))
      .catch((err) => sendResponse({ success: false, error: err.toString() }));
    return true;
  });
}

/**
 * Perform Browser-Context OSINT Fetch to bypass anti-bot noindex restrictions
 */
async function performBrowserOsintSearch(leadId, businessName, address) {
  const cleanLocation = address ? address.replace(/[\d+#]+/g, '').trim() : '';
  const searchQueries = [
    `"${businessName}" ${cleanLocation} email OR contact OR gmail.com`,
    `"${businessName}" facebook email OR contact`,
  ];

  for (const query of searchQueries) {
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': navigator.userAgent,
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) continue;
      const htmlText = await response.text();

      // Parse emails and links
      const { email, source, facebookUrl } = parseHtmlForEmail(htmlText);
      if (email) {
        return { success: true, email, emailSource: source || 'Browser OSINT' };
      }

      // If Facebook URL was found, attempt secondary fetch to Facebook page
      if (facebookUrl) {
        try {
          const fbRes = await fetch(facebookUrl, {
            headers: { 'User-Agent': navigator.userAgent },
          });
          if (fbRes.ok) {
            const fbHtml = await fbRes.text();
            const fbResult = parseHtmlForEmail(fbHtml);
            if (fbResult.email) {
              return { success: true, email: fbResult.email, emailSource: 'Facebook Profile' };
            }
          }
        } catch (e) {
          console.warn('[Extension OSINT] Facebook fetch error:', e);
        }
      }
    } catch (err) {
      console.warn(`[Extension OSINT] Fetch failed for query "${query}":`, err);
    }
  }

  return { success: false, email: null, error: 'No email found in public OSINT search' };
}

/**
 * Extract emails & Facebook links from HTML text
 */
function parseHtmlForEmail(htmlText) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const matches = htmlText.match(emailRegex) || [];

  const excludedDomains = [
    'example.com',
    'domain.com',
    'sentry.io',
    'wixpress.com',
    'schema.org',
    'google.com',
    'github.com',
    'duckduckgo.com',
    'w3.org',
    'cloudfront.net',
    'gravatar.com',
    'png',
    'jpg',
    'jpeg',
    'svg',
    'webp',
  ];

  const validEmails = [];
  for (const rawEmail of matches) {
    const email = rawEmail.toLowerCase().trim();
    const parts = email.split('@');
    if (parts.length !== 2) continue;

    const domain = parts[1];
    if (excludedDomains.some((ex) => domain.includes(ex) || email.endsWith(`.${ex}`))) {
      continue;
    }
    if (!domain.includes('.')) continue;

    if (!validEmails.includes(email)) {
      validEmails.push(email);
    }
  }

  // Extract Facebook page link if present
  let facebookUrl = null;
  const fbMatch = htmlText.match(/href="([^"]*facebook\.com\/[^"]+)"/i);
  if (fbMatch && fbMatch[1]) {
    facebookUrl = fbMatch[1];
  }

  if (validEmails.length === 0) {
    return { email: null, source: null, facebookUrl };
  }

  const webmail = validEmails.find((e) =>
    /@(gmail|yahoo|outlook|hotmail|icloud|aol)\./i.test(e),
  );

  const selectedEmail = webmail || validEmails[0];
  const source = /@(gmail|yahoo|outlook|hotmail)\./i.test(selectedEmail)
    ? 'Webmail OSINT'
    : 'Web Search';

  return { email: selectedEmail, source, facebookUrl };
}

/**
 * Send GraphQL Mutation to backend to save discovered email
 */
async function syncEmailToBackend(leadId, email, emailSource) {
  try {
    await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation UpdateLeadEmail($id: ID!, $email: String!, $emailSource: String) {
            updateLeadEmail(id: $id, email: $email, emailSource: $emailSource) {
              id
              email
              emailSource
            }
          }
        `,
        variables: { id: leadId, email, emailSource },
      }),
    });
    console.log(`[Extension OSINT] Saved email to backend DB: ${email}`);
  } catch (err) {
    console.error('[Extension OSINT] Backend sync error:', err);
  }
}
