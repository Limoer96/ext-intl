import { resolvePath } from '../../utils/common'
import { ExtCustomConfig } from './interface'

export const INIT_CONFIG: ExtCustomConfig = {
  rootPath: resolvePath('./src'),
  langs: ['zh-CN', 'en-US'],
  extractOnly: true,
  whiteList: ['.ts', '.tsx', '.js', '.jsx'],
  prefix: [],
  templateString: {
    funcName: 'I18N.get',
  },
  fieldPrefix: 'intl',
  origin: '',
  accessKey: '',
  langMapper: {
    'zh-CN': 'zh-CN',
    'en-US': 'en-US',
  },
}

export const CONFIG_FILE_NAME = '.extintl.json'
