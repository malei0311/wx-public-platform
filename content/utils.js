export function debounce (fn, time = 500) {
  let timer = null
  return function debounced (...args) {
    const ctx = this
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(ctx, args)
    }, time)
  }
}

export function throttle (fn, time = 500) {
  let timer = null
  let first = true
  return function throttled (...args) {
    const ctx = this
    if (first) {
      first = false
      fn.apply(ctx, args)
      return
    }
    if (timer) {
      return
    }
    timer = setTimeout(() => {
      clearTimeout(timer)
      timer = null
      fn.apply(ctx, args)
    }, time)
  }
}

export function observe (el = document.body, callback, config = {}) {
  const cb = (list) => {
    for (let mutation of list) {
      callback(mutation.type)
    }
  }
  const observer = new MutationObserver(cb)
  observer.observe(el, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
    ...config
  })
  return observer
}


export function find (selector, callback, maxTime = 100) {
  if (!selector) {
    return
  }
  let timer = null
  let times = 0

  function doFind (el, cb) {
    if (timer) {
      clearTimeout(timer)
    }
    times += 1
    const els = document.querySelectorAll(el)
    if (!els.length) {
      if (times >= maxTime) {
        console.warn(`[wechat] find selector: ${el}, times exceeded: ${maxTime}`)
        return
      }
      timer = setTimeout(() => {
        doFind(el, cb)
      }, 500)
      return
    }
    console.log(`[wechat] find selector: ${el}, times: ${times}`)
    times = 0
    timer = null
    cb(els)
  }

  doFind(selector, callback)
}

export function logSearchParams (params) {
  if (!(params instanceof URLSearchParams)) {
    return
  }
  console.table(Array.from(params))
}

function promisify (fn, key) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      const cb = args.pop()
      let isFn = true
      if (typeof cb !== 'function') {
        if (key !== 'clear') {
          args.push(cb)
        }
        isFn = false
      }
      args.push((items) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
          return
        }
        isFn && cb(items)
        resolve(items)
      })
      fn.apply(chrome.storage.sync, args)
    })
  }
}

export const storage = new Proxy({}, {
  get (target, key) {
    if (chrome.storage.sync[key]) {
      return promisify(chrome.storage.sync[key], key)
    } else {
      throw new Error(`no such api [${key}]`)
    }
  }
})

export function formatDate (timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const pad0 = (item) => {
    return `0${item}`.slice(-2)
  }

  return [year, month, day].map(pad0).join('/') + ' ' + [hour, minute, second].map(pad0).join(':')
}

export function download (content, fileName, mimeType = 'text/plain;encoding:utf-8') {
  if (URL && 'download' in a) {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content], {
      type: mimeType
    }))
    a.setAttribute('download', fileName)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } else {
    location.href = 'data:application/octet-stream,' + encodeURIComponent(content)
  }
}
