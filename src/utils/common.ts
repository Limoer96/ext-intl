import * as ts from 'typescript'
import * as path from 'path'
import * as fs from 'fs'
/**
 * 去掉文件中的注释
 * @param code
 * @param fileName
 */
export function removeFileComment(code: string, fileName: string) {
  const printer: ts.Printer = ts.createPrinter({ removeComments: true })
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    '',
    code,
    ts.ScriptTarget.ES2015,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )
  return printer.printFile(sourceFile)
}

export const BasePath = path.resolve(__dirname)

// 大写首字母
function upperCase(str: string, idx: number) {
  if (idx === 0) {
    return str
  } else {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

export function parsePath(filePath: string) {
  let { dir, name } = path.parse(filePath)
  const spliter = /[\/\\\\]/
  dir = dir.replace(/.*:/, '') // 去除windows下的盘符
  const paths: string[] = dir.split(spliter)
  const id = paths.indexOf('src')
  paths.splice(0, id + 1) //删除src以外所有路径
  paths.push(name)
  return paths
}

export function genKey(filePath: string) {
  const paths = parsePath(filePath)
  return paths.map((item, idx) => upperCase(item, idx).replace(/-/g, '')).join('')
}
// 获取引用路径
export function getQuotePath(filePath: string) {
  const paths = parsePath(filePath)
  return `kiwiIntl.${paths.join('.')}`
}

export interface ReplacementItem {
  pos: number
  end: number
  text: string | number
}
/**
 * 批量文件替换(已不再使用)
 * @param file 文件的字符串形式
 * @param replaceList 待替换的元素列表
 * @param filename 待写入文件路径
 * @param prefix 可写入到源文件中的顶部字符串，一般为包引入等
 */
export function printToFile(file: string, replaceList: ReplacementItem[], filename: string, prefix?: string) {
  if (replaceList.length === 0) return
  replaceList.sort((a, b) => b.pos - a.pos) // 按照位置从大到小排序
  for (const item of replaceList) {
    const { pos, end, text } = item
    file = file.substring(0, pos) + text + file.substring(end)
  }
  if (prefix) {
    file = prefix + file
  }
  fs.writeFileSync(filename, file)
}
/**
 * 转换后的文件保存到文件
 * @param ast 转换后的ast
 * @param fileName 文件名路径
 * @param prefix 前缀字符串
 */
export function saveFile(ast: ts.SourceFile, fileName: string, prefix?: string[]) {
  const printer = ts.createPrinter()
  let file = printer.printFile(ast)
  if (prefix) {
    file = prefix.join('\n') + '\n' + file
  }
  fs.writeFileSync(fileName, file)
}

/**
 * 处理匹配到的原始词条
 * @param text 原始词条
 * @param template 是否生成模板
 */
export function measureText(text: string, template: boolean) {
  if (template) return ''
  const res = text
    .replace(/;/g, '')
    .replace(/[\r\n]/g, '')
    .replace(/\$/g, '')
    .replace(/[`'"]/g, '')
  return res
}

export function is(obj: any, type: string) {
  const typeString: string = Object.prototype.toString.call(obj)
  return typeString.substring(8, typeString.length - 1).toLowerCase() === type
}

/**
 * 获取模板字符串中的变量名
 * @param text 模板字符串
 */

export function getVariableFromTmeplateString(text: string): string[] {
  if (!text) {
    return []
  }
  const reg = /\$\{(.+?)\}/g
  const variableList = []
  while (true) {
    const result = reg.exec(text)
    if (!result) break
    variableList.push(result[1])
  }
  return variableList
}

/**
 * 生成绝对路径
 * @param pathName
 */
export function resolvePath(pathName) {
  return path.resolve(process.cwd(), pathName)
}
/**
 * 检测是否是ts环境
 */
export function useTs(): boolean {
  return fs.existsSync(resolvePath('.tsconfig.json'))
}
/**
 * 获取当前页面导入intl的语句
 * @param filePath
 */
export function geti18NString(filePath: string) {
  const { dir } = path.parse(filePath)
  const i18nEntryFilePath = resolvePath('./src/i18n')
  let relativePath = path.relative(dir, i18nEntryFilePath).replace(/\\/g, '/')
  if (relativePath.startsWith('i18n')) {
    relativePath = './' + relativePath
  }
  const importI18NStr = `import kiwiIntl from '${relativePath}'`
  return importI18NStr
}

/**
 * 获取输出路径(兼容vscode插件)
 */
export function getOutputPath() {
  return resolvePath('./i18n')
}
