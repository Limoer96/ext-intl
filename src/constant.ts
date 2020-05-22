import { resolvePath } from './utils/common'
export const TAB = ' '

export const DOUBLE_BYTE_REGEX: RegExp = /[^\x00-\xff]/g

export interface IConfig {
  outputPath: string
  rootPath: string
  template: boolean
  extractOnly: boolean
  whiteList: string[]
  mode?: 'sample' | 'depth' // 模式类型 简单模式/深层次导出
  prefix?: string[]
  // 用于处理模板字符串的配置
  templateString?: {
    funcName: string
  }
}

export const INIT_CONFIG: IConfig = {
  outputPath: resolvePath('./intl'),
  rootPath: resolvePath('./src'),
  template: false,
  extractOnly: true,
  whiteList: ['.ts', '.tsx', '.js', '.jsx'],
  mode: 'depth',
  prefix: [],
  templateString: {
    funcName: 'intl.get',
  },
}

export const CONFIG_FILE_NAME = '.extintl.json'
