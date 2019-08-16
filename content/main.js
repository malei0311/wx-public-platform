import {
  observe,
  find,
  throttle
} from './utils.js'

let observers = []
const config = {
  'pages/index/index': '动态',
  'pages/editUserInfo/index': 'xxxx'
}

function clear () {
  observers.forEach((observer) => {
    observer.disconnect()
  })
  observers = []
}

export function main (isEnable = false, pathname) {
  console.log('---- main', isEnable, pathname)
  if (!isEnable) {
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
        console.log(`pathname: ${pathname}, mutaiton type: ${mutationType}`)
        handle(tbody.querySelectorAll('tr'))
      })
    })
  })
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
    const parentClass = '__wx-metadata-parent'
    const itemClass = '__wx-metadata'
    const item = td.firstElementChild
    if (item && item.className === itemClass) {
      td.removeChild(item)
    }
    if (config[url]) {
      const classes = td.className.split(/\s+/)
      if (!classes.includes(parentClass)) {
        td.className += ` ${parentClass}`
      }
      td.insertAdjacentHTML('afterbegin', `<span class="${itemClass}">${config[url]}</span>`)
    }
  })
}
