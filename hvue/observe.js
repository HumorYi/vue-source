/*
 * @Author: Bamboo
 * @AuthorEmail: bamboo8493@126.com
 * @AuthorDescription:
 * @Modifier:
 * @ModifierEmail:
 * @ModifierDescription:
 * @Date: 2020-05-07 23:28:13
 * @LastEditTime: 2020-05-08 01:44:58
 */
// 执⾏数据响应化（分辨数据是对象还是数组）
class Observe {
  constructor(data) {
    // 判断数据类型
    if (Array.isArray(data)) {
      // TODO: 数组
    } else {
      this.walk(data)
    }
  }

  walk(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return
    }

    Object.keys(obj).forEach(key => this.defineReactive(obj, key, obj[key]))
  }

  defineReactive(obj, key, val) {
    // 防止 val 是对象，递归监听，实现监听对象内所有键值
    this.walk(val)

    // 为要做响应式处理的 obj 添加 Dep
    const dep = new Dep()

    // 对象属性访问和设置拦截
    Object.defineProperty(obj, key, {
      get() {
        // 每获取一次 key 值时，添加 watcher 到 dep 中
        Dep.target && dep.addDep(Dep.target)

        return val
      },
      set: newVal => {
        if (val !== newVal) {
          // 防止 newVal 是对象，提前做一次监听
          this.walk(newVal)

          val = newVal

          // 通过 dep 通知所有 watcher 更新
          dep.notify()
        }
      }
    })
  }
}
