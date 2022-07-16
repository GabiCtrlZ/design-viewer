const getActiveTabURL = async () => {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true
  });

  return tabs[0];
}

chrome.commands.onCommand.addListener(async (command) => {
  const activeTab = await getActiveTabURL()
  chrome.tabs.sendMessage(activeTab.id, { type: 'COMMAND', command })
});