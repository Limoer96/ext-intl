import * as ts from 'typescript';
import * as path from 'path'
import * as fs from 'fs'
/**
 * 去掉文件中的注释
 * @param code
 * @param fileName
 */
export function removeFileComment(code: string, fileName: string) {
  const printer: ts.Printer = ts.createPrinter({ removeComments: true });
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    '',
    code,
    ts.ScriptTarget.ES2015,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  return printer.printFile(sourceFile);
}

export const BasePath = path.resolve(__dirname)

// 大写首字母
function upperCase(str: string, idx: number) {
  if(idx === 0) {
    return str
  } else {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

// 依据文件路径生成key
// 若路径中包含src，则只截取src后面的路径生成key，否则全路径生成key
export function genKey(filePath: string) {
  let { name, dir } = path.parse(filePath)
  const spliter = /[\/\\\\]/
  dir = dir.replace(/.*:/,'') // 去除windows下的盘符
  const paths: string[] = dir.split(spliter);
  const id = paths.indexOf('src')
  paths.splice(0, id + 1) //删除src以外所有路径
  paths.push(name)
  return paths.map((item, idx) => upperCase(item, idx)).join('')
}

export interface ReplacementItem {
  pos: number
  end: number
  text: string | number
}
/**
 * 批量文件替换
 * @param file 文件的字符串形式
 * @param replaceList 待替换的元素列表
 * @param filename 待写入文件路径
 */
export function printToFile(file: string, replaceList: ReplacementItem[], filename: string) {
  replaceList.sort((a, b) => b.pos - a.pos) // 按照位置从大到小排序
  for(const item of replaceList) {
    const { pos, end, text } = item
    file = file.substring(0, pos) + text + file.substring(end)
  }
  fs.writeFileSync(filename, file)
}
