import * as ts from 'typescript'
import { ExtConfig } from '../commands/config/interface'
import { DOUBLE_BYTE_REGEX } from '../constant'
import { OriginEntryItem } from '../interface'
import { removeFileComment, saveFile, getVariableFromTmeplateString, getQuotePath } from '../utils/common'
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
  const { extractOnly, templateString, fieldPrefix, versionName, rootPath } = <ExtConfig>global['intlConfig']
  const entries: OriginEntryItem[] = global['local_entries']
  const matches: Array<Text> = []
  const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX)
  const factory = ts.factory
  const quotePath = getQuotePath(rootPath, fileName, versionName)
  let index = 1
  const transformer =
    <T extends ts.Node>(context: ts.TransformationContext) =>
    (rootNode: T) => {
      function visit(node: ts.Node) {
        const name = `${fieldPrefix}_${index}` // 按照前缀&索引生成的默认词条key
        switch (node.kind) {
          case ts.SyntaxKind.StringLiteral: {
            const { text } = <ts.StringLiteral>node
            if (text.match(DOUBLE_BYTE_REGEX)) {
              // 1. 在本地寻找词条，如果找到
              const finded = entries.find((entry) => entry.mainLangText === text)
              const langs = finded?.langs || {}
              const key = finded?.key || name
              matches.push({
                isMatch: !!finded,
                key,
                value: text,
                comment: `
                /**
                 * ${text}
                 */`,
                ...langs,
              })
              index += 1
              const parentNodeKind = node.parent.kind
              const result =
                parentNodeKind === ts.SyntaxKind.JsxAttribute ? `{${quotePath}.${key}}` : `${quotePath}.${key}`
              return factory.createIdentifier(result)
            }
            break
          }
          case ts.SyntaxKind.JsxText: {
            const text = node.getText()
            let noCommentText = removeFileComment(text, fileName)
            if (noCommentText.match(DOUBLE_BYTE_REGEX)) {
              noCommentText.replace(';\n', '')
              const finded = entries.find((entry) => entry.mainLangText === noCommentText)
              const langs = finded?.langs || {}
              const key = finded?.key || name
              matches.push({
                isMatch: !!finded,
                key,
                value: noCommentText,
                comment: `
                /**
                 * ${noCommentText}
                 */`,
                ...langs,
              })
              index += 1
              return factory.createJsxText(`{${quotePath}.${key}}`)
            }
            break
          }
          case ts.SyntaxKind.TemplateExpression: {
            const { pos, end } = node
            let text = code.slice(pos, end)
            if (text.match(DOUBLE_BYTE_REGEX)) {
              text.replace(/\$(?=\{)/g, '')
              if (templateString && templateString.funcName) {
                const finded = entries.find((entry) => entry.mainLangText === text)
                const langs = finded?.langs || {}
                const key = finded?.key || name
                matches.push({
                  isMatch: !!finded,
                  key,
                  value: text,
                  comment: `
                /**
                 * ${text}
                 */`,
                  ...langs,
                })
                index += 1
                // 返回新的节点(函数调用)
                const variableList: string[] = getVariableFromTmeplateString(text)
                const objParam = factory.createObjectLiteralExpression(
                  variableList.map((variable) =>
                    factory.createPropertyAssignment(variable, factory.createIdentifier(variable))
                  )
                )
                return factory.createCallExpression(factory.createIdentifier(templateString.funcName), undefined, [
                  factory.createIdentifier(`${quotePath}.${key}`),
                  objParam,
                ])
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
