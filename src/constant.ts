import { resolvePath } from './utils/common'
export const TAB = ' '

export const DOUBLE_BYTE_REGEX: RegExp = /[^\x00-\xff]/g

export interface IConfig {
  outputPath: string
  rootPath: string
  extractOnly: boolean
  whiteList: string[]
  prefix?: string[]
  // 用于处理模板字符串的配置
  templateString?: {
    funcName: string
  }
  langs?: string[]
  /**
   * 命名时字段前缀
   */
  fieldPrefix?: string
  /**
   * 某次运行时的版本（不需要传入），如果`extractOnly`为true，则versionName=''表示不使用版本规则
   */
  versionName?: string
}

export const INIT_CONFIG: IConfig = {
  outputPath: resolvePath('./src/i18n'),
  rootPath: resolvePath('./src'),
  langs: ['zh-CN', 'en-US'],
  extractOnly: true,
  whiteList: ['.ts', '.tsx', '.js', '.jsx'],
  prefix: [],
  templateString: {
    funcName: 'kiwiIntl.get',
  },
  fieldPrefix: 'intl',
}

export const CONFIG_FILE_NAME = '.extintl.json'
export const DEFAULT_LANGUAGE = 'zh-CN'
export const IGNORE_I18N_PATH = resolvePath('./src/i18n')
export const IMPORTED_I18N_HOOKS = `import { useI18n } from '@/i18n/context';\n`
