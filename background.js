// Helper function to escape special XML characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Default suggestions when the user types the activation keyword
chrome.omnibox.onInputStarted.addListener(() => {
  chrome.storage.local.get(["keywords"], (result) => {
    const keywords = result.keywords || {};
    
    chrome.omnibox.setDefaultSuggestion({
      description: 'Type a keyword or choose from the suggestions below'
    });
  });
});

// Handle input changes to provide suggestions with name display
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.storage.local.get(["keywords"], (result) => {
    const keywords = result.keywords || {};
    let suggestions = [];
    
    // If the input contains a space, assume the first part is the keyword
    if (text.includes(' ')) {
      const [key, ...valueArray] = text.split(' ');
      const value = valueArray.join(' ');
      
      if (keywords[key]) {
        // User has entered a valid keyword, show the description and preview the URL
        // Escape any special XML characters in the name and value
        const escapedName = escapeXml(keywords[key].Name);
        const escapedValue = escapeXml(value || "");
        
        suggestions = [{
          content: text,
          description: `<dim>${escapedName}:</dim> <match>${escapedValue}</match>`
        }];
        
        chrome.omnibox.setDefaultSuggestion({
          description: `<dim>${escapedName}:</dim> <match>${escapedValue}</match>`
        });
      }
    } else {
      // Filter keywords that match the input
      suggestions = Object.keys(keywords)
        .filter(key => key.toLowerCase().includes(text.toLowerCase()))
        .map(key => {
          // Escape any special XML characters in the key and name
          const escapedKey = escapeXml(key);
          const escapedName = escapeXml(keywords[key].Name);
          
          return {
            content: key,
            description: `<match>${escapedKey}</match> - ${escapedName}`
          };
        });
      
      chrome.omnibox.setDefaultSuggestion({
        description: 'Type a keyword or choose from the suggestions below'
      });
    }
    
    suggest(suggestions);
  });
});

// Handle the user selecting a suggestion or pressing enter
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  chrome.storage.local.get(["keywords"], (result) => {
    const keywords = result.keywords || {};
    
    // If the input contains a space, assume the first part is the keyword
    if (text.includes(' ')) {
      const [key, ...valueArray] = text.split(' ');
      const value = valueArray.join(' ');
      
      if (keywords[key]) {
        const url = keywords[key].URL.replace("%s", encodeURIComponent(value || ""));
        navigateToUrl(url, disposition);
      } else {
        // Keyword not found, show an error notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Keyword Not Found',
          message: `The keyword "${key}" is not defined.`
        });
      }
    } else {
      // User just entered a keyword without a value
      if (keywords[text]) {
        const url = keywords[text].URL.replace("%s", "");
        navigateToUrl(url, disposition);
      } else {
        // Check if it's a partial match
        const matchedKeys = Object.keys(keywords).filter(
          key => key.toLowerCase().includes(text.toLowerCase())
        );
        
        if (matchedKeys.length === 1) {
          // If there's exactly one match, use that
          const url = keywords[matchedKeys[0]].URL.replace("%s", "");
          navigateToUrl(url, disposition);
        } else {
          // Show an error notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Keyword Not Found',
            message: `The keyword "${text}" is not defined.`
          });
        }
      }
    }
  });
});

// Function to navigate to a URL based on the disposition
function navigateToUrl(url, disposition) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    switch (disposition) {
      case "currentTab":
        chrome.tabs.update(tabs[0].id, { url: url });
        break;
      case "newForegroundTab":
        chrome.tabs.create({ url: url });
        break;
      case "newBackgroundTab":
        chrome.tabs.create({ url: url, active: false });
        break;
      default:
        chrome.tabs.update(tabs[0].id, { url: url });
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  // Initialize empty keywords object if not already set
  chrome.storage.local.get(["keywords"], (result) => {
    if (!result.keywords) {
      chrome.storage.local.set({ keywords: {} });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "download") {
    chrome.storage.local.get(["keywords"], (result) => {
      const keywords = result.keywords || {};
      const blob = new Blob([JSON.stringify(keywords, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({ url: url, filename: "keywords.json" });
      sendResponse({ status: "success" });
    });
    return true; // Keep the message channel open for sendResponse
  } else if (request.command === "upload") {
    const reader = new FileReader();
    reader.onload = function(e) {
      const keywords = JSON.parse(e.target.result);
      chrome.storage.local.set({ keywords: keywords }, () => {
        sendResponse({ status: "success" });
      });
    };
    reader.readAsText(request.file);
    return true; // Keep the message channel open for sendResponse
  }
});