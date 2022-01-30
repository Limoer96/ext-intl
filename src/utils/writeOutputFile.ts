import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import * as mkdirp from 'mkdirp'
import { Text } from '../transformer/transformChinese'
import { IConfig, DEFAULT_LANGUAGE } from '../constant'
import { formatFileWithConfig, measureText, useTs } from './common'

/**
 * 将提取结果写入到文件
 * @param textArr 提取词条数组
 * @param targetFilePath 写入目标路径
 */
function writeOutputFile(textArr: Text[], targetFilePath: string, lang: string) {
  let textStr = textArr
    .map(
      (text) =>
        `${text.comment.endsWith('\n') ? text.comment : `${text.comment}\n`}${text.key}: '${measureText(
          text.value,
          lang !== DEFAULT_LANGUAGE
        )}',`
    )
    .join('\n')
  textStr = 'export default {\n' + textStr + '\n}'
  try {
    textStr = formatFileWithConfig(textStr)
  } catch (error) {}
  const write = fs.writeFileSync
  // 判断文件夹是否存在并创建深层次文件夹
  const dirname = path.dirname(targetFilePath)
  const exist = fs.existsSync(dirname)
  if (!exist) {
    mkdirp.sync(dirname)
  }
  const extName = useTs ? '.ts' : '.js'
  const fileName = targetFilePath.replace(path.parse(targetFilePath).ext, extName)
  try {
    write(fileName, textStr)
  } catch (error) {
    console.log(chalk.red(`[ERROR] ${error}`))
  }
}

/**
 * 写入扫描结果到多个文件
 * @param textArr 扫描到的词条数组
 * @param targetFilePath 当前扫描文件路径
 */

function writeMultiOutFile(textArr: Text[], targetFilePath: string) {
  const { langs, outputPath, rootPath, versionName } = <IConfig>global['intlConfig']
  if (textArr.length === 0) return
  for (const lang of langs) {
    let filePath = targetFilePath
    let fileRelativePath = filePath.replace(rootPath, '').substring(1)
    // fix: 确保是一个相对路径
    if (fileRelativePath.startsWith('/')) {
      fileRelativePath = fileRelativePath.slice(1)
    }
    filePath = path.resolve(path.resolve(outputPath, versionName, lang), fileRelativePath)
    writeOutputFile(textArr, filePath, lang)
  }
}

export default writeMultiOutFile
