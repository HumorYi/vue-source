/*
 * @Author: Bamboo
 * @AuthorEmail: bamboo8493@126.com
 * @AuthorDescription:
 * @Modifier:
 * @ModifierEmail:
 * @ModifierDescription:
 * @Date: 2020-05-07 22:54:30
 * @LastEditTime: 2020-05-08 23:04:52
 */
// 暗号：double kill

/**
 * 1、new HVue() 初始化选项
 * 2、对 data 进行响应式处理（访问劫持） => Observe（观察者模式）
 * 3、实例 代理 访问 data，方便访问 data 数据 => proxy
 * 4、编译 选项中挂载的 dom 模板，从 data 中获取数据并初始化视图 => Compile
 * 5、订阅 data 数据变化，绑定更新函数，更新函数会将变化的数据更新到 dom 中 => Watcher
 * 6、由于 data 中的某个 key 可能在模板中多次使用，需要一个管家来管理多个 Watcher => Dep（订阅发布模式）
 * 7、当 data 中数据发生变化时，在 Observe 中 找到 Dep，执行内部所有 Watcher 的更新函数，
 *    实现 数据响应式 管理并进行 批量更新数据和将数据渲染到 dom 中
 */
class HVue {
  constructor(options = {}) {
    this.$options = options
    this.$data = options.data

    // 对 data 进行响应式处理
    new Observe(this.$data)

    // 当前实例代理 data，可在当前实例直接访问 data 的数据
    Observe.proxy(this, this.$data)
    // 当前实例代理 methods，可在当前实例直接访问 methods 的数据
    Observe.proxy(this, options.methods)

    // 挂载 dom
    this.$mount(options.el)
  }

  static set(obj, key, val) {
    Observe.defineReactive(obj, key, val)
  }

  $set(obj, key, val) {
    HVue.set(obj, key, val)
  }

  $mount(el) {
    if (!el) {
      return
    }

    // TODO: el 验证
    this.$el = document.querySelector(el)

    // 编译 dom，初始化视图
    new Compile(this.$el, this)
  }
}
