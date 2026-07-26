// LeadFinder Service Worker Background Script

chrome.runtime.onInstalled.addListener(() => {
  console.log('LeadFinder Extension installed successfully.');
});

// Listener for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'SYNC_LEADS_BACKGROUND') {
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
        variables: {
          input: {
            leads: message.leads,
          },
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.toString() }));

    return true; // Keep channel open for async response
  }
});
