import * as fs from 'fs'
import * as path from 'path'
import { isUseTs } from '../../utils/common'
import { updateLangFile } from './updateLangFile'
import * as ts from 'typescript'
import { formatFileWithConfig } from '../../utils/format'

/**
 * 递归遍历文件并对中文进行抽取
 * @export
 * @param {string} pathName 当前遍历路径
 */
export function traverseDir(file: string, pathName: string, langType: string) {
  if (fs.statSync(pathName).isFile()) {
    if (file === `index.${isUseTs ? 'ts' : 'js'}`) {
      const text = fs.readFileSync(pathName).toString()
      const ast = ts.createSourceFile('', text, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS)
      let result = updateLangFile(ast, langType)
      result = unescape(result.replace(/\\u/g, '%u'))
      fs.writeFileSync(pathName, formatFileWithConfig(result))
    }
  } else {
    // 文件夹
    const files = fs.readdirSync(pathName)
    files.forEach((file) => {
      const absPath = path.resolve(pathName, file)
      traverseDir(file, absPath, langType)
    })
  }
}
