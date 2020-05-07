/*
 * @Author: Bamboo
 * @AuthorEmail: bamboo8493@126.com
 * @AuthorDescription:
 * @Modifier:
 * @ModifierEmail:
 * @ModifierDescription:
 * @Date: 2020-05-07 22:54:34
 * @LastEditTime: 2020-05-08 02:20:15
 */
// 编译模板，初始化视图，收集依赖（更新函数、watcher创建）
class Compile {
  constructor(vm, el) {
    this.vm = vm
    this.el = el

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

      if (name.indexOf('@') === 0) {
        const eventName = name.substring(1)

        this.event(node, eventName, value)
      } else if (name.indexOf('h-on:') === 0) {
        const eventName = name.substring(5)

        this.event(node, eventName, value)
      } else if (name.indexOf('h-') === 0) {
        const direct = name.substring(2)

        this[direct] && this[direct](node, value)
      }
    })
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
        console.log(...[e, ...params])
        this.vm[value](...[e, ...params])
        return
      }

      this.vm[value](...params)
    })
  }

  text(node, value) {
    this.compileText(node, value)
  }

  html(node, value) {
    this.compileHtml(node, value)
  }

  compileText(node, express) {
    this.update(node, express, 'text')
  }

  compileHtml(node, express) {
    this.update(node, express, 'html')
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
}
