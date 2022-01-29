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
}

export const INIT_CONFIG: IConfig = {
  outputPath: resolvePath('./i18n'),
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
