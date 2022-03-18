import * as fs from 'fs'
import * as chalk from 'chalk'
import getI18nTemplateString from './i18n'
import getTypingTemplateString from './typing'
import contextTemplate from './context'
import { formatFileWithConfig, resolvePath } from '../utils/common'
import { IConfig } from '../constant'
/**
 * 写入i18n模版文件
 * @param langs 当前选择支持的语言
 */
function writeI18nTemplateFile(langs: string[]) {
  const { outputPath } = <IConfig>global['intlConfig']
  const i18nStr = getI18nTemplateString(langs)
  const typingStr = getTypingTemplateString(langs)
  const contextStr = contextTemplate
  writeFileIfNotExisted(`${outputPath}/index.ts`, i18nStr)
  writeFileIfNotExisted(`${outputPath}/typing.ts`, typingStr)
  writeFileIfNotExisted(`${outputPath}/context.tsx`, contextStr)
}

/**
 * 写入单个文件，如果文件不存在的话
 */
function writeFileIfNotExisted(filePath: string, content: string) {
  if (fs.existsSync(filePath)) {
    console.log(chalk.yellow(`[WARNING] file: ${filePath} already exists, skipped.`))
    return
  }
  try {
    fs.writeFileSync(filePath, formatFileWithConfig(content))
  } catch (error) {
    console.log(chalk.red(`[ERROR] Error happended with message: ${error.message}`))
  }
}

export default writeI18nTemplateFile
