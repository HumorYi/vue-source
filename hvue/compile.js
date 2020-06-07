/*
 * @Author: Bamboo
 * @AuthorEmail: bamboo8493@126.com
 * @AuthorDescription:
 * @Modifier:
 * @ModifierEmail:
 * @ModifierDescription:
 * @Date: 2020-05-07 22:54:34
 * @LastEditTime: 2020-05-10 17:41:03
 */
// 编译模板，初始化视图，收集依赖（更新函数、watcher创建）
class Compile {
  constructor(el, vm) {
    this.el = el
    this.vm = vm

    this.compile(el)
  }

  compile(el) {
    el.childNodes.forEach(node => {
      if (this.isElement(node)) {
        this.compileDirective(node)
      } else if (this.isInterpolation(node)) {
        // RegExp.$1 => /\{\{(.*)\}\}/.text(node.textContent) => (.*) => data 中的 key
        this.compileText(node, RegExp.$1)
      }

      node.childNodes && this.compile(node)
    })
  }

  isElement(node) {
    return node.nodeType === 1
  }

  isInterpolation(node) {
    // 文本节点
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  compileDirective(node) {
    Array.from(node.attributes).forEach(attr => {
      const { name, value } = attr

      if (this.isEvent(name)) {
        const eventName = name.substring(this.isEventShortcut(name) ? 1 : 5)

        this.event(node, eventName, value)
      } else if (this.isDirective(name)) {
        const direct = name.substring(2)

        this[direct] && this[direct](node, value)
      }
    })
  }

  compileText(node, express) {
    this.text(node, express)
  }

  isEvent(attrName) {
    return attrName.indexOf('h-on:') === 0 || this.isEventShortcut(attrName)
  }

  isEventShortcut(attrName) {
    return attrName.indexOf('@') === 0
  }

  isDirective(attrName) {
    return attrName.indexOf('h-') === 0
  }

  event(node, name, value) {
    let params = []
    let isTransferEventParam = false

    if (/\(.*\)$/.test(value)) {
      const position = value.indexOf('(')
      params = value.slice(position + 1, -1).split(',')
      value = value.slice(0, position)

      if (params[0] === '$event') {
        isTransferEventParam = true
        params.shift()
      }
    }

    node.addEventListener(name, e => {
      if (!this.vm[value]) {
        return
      }

      if (isTransferEventParam) {
        this.vm[value](...[e, ...params])
        return
      }

      this.vm[value](...params)
    })
  }

  text(node, express) {
    this.update(node, express, 'text')
  }

  html(node, express) {
    this.update(node, express, 'html')
  }

  model(node, express) {
    this.update(node, express, 'model')

    node.addEventListener('input', e => {
      this.vm[express] = e.target.value
    })
  }

  update(node, express, direct) {
    const fn = this[direct + 'Update']

    if (!fn) {
      return
    }

    express = express.trim()

    // 初始化视图
    fn(node, this.vm[express])

    // 添加监听器，为后续响应式处理 data 中对应 key 的值改变 并 进行批量更新数据和将数据渲染到 dom 中做标记
    new Watcher(this.vm, express, val => fn(node, val))
  }

  textUpdate(node, value) {
    node.textContent = value
  }

  htmlUpdate(node, value) {
    node.innerHTML = value
  }

  modelUpdate(node, value) {
    node.value = value
  }
}
