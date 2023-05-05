import * as ts from 'typescript'
import { ExtConfig } from '../commands/config/interface'
import { DOUBLE_BYTE_REGEX } from '../constant'
import { OriginEntryItem } from '../interface'
import { removeFileComment, saveFile, getVariableFromTemplateString } from '../utils/common'
import pinyin from 'pinyin'
import { flatten } from '../commands/extract/utils'
export interface Text {
  key: string
  value: string
  comment: string
  [key: string]: any
  isMatch?: boolean
}
/**
 * 在源文件中查找中文词条
 * @param code 源代码
 * @param fileName 当前文件路径名
 */
export function transformChinese(code: string, fileName: string) {
  const { extractOnly, templateString } = <ExtConfig>global['intlConfig']
  const entries: OriginEntryItem[] = global['local_entries']
  const matches: Array<Text> = []
  const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX)
  const factory = ts.factory

  function generateKey(text: string) {
    const noCharText = text.replace(
      /[\u0021-\u007E\u00A1-\u00FF\u3001-\u301f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/g,
      ''
    )
    const pinYinArr = pinyin(noCharText, {
      style: 'tone2',
    })
    const pinYinStr = flatten(pinYinArr).join('_')

    return pinYinStr.length > 40 ? '' : pinYinStr
  }
  const transformer =
    <T extends ts.Node>(context: ts.TransformationContext) =>
    (rootNode: T) => {
      function visit(node: ts.Node) {
        switch (node.kind) {
          case ts.SyntaxKind.StringLiteral: {
            const { text } = <ts.StringLiteral>node
            if (text.match(DOUBLE_BYTE_REGEX)) {
              const textKey = generateKey(text)
              // 1. 在本地寻找词条，如果找到
              const findEntry = entries.find((entry) => entry.key === textKey)
              const langs = findEntry?.langs || {}
              const key = findEntry?.key || textKey
              const isMatch = !!findEntry
              matches.push({
                isMatch,
                key,
                value: text,
                comment: `
                /**
                 * ${text}
                 */`,
                ...langs,
              })
              if (isMatch) {
                const parentNodeKind = node.parent.kind
                const result =
                  parentNodeKind === ts.SyntaxKind.JsxAttribute ? `{I18N.index.${key}}` : `I18N.index.${key}`
                return factory.createIdentifier(result)
              }
            }
            break
          }
          case ts.SyntaxKind.JsxText: {
            const text = node.getText()
            let noCommentText = removeFileComment(text, fileName)
            if (noCommentText.match(DOUBLE_BYTE_REGEX)) {
              noCommentText.replace(';\n', '')
              const textKey = generateKey(noCommentText)
              const findEntry = entries.find((entry) => entry.key === textKey)
              const langs = findEntry?.langs || {}
              const key = findEntry?.key || textKey
              const isMatch = !!findEntry
              matches.push({
                isMatch,
                key,
                value: noCommentText,
                comment: `
                /**
                 * ${noCommentText}
                 */`,
                ...langs,
              })
              if (isMatch) {
                return factory.createJsxText(`{I18N.index.${key}}`)
              }
            }
            break
          }
          case ts.SyntaxKind.TemplateExpression: {
            const { pos, end } = node
            let text = code.slice(pos, end)
            if (text.match(DOUBLE_BYTE_REGEX)) {
              text.replace(/\$(?=\{)/g, '')
              const textKey = generateKey(text)
              if (templateString && templateString.funcName) {
                const findEntry = entries.find((entry) => entry.key === textKey)
                const langs = findEntry?.langs || {}
                const key = findEntry?.key || textKey
                const isMatch = !!findEntry
                matches.push({
                  isMatch,
                  key,
                  value: text,
                  comment: `
                /**
                 * ${text}
                 */`,
                  ...langs,
                })
                if (isMatch) {
                  // 返回新的节点(函数调用)
                  const variableList: string[] = getVariableFromTemplateString(text)
                  const objParam = factory.createObjectLiteralExpression(
                    variableList.map((variable) =>
                      factory.createPropertyAssignment(variable, factory.createIdentifier(variable))
                    )
                  )
                  return factory.createCallExpression(factory.createIdentifier(templateString.funcName), undefined, [
                    factory.createIdentifier(`I18N.index.${key}`),
                    objParam,
                  ])
                }
              } else {
                console.warn(`模板字符串：${fileName} ${text} 无法处理`)
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
  if (!extractOnly && matches.length > 0) {
    saveFile(transformedFile as any, fileName)
  }
  return matches
}
