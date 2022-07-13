import * as ts from 'typescript'
import * as path from 'path'
import * as fs from 'fs'
import * as fsPromise from 'fs/promises'
import * as chalk from 'chalk'
import { IMPORTED_I18N_HOOKS, INIT_VERSION_NUMBER } from '../constant'
import { formatFileWithConfig } from './format'
import { Text } from '../transformer/transformChinese'
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

/**
 * 按分割符'/'返回解析后的路径列表
 * @param fileRelativePath
 * @returns
 */
function parsePath(fileRelativePath: string) {
  const { dir, name } = path.parse(fileRelativePath)
  const paths: string[] = []
  const spliter = /[\/\\\\]/
  paths.push(...dir.split(spliter).filter(Boolean))
  paths.push(name)
  return paths
}

/**
 * 获取应用路径字符
 * @param rootPath
 * @param filePath
 * @param versionName
 * @returns
 */
export function getQuotePath(rootPath: string, filePath: string, versionName: string) {
  const relativePath = filePath.replace(rootPath, '')
  const paths = parsePath(relativePath).map((item) => formatFileName(item)) // 把短横线换成下划线
  return `I18N.${versionName}.${paths.join('.')}`
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
  // 导入hooks语句
  if (!file.includes(IMPORTED_I18N_HOOKS)) {
    file = IMPORTED_I18N_HOOKS + file
  }
  if (prefix) {
    file = prefix.join('\n') + '\n' + file
  }
  try {
    fs.writeFileSync(fileName, formatFileWithConfig(file))
  } catch (error) {
    console.log(chalk.red(`[ERROR] 无法生成文件，请手动替换: ${fileName}`))
  }
}

/**
 * 类型判断
 * @param obj
 * @param type
 * @returns
 */
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
 * 基于当前目录生成绝对路径
 * @param pathName
 */
export function resolvePath(pathName: string) {
  return path.resolve(process.cwd(), pathName)
}
/**
 * 检测是否是ts环境
 */
export function useTs(): boolean {
  return fs.existsSync(resolvePath('tsconfig.json'))
}

/**
 * 获取输出路径(兼容vscode插件)
 */
export function getOutputPath() {
  return resolvePath('./src/i18n')
}

/**
 * 格式化文件名称
 * @param fnameStr
 * @returns
 */
export function formatFileName(fnameStr: string) {
  const fileNameArr = fnameStr.split('-')
  return fileNameArr
    .map((name, index) => {
      if (index === 0) {
        return name
      }
      return name.substring(0, 1).toUpperCase() + name.substring(1)
    })
    .join('')
}

/**
 * 获取当次版本号
 * @returns
 */
export function getVersionName() {
  const outputPath = getOutputPath()
  const basePath = `${outputPath}/langs`
  // 首次生成
  if (!fs.existsSync(basePath)) {
    return `v${INIT_VERSION_NUMBER}`
  }
  // 获取新的版本号
  const childPathList = fs.readdirSync(basePath)
  const versionExist = []
  for (const childPath of childPathList) {
    const childPathAbsolute = `${basePath}/${childPath}`
    if (fs.statSync(childPathAbsolute).isDirectory()) {
      const relativePath = path.relative(basePath, childPathAbsolute)
      if (relativePath.startsWith('v')) {
        versionExist.push(Number(relativePath.replace('v', '')))
      }
    }
  }
  const versionSorted = versionExist.filter(Boolean).sort((a, b) => a - b)
  const lastVerion = versionSorted.pop()
  return `v${lastVerion + 1 || INIT_VERSION_NUMBER}`
}

export function isAndEmpty(value: any, type: string, validator: (value: any) => boolean) {
  return is(value, type) && validator(value)
}

export const log = console.log

/**
 * 异步处理函数
 * @param promise
 * @returns
 */
export async function handle<DataType = any>(promise: Promise<DataType>): Promise<[DataType, any]> {
  try {
    const data = await promise
    return [data, undefined]
  } catch (err) {
    return [undefined, err]
  }
}

/**
 * 多语言根目录创建（如果已经存在则跳过）
 */
export async function mkRootDirIfNeeded() {
  const rootDir = getOutputPath()
  try {
    await fsPromise.access(rootDir)
  } catch (error) {
    await fsPromise.mkdir(rootDir, { recursive: true })
  }
}

/**
 * 匹配到词条去除重复
 * @param textSet 当前已去重词条列表
 * @param list 需要去重的词条数据
 * @returns 自身去重和已去重列表去重后的结果
 */
export function removeDuplicatedText(textSet: Text[], list: Text[]) {
  const result: Text[] = []
  for (const item of list) {
    if (!textSet.find((one) => one.value === item.value) && !result.find((i) => i.value === item.value)) {
      result.push(item)
    }
  }
  return result
}
