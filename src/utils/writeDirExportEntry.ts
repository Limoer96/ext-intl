import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import * as mkdirp from 'mkdirp'
import * as prettier from 'prettier'
import { IConfig } from '../constant'
import { formatFileName, useTs } from './common'

/**
 * 给每个文件夹写入一个导出入口`index.js/ts`
 * @param textArr 扫描到的词条数组
 * @param targetFilePath 当前扫描文件路径
 */

function writeDirExportEntry(dirPath: string) {
  const { whiteList, rootPath, outputPath, langs } = <IConfig>global['intlConfig']
  const extname = '.' + (useTs() ? 'ts' : 'js')
  // 处理文件路径
  for (const lang of langs) {
    let filePath = dirPath
    const fileRelativePath = filePath.replace(rootPath, '').substring(1)
    filePath = path.resolve(path.resolve(outputPath, lang), fileRelativePath)
    if (!fs.existsSync(filePath)) {
      return
    }
    const fileOrDirs = fs.readdirSync(filePath)
    // 生成写入内容
    const fileBaseNames = []
    let content = ''
    for (let f of fileOrDirs) {
      if (f === `_index${extname}`) {
        continue
      }
      const absPath = path.resolve(filePath, f)
      const stats = fs.statSync(absPath)
      // 如果是文件夹的话，则从`dirName/_index`中导入
      if (stats.isDirectory()) {
        fileBaseNames.push(formatFileName(f))
        content += `import ${formatFileName(f)} from './${f}/_index'\n`
      } else if (stats.isFile() && whiteList.includes(path.extname(f))) {
        // 是文件直接导入
        const name = path.basename(f, extname).replace('.', '')
        fileBaseNames.push(formatFileName(name))
        content += `import ${formatFileName(name)} from './${name}'\n`
      }
    }
    content += `export default { ${fileBaseNames.join(',')} }`
    content = prettier.format(content, { parser: 'babel', singleQuote: true })
    // 写入到文件
    const entryPath = path.resolve(filePath, `_index${extname}`)
    const exist = fs.existsSync(filePath)
    if (!exist) {
      mkdirp.sync(filePath)
    }
    try {
      fs.writeFileSync(entryPath, content)
    } catch (error) {
      console.log(chalk.red(`[ERROR] ${error}`))
    }
  }
}

export default writeDirExportEntry
