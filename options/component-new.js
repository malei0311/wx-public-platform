import { STORE_PREFIX } from '../content/config.js'
import { storage } from '../content/utils.js'

window.storage = storage

Vue.component('item-new', {
  template: '#new',
  data () {
    return {
      hello: 'world',
      name: ''
    }
  },
  methods: {
    onNewItem () {
      this.genId().then((id) => {
        return storage.set({
          [id]: {
            name: this.name,
            time: Date.now(),
            items: []
          }
        }).then(() => {
          this.$emit('new-success', id)
        })
      })
    },
    genId () {
      const id = `${STORE_PREFIX}${Math.random().toString(36).substring(2, 15)}`
      return storage.get(id).then((items) => {
        if (items[id]) {
          return this.genId()
        }
        return id
      })
    },
    onBack () {
      this.$emit('back')
    }
  }
})