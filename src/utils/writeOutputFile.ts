import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'
import * as mkdirp from 'mkdirp'
import * as prettier from 'prettier'
import { Text } from '../transformer/transformChinese'
import { IConfig, TAB } from '../constant'
import { measureText } from './common'
/**
 * 将提取结果写入到文件
 * @param textArr 提取词条数组
 * @param targetFilePath 写入目标路径
 */
function writeOutputFile(textArr: Text[], targetFilePath: string) {
  const { template, mode, outputPath, rootPath } = <IConfig>global['intlConfig']
  if (textArr.length === 0) return
  // depth模式下处理输出路径
  if (mode === 'depth') {
    const fileRelativePath = targetFilePath.replace(rootPath, '').substring(1)
    targetFilePath = path.resolve(outputPath, fileRelativePath)
  }
  let textStr = textArr
    .map((text) => `${text.comment}${TAB}${text.key}: '${measureText(text.value, template)}',`)
    .join('\n')
  if (mode === 'sample') {
    textStr = '\n' + textStr
  } else {
    textStr = 'export default {\n' + textStr + '\n}'
  }
  const write = mode === 'sample' ? fs.appendFileSync : fs.writeFileSync
  // 判断文件夹是否存在并创建深层次文件夹
  if (mode === 'depth') {
    const dirname = path.dirname(targetFilePath)
    const exist = fs.existsSync(dirname)
    if (!exist) {
      mkdirp.sync(dirname)
    }
  }
  try {
    if (mode === 'depth') {
      textStr = prettier.format(textStr, { parser: 'babel' })
    }
    write(targetFilePath, textStr)
  } catch (error) {
    console.log(chalk.red(error))
  }
}

export default writeOutputFile
