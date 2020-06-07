/*
 * @Author: Bamboo
 * @AuthorEmail: bamboo8493@126.com
 * @AuthorDescription:
 * @Modifier:
 * @ModifierEmail:
 * @ModifierDescription:
 * @Date: 2020-05-07 23:28:13
 * @LastEditTime: 2020-05-10 17:12:55
 */
// 执⾏数据响应化（分辨数据是对象还是数组）
class Observe {
  constructor(data) {
    // 判断数据类型
    if (Array.isArray(data)) {
      this.walkArray(data)
    } else {
      this.walk(data)
    }
  }

  static walk(data) {
    if (typeof data !== 'object' || data === null) {
      return
    }

    Observe.walkObject(data)
  }

  static walkArray(arr) {
    arr.__proto__ = arrayProto

    arr.forEach(item => new Observe(item))
  }

  static walkObject(obj) {
    Object.keys(obj).forEach(key => Observe.defineReactive(obj, key, obj[key]))
  }

  static defineReactive(obj, key, val) {
    // 防止 val 是对象，递归监听，实现监听对象内所有键值
    Observe.walk(val)

    // 为要做响应式处理的 obj 添加 Dep
    const dep = new Dep()

    // 对象属性访问和设置拦截
    Object.defineProperty(obj, key, {
      get() {
        // 每获取一次 key 值时，添加 watcher 到 dep 中
        Dep.target && dep.addDep(Dep.target)

        return val
      },
      set(newVal) {
        if (val !== newVal) {
          // 防止 newVal 是对象，提前做一次监听
          Observe.walk(newVal)

          val = newVal

          // 通过 dep 通知所有 watcher 更新
          dep.notify()
        }
      }
    })
  }

  static proxy(target, origin) {
    Object.keys(origin).forEach(key => {
      Object.defineProperty(target, key, {
        get() {
          return origin[key]
        },
        set(newVal) {
          if (origin[key] !== newVal) {
            origin[key] = newVal
          }
        }
      })
    })
  }

  static def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      configurable: true,
      writable: true
    })
  }

  walk(obj) {
    Observe.walk(obj)
  }

  walkArray(arr) {
    Observe.walkArray(arr)
  }

  walkObject(obj) {
    Observe.walkObject(obj)
  }

  defineReactive(obj, key, val) {
    Observe.defineReactive(obj, key, val)
  }

  proxy(target, origin) {
    Observe.proxy(target, origin)
  }

  def(obj, key, val, enumerable) {
    Observe.def(obj, key, val, enumerable)
  }
}

const originArrayProto = Array.prototype
const arrayProto = Object.create(originArrayProto)
const methodsToPatch = ['push', 'pop', 'unshift', 'shift', 'sort', 'splice', 'reverse']

methodsToPatch.forEach(method => {
  arrayProto[method] = function (...args) {
    originArrayProto[method].apply(this, args)
    console.log('array method ' + method + ' interception ')
  }
})
