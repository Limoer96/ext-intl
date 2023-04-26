const webStorageTemplate = `
/**
 * 判断str是否是json字符串
 * @param str
 */
const isJSON = (str: string) => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}

function set(key: string, value) {
  let str = ''
  if (typeof value === 'object') {
    str = JSON.stringify(value)
  } else {
    str = value
  }
  localStorage.setItem(key, str)
}

function get(key: string, defaultValue = null) {
  const value = localStorage.getItem(key)

  let res = value
  if (isJSON(value)) {
    res = JSON.parse(value)
  }
  return res !== null ? res : defaultValue
}

export default { get, set }
`

export default webStorageTemplate
