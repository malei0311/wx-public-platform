(async () => {
  const src = chrome.extension.getURL('content/main.js')
  const content = await import(src)
  chrome.runtime.onMessage.addListener(({ isEnable = false, pathname = '' }) => {
    content.main(isEnable, pathname)
  })
})();