import * as ts from 'typescript'
import * as path from 'path'
import * as fs from 'fs'
import * as chalk from 'chalk'
import * as prettier from 'prettier'
import { IMPORTED_I18N_HOOKS } from '../constant'
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

export function parsePath(fileRelativePath: string) {
  const { dir, name } = path.parse(fileRelativePath)
  const paths = []
  const spliter = /[\/\\\\]/
  paths.push(...dir.split(spliter).filter(Boolean))
  paths.push(name)
  return paths
}

export function genKey(filePath: string) {
  const paths = parsePath(filePath)
  return paths.map((item, idx) => upperCase(item, idx).replace(/-/g, '')).join('')
}
// 获取引用路径
export function getQuotePath(rootPath: string, filePath: string, versionName: string) {
  const relativePath = filePath.replace(rootPath, '')
  const paths = parsePath(relativePath).map((item) => formatFileName(item)) // 把短横线换成下划线
  return `I18N.${versionName}.${paths.join('.')}`
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
    console.log(chalk.red(`[ERROR] failed to generate file: ${fileName}`))
  }
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
  return fs.existsSync(resolvePath('tsconfig.json'))
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
  // const importI18NStr = `import kiwiIntl from '${relativePath}'`
  return `import { useI18n } from '@/i18n/context'`
  // return importI18NStr
}

/**
 * 获取输出路径(兼容vscode插件)
 */
export function getOutputPath() {
  return resolvePath('./src/i18n')
}

/**
 * formatFileName
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

const INIT_VERSION_NUMBER = 1
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

/**
 * 使用项目中的prettier配置进行格式化
 * @param text 需要格式化的文本
 * @param configFilePath 配置开始搜索的目录
 * @returns 格式化后的文本
 */
export function formatFileWithConfig(text: string, configFilePath?: string) {
  if (!configFilePath) {
    configFilePath = process.cwd()
  }
  let options: prettier.Options = {
    parser: 'typescript',
    bracketSpacing: true,
    jsxBracketSameLine: true,
    singleQuote: true,
    trailingComma: 'all',
    arrowParens: 'avoid',
    semi: false,
    useTabs: true,
  }
  try {
    const configFinded = prettier.resolveConfig.sync(configFilePath)
    if (configFinded) {
      options = {
        ...configFinded,
        parser: 'typescript',
      }
    }
  } catch (error) {
    console.log(
      chalk.yellow('[WARNING] can not find perttier config file in your project, use default config instead!')
    )
  }
  return prettier.format(text, options)
}
