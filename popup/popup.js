import { STORE_PREFIX, STORE_ACTIVE_ID } from '../content/config.js'
import { storage } from '../content/utils.js'

window.__wx_meta_data_ins = new Vue({
  el: '#app',
  data: {
    items: [],
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
            ...item
          }
        }).sort((a, b) => {
          return a.time - b.time
        })
      })
    },
    onChangeItem (e) {
      const {
        id
      } = e.target.dataset || {}
      if (id === this.activeId) {
        return
      }
      storage.set({
        [STORE_ACTIVE_ID]: id
      }).then(() => {
        this.activeId = id
      })
    }
  }
})
