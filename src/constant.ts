import { resolvePath, useTs as useTsFn } from './utils/common'

export const TAB = ' '
export const DOUBLE_BYTE_REGEX: RegExp = /[^\x00-\xff]/g
export const CONFIG_FILE_NAME = '.extintl.json'
export const DEFAULT_LANGUAGE = 'zh-CN'
export const IGNORE_I18N_PATH = resolvePath('./src/i18n')
export const IMPORTED_I18N_HOOKS = `import { useI18n } from '@/i18n/context';\n`

export const useTs = useTsFn()

export const INIT_VERSION_NUMBER = 1
