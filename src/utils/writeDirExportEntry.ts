import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import { ExtConfig } from '../interface'
import { formatFileName } from './common'
import { useTs } from '../constant'
import { formatFileWithConfig } from './format'

/**
 * 给每个文件夹写入一个导出入口`index.js/ts`
 * @param dirPath 扫描到的某个文件夹
 */

function writeDirExportEntry(dirPath: string) {
  const { whiteList, outputPath, langs, versionName, rootPath } = <ExtConfig>global['intlConfig']
  const extname = '.' + (useTs ? 'ts' : 'js')
  // 处理文件路径
  for (const lang of langs) {
    let filePath = dirPath
    const fileRelativePath = filePath.replace(rootPath, '').substring(1)
    filePath = path.resolve(path.resolve(outputPath, 'langs', versionName, lang), fileRelativePath)
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
    content = formatFileWithConfig(content)
    // 写入到文件
    const entryPath = path.resolve(filePath, `_index${extname}`)
    const exist = fs.existsSync(filePath)
    if (!exist) {
      fs.mkdirSync(filePath, { recursive: true })
    }
    try {
      fs.writeFileSync(entryPath, content)
    } catch (error) {
      console.log(chalk.red(`[ERROR] ${error}`))
    }
  }
}

export default writeDirExportEntry
