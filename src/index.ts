import { IConfig, INIT_CONFIG } from './constant'
import checkConfig from './utils/checkConfig'
import * as chalk from 'chalk'
import { is, resolvePath } from './utils/common'
import * as fs from 'fs'
import { traverseDir } from './traverse'
import writeTemplateFile from './intl/i18nTemplate'

export function intl(config?: IConfig) {
  checkConfig(config)
    .then((config: IConfig) => {
      const { rootPath, outputPath, whiteList, langs } = config
      // 处理文件白名单
      if (!is(whiteList, 'array') || whiteList.length === 0) {
        config.whiteList = INIT_CONFIG.whiteList
      }
      if (!langs || (is(langs, 'array') && langs.length === 0)) {
        config.langs = INIT_CONFIG.langs
      }
      // 输出路径使用默认值
      const outDirName = INIT_CONFIG.outputPath
      config.rootPath = resolvePath(rootPath)
      config.outputPath = outDirName
      global['intlConfig'] = config
      // 初始化输入目录
      fs.mkdir(outDirName, (err) => {
        if (err && err.code !== 'EEXIST') {
          return Promise.reject(err)
        }
      })
      for (const lang of langs) {
        fs.mkdir(`${outDirName}/${lang}`, (err) => {
          if (err && err.code !== 'EEXIST') {
            return Promise.reject(err)
          }
        })
      }
      return config
    })
    .then((config: IConfig) => {
      // 执行操作
      console.log('start running...')
      console.time('complete with ms')
      const { rootPath } = config
      traverseDir(rootPath)
      writeTemplateFile(config.langs)
      console.timeEnd('complete with ms')
    })
  // .catch((err) => {
  //   console.log(chalk.red('[Error]: ', err))
  //   process.exit(1)
  // })
}
