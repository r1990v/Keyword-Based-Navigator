document.addEventListener('DOMContentLoaded', function() {
  // Upload JSON
  document.getElementById('uploadBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const keywords = JSON.parse(e.target.result);
        chrome.storage.local.set({ keywords: keywords }, () => {
          alert('Upload successful');
          populateKeywordTable();
        });
      };
      reader.readAsText(file);
    } else {
      alert('Please select a file to upload');
    }
  });

  // Download JSON
  document.getElementById('downloadBtn').addEventListener('click', () => {
    chrome.storage.local.get(["keywords"], (result) => {
      const keywords = result.keywords || {};
      const blob = new Blob([JSON.stringify(keywords, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "keywords.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert('Download started');
    });
  });

  // Add new keyword
  document.getElementById('addKeywordBtn').addEventListener('click', () => {
    const keywordInput = document.getElementById('newKeyword');
    const nameInput = document.getElementById('newName');
    const urlInput = document.getElementById('newUrl');
    
    const keyword = keywordInput.value.trim();
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    
    if (!keyword || !name || !url) {
      alert('All fields are required');
      return;
    }
    
    chrome.storage.local.get(["keywords"], (result) => {
      const keywords = result.keywords || {};
      
      // Check if keyword already exists
      if (keywords[keyword]) {
        if (!confirm(`Keyword "${keyword}" already exists. Do you want to overwrite it?`)) {
          return;
        }
      }
      
      // Add new keyword
      keywords[keyword] = {
        Name: name,
        URL: url
      };
      
      chrome.storage.local.set({ keywords: keywords }, () => {
        alert('Keyword added successfully');
        populateKeywordTable();
        
        // Clear the form
        keywordInput.value = '';
        nameInput.value = '';
        urlInput.value = '';
      });
    });
  });

  // Populate keyword table
  function populateKeywordTable() {
    chrome.storage.local.get(["keywords"], (result) => {
      const keywords = result.keywords || {};
      const tableBody = document.getElementById('keywordTableBody');
      tableBody.innerHTML = '';
      
      // Sort keywords alphabetically
      const sortedKeys = Object.keys(keywords).sort();
      
      if (sortedKeys.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 4;
        emptyCell.textContent = 'No keywords defined. Add a keyword or upload a JSON file.';
        emptyCell.style.textAlign = 'center';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
        return;
      }
      
      for (const key of sortedKeys) {
        const row = document.createElement('tr');
        
        const keywordCell = document.createElement('td');
        keywordCell.textContent = key;
        
        const nameCell = document.createElement('td');
        nameCell.textContent = keywords[key].Name;
        
        const urlCell = document.createElement('td');
        urlCell.textContent = keywords[key].URL;
        
        const actionsCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', () => {
          if (confirm(`Are you sure you want to delete the keyword "${key}"?`)) {
            delete keywords[key];
            chrome.storage.local.set({ keywords: keywords }, () => {
              populateKeywordTable();
            });
          }
        });
        
        actionsCell.appendChild(deleteButton);
        
        row.appendChild(keywordCell);
        row.appendChild(nameCell);
        row.appendChild(urlCell);
        row.appendChild(actionsCell);
        
        tableBody.appendChild(row);
      }
    });
  }

  populateKeywordTable();
});