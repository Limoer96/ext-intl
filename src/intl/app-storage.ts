const appStorageTemplate = `
import AsyncStorage from '@react-native-async-storage/async-storage'

// JSON.parse直接调用可能有bug
function get(key: string, defaultValue = null) {
  return AsyncStorage.getItem(key).then((value) => {
    return value !== null ? JSON.parse(value) : defaultValue
  })
}

function set(key: any, value: any) {
  return AsyncStorage.setItem(key, JSON.stringify(value))
}

export default { get, set }
`

export default appStorageTemplate
