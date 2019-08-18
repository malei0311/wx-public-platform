import { logSearchParams } from '../content/utils.js'

const host = 'mp.weixin.qq.com'
const validPaths = [
  '/wxamp/statistics/visit/page',
  '/wxamp/statistics/ontime'
]
const validRequests = { 
  '/wxopen/apprealtimecount': ['get_page_count'],
  '/wxopen/visitanalysis': ['get_qr_visit_data', 'get_visit_page_top']
}

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

function urlHandler (e = {}) {
  const {
    pathname = ''
  } = new URL(e.url)
  const tabId = e.tabId
  if (!pathname) {
    turnOffBadge(tabId)
    return
  }
  console.log('on url change', e)
  let action
  if (validPaths.includes(pathname)) {
    turnOnBadge(tabId)
    action = 'active'
  } else {
    turnOffBadge(tabId)
    action = 'inactive'
  }
  chrome.tabs.sendMessage(tabId, { type: 'page', pathname, action })
}

function requestHandler (e = {}) {
  console.log('on xhr completed', e)
  const url = new URL(e.url)
  if (url.pathname !== '/wxamp/cgi/route' || !url.search) {
    return
  }
  let params = new URLSearchParams(url.search);
  const {
    pathname,
    search
  } = new URL(`http://fake.wx${decodeURIComponent(params.get('path'))}`)
  console.log('request interceptor', pathname)
  params = new URLSearchParams(search)
  logSearchParams(params)
  const action = params.get('action')
  if (!validRequests[pathname] || !validRequests[pathname].includes(action)) {
    return
  }
  chrome.tabs.sendMessage(e.tabId, { type: 'request', pathname, action })
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.browserAction.setBadgeText({ text: 'off' })
  chrome.browserAction.setBadgeBackgroundColor({ color: '#ff7979' })
  chrome.webNavigation.onHistoryStateUpdated.addListener(urlHandler, { url: [{ hostEquals: host }] })
  chrome.webRequest.onCompleted.addListener(requestHandler, { urls: [`*://${host}/*`] })
})
