import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import { isUseTs } from '../../utils/common'
import { formatFileWithConfig } from '../../utils/format'
import { ExtConfig } from '../config/interface'

function getExportContentByLang(lang: string, files: string[]) {
  const list = ['{']
  for (const file of files) {
    list.push(`'${file}': ${file}_${lang},`)
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
  const extname = '.' + (isUseTs ? 'ts' : 'js')
  let content = ''
  try {
    const files = fs
      .readdirSync(basePath)
      .filter((file) => fs.statSync(`${basePath}/${file}`).isDirectory() && file.includes('v'))
    for (const file of files) {
      for (const lang of langs) {
        content += `import ${file}_${lang} from './${file}/${lang}/_index';`
      }
    }
    for (const lang of langs) {
      content += `export const ${lang} = ${getExportContentByLang(lang, files)};`
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
