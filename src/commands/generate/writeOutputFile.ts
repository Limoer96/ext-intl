import * as fs from 'fs'
import * as chalk from 'chalk'
import * as ts from 'typescript'
import { Text } from '../../transformer/transformChinese'
import { isUseTs } from '../../utils/common'
import { formatFileWithConfig } from '../../utils/format'
import { ExtConfig } from '../config/interface'

function getText(textObj: Text, lang: string) {
  const { langs } = <ExtConfig>global['intlConfig']
  const isMainLang = lang === langs[0]
  const text = isMainLang ? textObj.value : textObj[lang] || ''
  return text
    .replace(/;/g, '')
    .replace(/[\r\n]/g, '')
    .replace(/\$/g, '')
    .replace(/[`'"]/g, '')
}

/**
 * 读取并更新i18n文件
 * @param textArr 提取词条数组
 * @param filePath 读取文件路径
 * @param lang 语言
 */
function readAndUpdateI18nFile(textArr: Text[], filePath: string, lang: string) {
  let entryObj
  const promiseText = fs.readFileSync(filePath)
  const ast = ts.createSourceFile(
    '',
    promiseText.toString(),
    ts.ScriptTarget.ES2015,
    true,
    isUseTs ? ts.ScriptKind.TS : ts.ScriptKind.JS
  )
  const factory = ts.factory
  const printer = ts.createPrinter({})
  const transformer =
    <T extends ts.Node>(context: ts.TransformationContext) =>
    (rootNode: T) => {
      function visit(node: ts.Node) {
        switch (node.kind) {
          case ts.SyntaxKind.ObjectLiteralExpression: {
            const { properties, parent } = <ts.ObjectLiteralExpression>node
            if (parent.kind === ts.SyntaxKind.ExportAssignment) {
              const propertyAssignment = properties.filter(
                (property) => property.kind === ts.SyntaxKind.PropertyAssignment
              )
              if (propertyAssignment?.length > 0) {
                // 读取词条信息
                entryObj = propertyAssignment.reduce((pre, curr) => {
                  const key = (curr.name as ts.Identifier).escapedText as string
                  const value = (curr as ts.PropertyAssignment).initializer.getText().replace(/'|"/g, '')
                  return {
                    ...pre,
                    [key]: value,
                  }
                }, {})
                const propertyArray = textArr
                  .filter((item) => !entryObj?.[item.key])
                  .map((item) => {
                    const property = factory.createPropertyAssignment(
                      factory.createIdentifier(`${item.key}`),
                      factory.createStringLiteral(item?.[lang]?.replace(/[\r\n;]/g, '') || '')
                    )
                    // 添加注释
                    const commentProperty = ts.addSyntheticLeadingComment(
                      property,
                      ts.SyntaxKind.MultiLineCommentTrivia,
                      `*\n* ${item.value.replace(/[\r\n;]/g, '')}\n`,
                      false
                    )
                    return commentProperty
                  })
                return factory.createObjectLiteralExpression([...propertyArray, ...propertyAssignment])
              }
            }
            break
          }
        }
        return ts.visitEachChild(node, visit, context)
      }
      return ts.visitNode(rootNode, visit)
    }
  const transformedFile = ts.transform(ast, [transformer]).transformed[0]

  const newEntryArr = textArr.filter((item) => !entryObj?.[item.key])
  if (newEntryArr.length) {
    function unicodeToChar(str: string) {
      return str.replace(/\\u[\dA-F]{4}/gi, function (match) {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
      })
    }
    const file = printer.printFile(transformedFile as ts.SourceFile)
    const formateFile = unicodeToChar(file)
    fs.writeFileSync(filePath, formatFileWithConfig(formateFile), { encoding: 'utf-8' })
  }
}

/**
 * 首次写入i18n文件
 * @param textArr 提取词条数组
 * @param filePath 读取文件路径
 * @param lang 语言
 */
function firstWriteI18nFile(textArr: Text[], filePath: string, lang: string) {
  let textStr = textArr
    .map(
      (text) =>
        `${text.comment.endsWith('\n') ? text.comment : `${text.comment}\n`}${text.key}: '${getText(text, lang)}',`
    )
    .join('\n')
  textStr = 'export default {\n' + textStr + '\n}'
  try {
    textStr = formatFileWithConfig(textStr)
  } catch (error) {}

  try {
    fs.writeFileSync(filePath, textStr)
  } catch (error) {
    console.log(chalk.red(`[ERROR] ${error}`))
  }
}

/**
 * 将提取结果写入到文件
 * @param textArr 提取词条数组
 */
function writeOutputFile(textArr: Text[], lang: string) {
  const { outputPath } = <ExtConfig>global['intlConfig']
  const extname = isUseTs ? '.ts' : '.js'
  const filePath = `${outputPath}/langs/${lang}/index${extname}`
  // 判断文件是否存在
  const exist = fs.existsSync(filePath)
  if (!exist) {
    firstWriteI18nFile(textArr, filePath, lang)
  } else {
    readAndUpdateI18nFile(textArr, filePath, lang)
  }
}

/**
 * 写入扫描结果到多个文件
 * @param textArr 扫描到的词条数组
 */
function writeMultiOutFile(textArr: Text[]) {
  const { langs } = <ExtConfig>global['intlConfig']
  if (textArr.length === 0) return
  for (const lang of langs) {
    writeOutputFile(textArr, lang)
  }
}

export default writeMultiOutFile
