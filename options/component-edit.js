import { storage, formatDate } from '../content/utils.js'

Vue.component('item-edit', {
  template: '#edit',
  props: {
    activeId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      target: {}
    }
  },
  mounted () {
    if (!this.activeId) {
      return
    }
    storage.get(this.activeId).then((items) => {
      const target = items[this.activeId]
      target.timeStr = formatDate(target.time)
      this.target = target
    })
  },
  methods: {
    onDeleteAll () {
      if (!confirm('确定要删除项目吗?')) {
        return
      }
      storage.remove(this.activeId).then(() => {
        this.$emit('delete')
      })
    },
    onDeleteItem (e) {
      if (!confirm('确定要删除条目吗?')) {
        return
      }
      const {
        index
      } = e.target.dataset || {}
      this.target.items.splice(index, 1)
    },
    onNew () {
      this.target.items.push({
        path: '',
        desc: ''
      })
    },
    onSave () {
      let item
      for (item of this.target.items) {
        if (!item.path.match(/^[\-_=.%&?/#\w]+$/)) {
          alert('请填写正确的 path')
          return
        }
        if ((item.path && !item.desc) || (!item.path && item.desc)) {
          alert('请填写完整')
          return
        }
      }

      this.target.items = this.target.items.filter((item) => {
        return item.path && item.desc
      })

      storage.set({
        [this.activeId]: this.target
      }).then(() => {
        alert('保存成功')
        this.$emit('save')
      })
    }
  }
})