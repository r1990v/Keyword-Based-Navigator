# chrome-keyword-navigator

## Keyword Based Navigator Chrome Extension

Keyword Based Navigator is a Chrome extension that allows you to navigate to URLs based on shortcuts and keywords directly from the Chrome omnibox.

### Features

- **Keyword-based navigation**: Navigate to predefined URLs using keywords.
- **Omnibox integration**: Use the omnibox (address bar) for entering keywords and search values.
- **JSON configuration**: Easily upload and download keyword configurations using a JSON file.
- **Dynamic keyword listing**: View available keywords and their corresponding URLs on the options page.

### Installation

1. **Download the extension**: [Download Keyword Based Navigator Extension]
2. **Extract the ZIP file**: Unzip the downloaded file to a convenient location on your computer.
3. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" by clicking the toggle switch in the top right corner.
   - Click the "Load unpacked" button and select the directory where you unzipped the extension files.

### Usage

1. **Open the omnibox**: Click on the Chrome address bar or press `Ctrl+L` (Windows/Linux) or `Cmd+L` (Mac).
2. **Enter the keyword**: Type the keyword `p` followed by a space.
3. **Type the search term**: Enter the search term after the keyword and press `Enter`.

Example:
```
p gs oracle
```
This will navigate to the URL associated with the `gs` keyword, replacing `%s` with `oracle`.

### Managing Keywords

1. **Open the options page**:
   - Right-click on the extension icon and select "Options", or
   - Go to `chrome://extensions/`, find "Keyword Based Navigator", and click "Details". Then click "Extension options".

2. **Upload JSON configuration**:
   - Click the "Choose File" button and select your JSON file containing the keyword definitions.
   - Click "Upload JSON" to upload and apply the configuration.

3. **Download JSON configuration**:
   - Click the "Download JSON" button to download the current keyword configuration as a JSON file.

4. **View available keywords**:
   - The options page lists all available keywords and their corresponding URLs in a table format.

### JSON Configuration Format

The JSON configuration file should follow this format:

```json
{
  "keyword": {
    "Name": "Title Of Keyword",
    "URL": "https://test.com/em_alert.do?sysparm_query=number=%s"
  },
  "keyword2": {
    "Name": "Another Keyword Title",
    "URL": "https://example.com/search?query=%s"
  }
}
```

### Example JSON

```json
{
  "alert": {
    "Name": "Find Alert by ID",
    "URL": "https://test.com/em_alert.do?sysparm_query=number=%s"
  },
  "alertci": {
    "Name": "Search by CI for Alerts in last 24 hours",
    "URL": "https://test.com/em_alert_list.do?sysparm_query=GOTOcmdb_ci.nameLIKE%s%5Elast_remote_timeRELATIVEGE%40hour%40ago%4024&sysparm_view="
  }
}
```

### Contributing

If you would like to contribute to the development of this extension, please fork the repository and submit a pull request with your changes.

- @Rahul Vats
