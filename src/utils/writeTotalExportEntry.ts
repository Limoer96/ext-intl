import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import * as mkdirp from 'mkdirp'
import { IConfig } from '../constant'
import { formatFileWithConfig, useTs } from './common'

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
 * 多版本的统一入口文件倒出
 * @param textArr 扫描到的词条数组
 * @param targetFilePath 当前扫描文件路径
 */
function writeTotalExportEntry(dirPath: string) {
  const { outputPath, langs } = <IConfig>global['intlConfig']
  const extname = '.' + (useTs() ? 'ts' : 'js')
  let content = ''
  try {
    // 过滤到非版本文件夹
    const files = fs
      .readdirSync(outputPath)
      .filter((file) => fs.statSync(`${outputPath}/${file}`).isDirectory() && file.includes('v'))
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
  const entryPath = path.resolve(dirPath, `index${extname}`)
  const exist = fs.existsSync(dirPath)
  if (!exist) {
    mkdirp.sync(dirPath)
  }
  try {
    fs.writeFileSync(entryPath, content)
  } catch (error) {
    console.log(chalk.red(`[ERROR] ${error}`))
  }
}

export default writeTotalExportEntry
