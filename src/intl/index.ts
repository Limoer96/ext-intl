import * as fs from 'fs'
import * as chalk from 'chalk'
import * as ChildProcess from 'child_process'
import getI18nTemplateString from './i18n'
import getTypingTemplateString from './typing'
import getContextTemplate from './context'
import { formatFileWithConfig } from '../utils/format'
import { ExtConfig } from '../commands/config/interface'
import appStorageTemplate from './app-storage'
import webStorageTemplate from './web-storage'
import { resolvePath } from '../utils/common'
import { RN_ASYNC_STORAGE } from '../commands/config/constant'
/**
 * 写入i18n模版文件
 */
function writeI18nTemplateFile(envCarrier: 'APP' | 'WEB') {
  const { outputPath, langs } = <ExtConfig>global['intlConfig']
  const isApp = envCarrier === 'APP'
  const i18nStr = getI18nTemplateString(langs)
  const typingStr = getTypingTemplateString(langs)
  const contextStr = getContextTemplate(isApp)
  const storageTemplate = isApp ? appStorageTemplate : webStorageTemplate
  if (isApp) {
    downLoadAsyncStorage()
  }
  writeFileIfNotExisted(`${outputPath}/storage.ts`, storageTemplate)
  writeFileIfNotExisted(`${outputPath}/index.ts`, i18nStr)
  writeFileIfNotExisted(`${outputPath}/typing.ts`, typingStr)
  writeFileIfNotExisted(`${outputPath}/context.tsx`, contextStr)
}

/**
 * 写入单个文件，如果文件不存在的话
 */
function writeFileIfNotExisted(filePath: string, content: string) {
  if (fs.existsSync(filePath)) {
    console.log(chalk.yellow(`[WARNING] 多语言模版: ${filePath} 已存在，跳过写入.`))
    return
  }
  try {
    fs.writeFileSync(filePath, formatFileWithConfig(content))
  } catch (error) {
    console.log(chalk.red(`[ERROR] 写入多语言模版失败: ${error.message}`))
  }
}

/**
 * 下载@react-native-async-storage/async-storage包
 */
function downLoadAsyncStorage() {
  const packagePath = resolvePath('package.json')
  fs.readFile(packagePath, 'utf8', (err, data) => {
    if (!err) {
      const obj = JSON.parse(data)
      const asyncStorage = obj?.['dependencies']?.[RN_ASYNC_STORAGE]
      if (!asyncStorage) {
        console.log(chalk.gray(`[INFO] 开始下载${RN_ASYNC_STORAGE}`))
        const child = ChildProcess.exec(
          `yarn add ${RN_ASYNC_STORAGE}`,
          {
            timeout: 30000,
          },
          (chileErr) => {
            if (!chileErr) {
              console.log(chalk.green(`[INFO] ${RN_ASYNC_STORAGE}下载成功`))
            } else {
              console.log(chalk.red(`[ERROR] ${RN_ASYNC_STORAGE}下载失败，请重新下载`))
            }
          }
        )
        child.stdout.on('data', (data) => {
          console.log(data)
        })
        child.stderr.on('data', (err) => {
          console.log(err)
        })
      }
    }
  })
}

export default writeI18nTemplateFile
