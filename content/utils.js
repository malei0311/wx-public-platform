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