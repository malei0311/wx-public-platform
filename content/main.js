import {
  observe,
  find,
  throttle,
  debounce
} from './utils.js'

import config from './config.js'

let observers = []

export const main = debounce(entry, 300)

function clear () {
  observers.forEach((observer) => {
    observer.disconnect()
  })
  observers = []
}

function entry ({ type, pathname, action }) {
  console.log('---- main', type, pathname, action)
  if (type === 'page' && action === 'inactive') {
    clear()
    return
  }
  clear()
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

function isOntimePage () {
  return location.pathname === '/wxamp/statistics/ontime'
}

function listener (e) {
  console.log('click', e)
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
