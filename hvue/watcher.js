/*
 * @Author: Bamboo
 * @AuthorEmail: bamboo8493@126.com
 * @AuthorDescription:
 * @Modifier:
 * @ModifierEmail:
 * @ModifierDescription:
 * @Date: 2020-05-07 22:54:39
 * @LastEditTime: 2020-05-08 01:39:26
 */
// 执⾏更新函数（更新dom）
class Watcher {
  constructor(vm, key, fn) {
    this.vm = vm
    this.key = key
    this.fn = fn

    // 在 Dep 存储当前实例
    Dep.target = this
    // 触发 data 中 key 的响应式获取值处理，添加 当前实例到 Dep 中
    this.vm[this.key]
    // 重置 Dep 存储的 Watcher 实例，避免重复添加
    Dep.target = null
  }

  update() {
    this.fn.call(this.vm, this.vm[this.key])
  }
}
