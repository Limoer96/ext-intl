import { IConfig, INIT_CONFIG } from './constant'
import checkConfig from './utils/checkConfig'
import { is, resolvePath, getOutputPath, getVersionName } from './utils/common'
import * as fs from 'fs'
import { traverseDir } from './traverse'
import writeI18nTemplateFile from './intl'
import chalk = require('chalk')
import writeTotalExportEntry from './utils/writeTotalExportEntry'

export function intl(config?: IConfig) {
  checkConfig(config)
    .then((config: IConfig) => {
      const { rootPath, whiteList, langs } = config
      if (!is(whiteList, 'array') || whiteList.length === 0) {
        config.whiteList = INIT_CONFIG.whiteList
      }
      if (!langs || (is(langs, 'array') && langs.length === 0)) {
        config.langs = INIT_CONFIG.langs
      }
      const outDirName = getOutputPath()
      config.rootPath = resolvePath(rootPath)
      config.outputPath = outDirName
      config.versionName = getVersionName()
      global['intlConfig'] = config
      try {
        fs.mkdirSync(outDirName)
        for (const lang of langs) {
          const dirPath = config.versionName
            ? `${outDirName}/langs/${config.versionName}/${lang}`
            : `${outDirName}/langs/${lang}`
          fs.mkdirSync(dirPath, { recursive: true })
        }
      } catch (error) {
        const code = error.code
        if (code && code !== 'EEXIST') {
          return Promise.reject(error)
        }
      }
      return config
    })
    .then((config: IConfig) => {
      // 执行操作
      console.log('[INFO] start running...')
      console.time('[INFO] complete with ms')
      const { rootPath, outputPath } = config
      traverseDir(rootPath)
      writeTotalExportEntry(outputPath)
      if (!config.extractOnly) {
        writeI18nTemplateFile(config.langs)
      }
      console.timeEnd('[INFO] complete with ms')
    })
    .catch((err) => {
      console.log(chalk.red('[Error]: ', err))
      process.exit(1)
    })
}
