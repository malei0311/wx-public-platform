(async () => {
  const src = chrome.runtime.getURL('content/main.js')
  const content = await import(src)
  chrome.runtime.onMessage.addListener((data) => {
    content.main(data)
  })
})();