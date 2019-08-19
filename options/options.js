import './component-new.js'
import './component-edit.js'
import { STORE_PREFIX, STORE_ACTIVE_ID } from '../content/config.js'
import { storage, formatDate } from '../content/utils.js'

window.__wx_meta_data_ins = new Vue({
  el: '#app',
  data: {
    items: [],
    isNew: false,
    activeId: ''
  },
  created () {
    storage.get(STORE_ACTIVE_ID).then((items) => {
      this.activeId = items[STORE_ACTIVE_ID] || ''
    }).then(() => {
      this.getData()
    })
  },
  methods: {
    getData () {
      return storage.get().then((items) => {
        this.items = Object.keys(items).filter((key) => {
          return key.indexOf(STORE_PREFIX) === 0
        }).map((key) => {
          const item = items[key]
          return {
            id: key,
            timeStr: formatDate(item.time),
            ...item
          }
        }).sort((a, b) => {
          return a.time - b.time
        })
      })
    },
    onNewItem () {
      this.prevActiveId = this.activeId
      this.activeId = ''
      this.isNew = true
    },
    onNewBack () {
      this.isNew = false
      this.activeId = this.prevActiveId
    },
    onNewSuccess (id) {
      console.log('new success', id)
      this.activeId = id
      this.isNew = false
      this.getData()
    },
    onEditItem (e) {
      const {
        id
      } = e.target.dataset || {}
      this.isNew = false
      this.activeId = id
    },
    onEditDelete () {
      storage.get(STORE_ACTIVE_ID).then((items) => {
        if (items[STORE_ACTIVE_ID] === this.activeId) {
          return storage.remove(STORE_ACTIVE_ID)
        }
      }).then(() => {
        this.activeId = ''
        this.getData()
      })
    }
  }
})
