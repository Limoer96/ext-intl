import { resolvePath } from '../../utils/common'
import { DependenciesType, ExtCustomConfig } from './interface'

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
    'zh-CN': 'zh',
    'en-US': 'en',
  },
}

export const CONFIG_FILE_NAME = '.extintl.json'

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
