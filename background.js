const host = 'mp.weixin.qq.com'
const validPaths = [
  '/wxamp/statistics/visit/page',
  '/wxamp/statistics/ontime'
]

function turnOnBadge (tabId) {
  chrome.browserAction.setBadgeText({
    text: 'on',
    tabId
  })
  chrome.browserAction.setBadgeBackgroundColor({
    color: '#badc58',
    tabId
  })
}

function turnOffBadge (tabId) {
  chrome.browserAction.setBadgeText({
    text: 'off',
    tabId
  })
  chrome.browserAction.setBadgeBackgroundColor({
    color: '#ff7979',
    tabId
  })
}

function urlHandler (e) {
  let pathname = e.url.match(new RegExp(`https?:\/\/${host}([^?#]+)`))
  const tabId = e.tabId
  if (!pathname) {
    turnOffBadge(tabId)
    return
  }
  console.log('on url change', e)
  pathname = pathname[1]
  const requestFilter = { urls: [`*://${host}/*`] }
  if (validPaths.includes(pathname)) {
    turnOnBadge(tabId)
    chrome.tabs.sendMessage(tabId, { isEnable: true, pathname })
    chrome.webRequest.onCompleted.addListener(requestHandler, requestFilter)
  } else {
    turnOffBadge(tabId)
    chrome.webRequest.onCompleted.removeListener(requestHandler, requestFilter)
    chrome.tabs.sendMessage(tabId, { isEnable: false, pathname })
  }
}

function requestHandler (e) {
  console.log('on xhr completed', e)
}

function onlyOne (fn) {
  return fn
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.browserAction.setBadgeText({ text: 'off' })
  chrome.browserAction.setBadgeBackgroundColor({ color: '#ff7979' })
  const listener = onlyOne(urlHandler)
  const filter = { url: [{ hostEquals: host }] }
  chrome.webNavigation.onHistoryStateUpdated.addListener(listener, filter)
  chrome.webNavigation.onCommitted.addListener(listener, filter)
})
