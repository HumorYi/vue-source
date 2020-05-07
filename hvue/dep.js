/*
 * @Author: Bamboo
 * @AuthorEmail: bamboo8493@126.com
 * @AuthorDescription:
 * @Modifier:
 * @ModifierEmail:
 * @ModifierDescription:
 * @Date: 2020-05-07 22:54:43
 * @LastEditTime: 2020-05-08 01:42:29
 */
// 管理多个Watcher，批量更新
class Dep {
  constructor() {
    this.deps = []
  }

  static target = null

  addDep(watcher) {
    this.deps.push(watcher)
  }

  notify() {
    this.deps.forEach(watcher => watcher.update())
  }
}
