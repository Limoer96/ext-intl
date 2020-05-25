import { IConfig, INIT_CONFIG } from './constant'
import checkConfig from './utils/checkConfig'
import * as chalk from 'chalk'
import { is, resolvePath } from './utils/common'
import * as fs from 'fs'
import { traverseDir, formatFile } from './traverse'

export function intl(config?: IConfig) {
  checkConfig(config)
    .then((config: IConfig) => {
      const { rootPath, outputPath, whiteList, mode, template } = config
      // 处理文件白名单
      if (!is(whiteList, 'array') || whiteList.length === 0) {
        config.whiteList = INIT_CONFIG.whiteList
      }
      // 生成模板时默认`extractOnly = true`
      if (template) {
        config.extractOnly = true
      }
      const outDirOrFileName = resolvePath(outputPath)
      config.rootPath = resolvePath(rootPath)
      config.outputPath = outDirOrFileName
      global['intlConfig'] = config
      // 初始化输入目录/文件
      if (mode === 'sample') {
        try {
          fs.writeFileSync(resolvePath(outDirOrFileName), 'export default {')
        } catch (error) {
          return Promise.reject(error)
        }
      } else {
        fs.mkdir(outDirOrFileName, (err) => {
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
      const { rootPath, outputPath, mode } = config
      traverseDir(rootPath, outputPath)
      if (mode === 'sample') {
        fs.appendFileSync(outputPath, '\n}')
        formatFile(outputPath)
      }
      console.timeEnd('complete with ms')
    })
    .catch((err) => {
      console.log(chalk.red('[Error]: ', err))
      process.exit(1)
    })
}
