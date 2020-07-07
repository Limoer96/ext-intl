import * as fs from 'fs'
import * as path from 'path'
import { IConfig } from './constant'
import { transformChinese } from './transformer/transformChinese'
import * as prettier from 'prettier'
import writeOutputFile from './utils/writeOutputFile'
import writeDirExportEntry from './utils/writeDirExportEntry'

/**
 *递归遍历文件并对中文进行抽取
 * @export
 * @param {string} pathName 当前遍历路径
 */
export function traverseDir(pathName: string) {
  const { whiteList } = <IConfig>global['intlConfig']
  if (fs.statSync(pathName).isFile()) {
    // 单个文件
    if (!whiteList.includes(path.extname(pathName))) {
      return
    }
    const text = fs.readFileSync(pathName).toString()
    const result = transformChinese(text, pathName)
    writeOutputFile(result, pathName)
  } else {
    // 文件夹
    const files = fs.readdirSync(pathName)
    files.forEach((file) => {
      const absPath = path.resolve(pathName, file)
      traverseDir(absPath)
    })
    // 针对文件夹写入入口文件
    writeDirExportEntry(pathName)
  }
}

/**
 * 使用prettier格式化生成文件
 * @param filePath
 */
export function formatFile(filePath: string) {
  const rawData = fs.readFileSync(filePath, 'utf8')
  fs.writeFileSync(filePath, prettier.format(rawData, { parser: 'babel' }))
}
