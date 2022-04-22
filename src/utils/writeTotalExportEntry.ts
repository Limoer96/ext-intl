import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import { ExtConfig } from '../interface'
import { useTs } from '../constant'
import { formatFileWithConfig } from './format'

function getExportContentByLang(lang: string, files: string[]) {
  const list = ['{']
  const countryCode = lang.split('-')[1]
  for (const file of files) {
    list.push(`'${file}': ${file}_${countryCode},`)
  }
  list.push('}')
  return list.join('')
}

/**
 * 多版本的统一入口文件导出
 */
function writeTotalExportEntry() {
  const { langs, outputPath } = <ExtConfig>global['intlConfig']
  const basePath = `${outputPath}/langs`
  const extname = '.' + (useTs ? 'ts' : 'js')
  let content = ''
  try {
    const files = fs
      .readdirSync(basePath)
      .filter((file) => fs.statSync(`${basePath}/${file}`).isDirectory() && file.includes('v'))
    for (const file of files) {
      for (const lang of langs) {
        const countryCode = lang.split('-')[1]
        content += `import ${file}_${countryCode} from './${file}/${lang}/_index';`
      }
    }
    for (const lang of langs) {
      const langName = lang.replace('-', '')
      content += `export const ${langName} = ${getExportContentByLang(lang, files)};`
    }
  } catch (error) {}
  content = formatFileWithConfig(content)
  // 写入到文件
  const entryPath = path.resolve(basePath, `index${extname}`)
  try {
    fs.writeFileSync(entryPath, content)
  } catch (error) {
    console.log(chalk.red(`[ERROR] 文件写入失败 ${entryPath}`))
  }
}

export default writeTotalExportEntry
