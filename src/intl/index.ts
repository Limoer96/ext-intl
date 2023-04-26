import * as fs from 'fs'
import * as chalk from 'chalk'
import getI18nTemplateString from './i18n'
import getTypingTemplateString from './typing'
import getContextTemplate from './context'
import { formatFileWithConfig } from '../utils/format'
import { ExtConfig } from '../commands/config/interface'
import appStorageTemplate from './app-storage'
import webStorageTemplate from './web-storage'
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

export default writeI18nTemplateFile
