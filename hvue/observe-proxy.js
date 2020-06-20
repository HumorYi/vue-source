// 利用 ES6 的 Proxy 做响应式

const isObject = val => val !== null && typeof val === 'object'

/**
 * 避免重复代理，将之前代理结果缓存，get时直接使用
 * reactive(data) // 已代理过的纯对象
 * reactive(react) // 代理对象
 */
// obj:observed
const toProxy = new WeakMap()
// observed:obj
const toRaw = new WeakMap()

function reactive(obj) {
  if (!isObject(obj)) {
    return obj
  }

  // 代理之前，先查找缓存
  if (toProxy.has(obj)) {
    // 返回的是对象对应的代理对象 => Proxy
    return toProxy.get(obj)
  }

  if (toRaw.has(obj)) {
    // 返回的是代理对象对应的对象 => obj
    return obj
  }

  // Proxy 相当于在 对象外层 添加 拦截器，Proxy 默认不递归拦截，需要手动设置
  // http://es6.ruanyifeng.com/#docs/proxy
  const observed = new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      console.log(`获取${key}: ${res}`)

      // 依赖收集：创建 target, key 和 活动的那个回调函数
      track(target, key)

      // 如果是对象需要递归
      return isObject(res) ? reactive(res) : res
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)
      console.log(`设置${key}: ${value}`)

      // 触发响应函数
      trigger(target, key)

      return res
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key)
      console.log(`删除${key}: ${res}`)

      // 触发响应函数
      trigger(target, key)

      return res
    }
  })

  // 缓存代理结果
  toProxy.set(obj, observed)
  toRaw.set(observed, obj)

  return observed
}

/**
 * 依赖收集: 建立响应数据 key 和 更新函数 之间的对应关系。
 *
 * 用法：
 *  设置响应函数
 *    effect(() => console.log(state.foo))
 *  用户修改关联数据会触发响应函数
 *    state.foo = 'xxx'
 *
 * 设计思路：实现三个函数
 *    effect：将回调函数保存起来备用，立即执行一次回调函数触发它里面一些响应数据的getter
 *    track：getter中调用track，把前面存储的回调函数和当前target,key之间建立映射关系
 *    trigger：setter中调用trigger，把target,key对应的响应函数都执行一遍
 *
 *    target,key和响应函数映射关系 大概结构如下所示
 *      target | depsMap
 *        obj | key | Dep
 *              k1  | effect1,effect2...
 *              k2  | effect3,effect4...
 *
 *      { target: { key: [effect1,...] } }
 */

// 使用栈数据结构来保存当前活动响应函数，作为 getter 与 effect 之间的桥梁
const effectStack = []

// effect 函数：将 fn 入栈 用于后续依赖收集，执行 fn 触发依赖收集
function effect(fn) {
  // rx => receive
  const rxEffect = function() {
    // 捕获可能出现的异常
    try {
      // 将 fn 入栈 用于后续依赖收集，
      effectStack.push(fn)

      // 执行 fn 触发依赖收集
      return fn()
    } catch (error) {
    } finally {
      // 执行完毕，将 fn 出栈
      effectStack.pop()
    }
  }

  // 默认执行一次, 激活 getter
  rxEffect()

  // 返回响应函数
  return rxEffect
}

// 映射关系表结构： {target: {key: [fn1,fn2]}}
const targetWeakMap = new WeakMap()

// 把前面存储的回调函数和当前 target,key 之间建立映射关系
function track(target, key) {
  // 获取活动回调函数
  const effect = effectStack[effectStack.length - 1]

  // 没有活动回调函数，直接退出
  if (!effect) {
    return
  }

  // 获取 target 映射关系
  let depsMap = targetWeakMap.get(target)

  if (!depsMap) {
    // 如果没有 target 映射关系，则证明是首次，需要创建一个 map
    depsMap = new Map()
    targetWeakMap.set(target, depsMap)
  }

  // 获取 key 对应的回调集合
  let deps = depsMap.get(key)
  if (!deps) {
    // 如果没有 key 回调集合，则证明是首次，需要创建一个 set
    deps = new Set()
    depsMap.set(key, deps)
  }

  // 把响应函数加入到deps中
  deps.add(effect)
}

// 把 target,key 对应的响应函数都执行一遍
function trigger(target, key) {
  // 获取 target 映射关系
  const depsMap = targetWeakMap.get(target)

  // 没有直接退出
  if (!depsMap) {
    return
  }

  // 获取 key 集合
  const deps = depsMap.get(key)

  // 没有直接退出
  if (!deps) {
    return
  }

  // 执行集合中的所有响应函数
  deps.forEach(effect => effect())
}

// test
const state = reactive({
  foo: 'foo',
  bar: { a: 1 },
  arr: [1, 2, 3]
})

effect(() => console.log('effect state.foo: ', state.foo))

// 1.获取
state.foo // ok
// 2.设置已存在属性
state.foo = 'fooooooo' // ok
// 3.设置不存在属性
state.dong = 'dong' // ok
// 4.删除属性
delete state.dong // ok

// 嵌套对象不能响应
state.bar.a = 10

// 数组
state.arr
state.arr.push(4)

console.log(reactive(state) === state)
