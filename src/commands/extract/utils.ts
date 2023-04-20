/**
 * 数组铺平
 * @export
 * @param {Array} array 需要铺平的数组
 * @param {number} dep 展平的深度
 */
export function flatten(array: Array<any>, dep: number = 1): Array<any> {
  if (dep === 0) return array
  return array.reduce(function (prev, next) {
    return prev.concat(Array.isArray(next) ? flatten(next, dep - 1) : next)
  }, [])
}

/**
 * 判断是否是空对象
 * @export
 * @param {Object} object 对象
 */
export function isEmptyObject(object: Object): boolean {
  return Object.keys(object).length === 0
}

/**
 * 传递路径查找
 * @export
 * @param {Object} object 查找的对象
 * @param {Array} path 路径
 */
export function get(object: Object, path: Array<string>): Object {
  let result = object
  for (let index = 0; index < path.length; index++) {
    result = result[path[index]]
  }
  return result
}
