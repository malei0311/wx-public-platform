import {
  observe,
  find,
  throttle,
  debounce,
  storage
} from './utils.js'
import { STORE_ACTIVE_ID } from './config.js'

let observers = []
let config = {}

export const main = debounce(entry, 300)

function clear () {
  observers.forEach((observer) => {
    observer.disconnect()
  })
  observers = []
}

async function entry ({ type, pathname, action }) {
  if (type === 'page' && action === 'inactive') {
    clear()
    return
  }
  clear()
  config = await getConfig()
  const handle = throttle(handler, 500)
  find('.app_graph_content>table>tbody', (els) => {
    Array.from(els).map((tbody) => {
      handle(tbody.querySelectorAll('tr'))
    })
  })
  find('.weui-desktop-pagination', (els) => {
    observers = Array.from(els).map((el) => {
      const tbody = el.parentElement.previousSibling.querySelector('tbody')
      return observe(el, (mutationType) => {
        handle(tbody.querySelectorAll('tr'))
      })
    })
  })
  if (isOntimePage()) {
    find('.weui-desktop-form__dropdown-label>.weui-desktop-form__dropdown__inner-button', (els) => {
      if (!els.length) {
        return
      }
      const el = els[0]
      el.removeEventListener('click', listener, false)
      el.addEventListener('click', listener, false)
    })
  }
}

function getConfig () {
  return storage.get(STORE_ACTIVE_ID).then((items) => {
    const activeId = items[STORE_ACTIVE_ID] || ''
    if (!activeId) {
      return {}
    }
    return storage.get(activeId).then((e) => {
      const target = e[activeId] || {}
      const list = target.items || []
      return list.reduce((t, item) => {
        t[item.path] = item.desc
        return t
      }, {})
    })
  }).catch((e) => {
    console.log('get config error', e)
    return {}
  })
}

function isOntimePage () {
  // ontime 是新的 url, apprealtimecount 是老的 url, 从 自定义分析 -> 实时统计 还是老的 url
  return location.pathname === '/wxamp/statistics/ontime' || location.pathname === '/wxopen/apprealtimecount'
}

function listener (e) {
  if (!isOntimePage() || !e.target.nextElementSibling) {
    return
  }
  handler(e.target.nextElementSibling.querySelectorAll('.weui-desktop-dropdown__list-ele'))
}

function handler (trs) {
  Array.from(trs).forEach((tr) => {
    const td = tr.firstElementChild
    if (!td) {
      return
    }
    let url = td.innerText
    url = url.match(/^([^?&#]+?)(?:\.html)?(?:\?.*|\#.*)?$/)
    if (!url) {
      return
    }
    url = url[1]
    const className = '__wx-metadata'
    const meta = config[url] || ''
    td.setAttribute('data-meta', meta)
    const classes = td.className.split(/\s+/)
    const index = classes.indexOf(className)
    if (meta) {
      if (index === -1) {
        td.className += ` ${className}`
      }
    } else {
      if (index > -1) {
        classes.splice(index, 1)
        td.className = classes.join(' ')
      }
    }
  })
}
