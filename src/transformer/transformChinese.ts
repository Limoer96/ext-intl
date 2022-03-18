import * as ts from 'typescript'
import { DOUBLE_BYTE_REGEX, IConfig } from '../constant'
import { removeFileComment, saveFile, getVariableFromTmeplateString, getQuotePath } from '../utils/common'
export interface Text {
  key: string
  value: string
  comment: string
}
/**
 * 在源文件中查找中文词条
 * @param code 源代码
 * @param fileName 当前文件路径名
 */
export function transformChinese(code: string, fileName: string) {
  const { extractOnly, prefix, templateString, fieldPrefix, versionName, rootPath } = <IConfig>global['intlConfig']
  const matches: Array<Text> = []
  const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX)
  const quotePath = getQuotePath(rootPath, fileName, versionName)
  let index = 1
  const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
    function visit(node: ts.Node) {
      const name = `${fieldPrefix}_${index}`
      switch (node.kind) {
        case ts.SyntaxKind.StringLiteral: {
          const { text } = <ts.StringLiteral>node
          if (text.match(DOUBLE_BYTE_REGEX)) {
            matches.push({
              key: name,
              value: text,
              comment: `
                /**
                 * ${text} 
                 */`,
            })
            index += 1
            // 原处修改
            if (!extractOnly) {
              const parentNodeKind = node.parent.kind
              const result =
                parentNodeKind === ts.SyntaxKind.JsxAttribute ? `{${quotePath}.${name}}` : `${quotePath}.${name}`
              return ts.createIdentifier(result)
            }
          }
          break
        }
        case ts.SyntaxKind.JsxText: {
          const text = node.getText()
          let noCommentText = removeFileComment(text, fileName)
          if (noCommentText.match(DOUBLE_BYTE_REGEX)) {
            noCommentText.replace(';\n', '')
            matches.push({
              key: name,
              value: noCommentText,
              comment: `
              /**
               * ${noCommentText} 
               */`,
            })
            index += 1
            if (!extractOnly) {
              return ts.createJsxText(`{${quotePath}.${name}}`)
            }
          }
          break
        }
        case ts.SyntaxKind.TemplateExpression: {
          const { pos, end } = node
          const text = code.slice(pos, end)
          if (text.match(DOUBLE_BYTE_REGEX)) {
            if (templateString && templateString.funcName) {
              // 记录文本匹配
              matches.push({
                key: name,
                value: text.replace(/\$(?=\{)/g, ''), // 先行断言，去掉`$`
                comment: `
                /**
                 * ${text} 
                 */`,
              })
              index += 1
              // 返回新的节点(函数调用)
              const variableList: string[] = getVariableFromTmeplateString(text)
              const objParam = ts.createObjectLiteral(
                variableList.map((variable) => ts.createPropertyAssignment(variable, ts.createIdentifier(variable)))
              )
              return ts.createCall(ts.createIdentifier(templateString.funcName), undefined, [
                ts.createIdentifier(`${quotePath}.${name}`),
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
    saveFile(transformedFile as any, fileName, [...prefix])
  }
  return matches
}
