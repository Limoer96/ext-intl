import * as prettier from 'prettier'
import * as fs from 'fs'
import * as chalk from 'chalk'
import { useTs, resolvePath } from '../utils/common'

function getTemplateString(langs: string[]) {
  const langMapStringList = ['const langs = {\n']
  const langNameMapStringList = ['export const langMap = {\n']
  const importLines = ["import kiwiIntl from 'kiwi-intl';\n"]
  for (const lang of langs) {
    const langName = lang.replace('-', '')
    importLines.push(`import ${langName} from '../i18n/${lang}/_index';\n`)
    langNameMapStringList.push(`'${lang}': '${lang}',\n`)
    langMapStringList.push(`'${lang}': ${langName},\n`)
  }
  langMapStringList.push('};\n')
  langNameMapStringList.push('};\n')
  const returnd = `
    ${importLines.join('')}
    ${langMapStringList.join('')}
    ${langNameMapStringList.join('')}
    const currentLang = 'zh-CN'
    const I18N = kiwiIntl.init(currentLang, langs)
    export default I18N
  `
  return prettier.format(returnd, { parser: 'babel' })
}

function writeTemplateFile(langs: string[]) {
  const contentString = getTemplateString(langs)
  function getFilePath(baseName: string) {
    return resolvePath(`./src/${baseName}.${useTs() ? 'ts' : 'js'}`)
  }
  let filePath = getFilePath('i18n')
  if (fs.existsSync(filePath)) {
    chalk.yellow("[WARNING] The'i18n' file already exists, Content will be overwritten.")
  }
  try {
    fs.writeFileSync(filePath, contentString)
  } catch (error) {
    chalk.red(`[ERROR] Error happended with message: ${error.message}`)
  }
}

export default writeTemplateFile
