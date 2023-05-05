import { DependenciesType } from './interface'

export const TAB = ' '
export const DOUBLE_BYTE_REGEX: RegExp = /[^\x00-\xff]/g
export const CONFIG_FILE_NAME = '.extintl.json'
export const DEFAULT_LANGUAGE = 'zh-CN'

export const IMPORTED_I18N_HOOKS = `import { useI18n } from '@/i18n/context';\n`
export const USE_I18N_HOOKS = 'const { I18N } = useI18n();\n'

export const INIT_VERSION_NUMBER = 1

/* APP依赖项 */
export const APP_DEPENDENCIES: DependenciesType = {
  dependencies: ['@react-native-async-storage/async-storage'],
  devDependencies: [],
}

/* WEB依赖项 */
export const WEB_DEPENDENCIES: DependenciesType = {
  dependencies: [],
  devDependencies: [],
}
