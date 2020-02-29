import * as ts from 'typescript'
import { DOUBLE_BYTE_REGEX } from '../const'
import { genKey, removeFileComment, saveFile } from '../utils'

export interface Text {
  key: string;
  value: string;
  comment: string;
}

export function transformChinese(code: string, fileName: string) {
  const { extractOnly, prefix } = global["intlConfig"]
  const matches: Array<Text> = [];
  const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX)
  const key = genKey(fileName)
  let index = 1
  const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
    function visit(node: ts.Node) {
      const name = `${key}${index}`
      switch (node.kind) {
        case ts.SyntaxKind.StringLiteral: {
          const { text } = <ts.StringLiteral>node
          if (text.match(DOUBLE_BYTE_REGEX)) {
            matches.push({
              key: name,
              value: text,
              comment: `/** ${text} **/`
            })
            index += 1
            // 原处修改
            if (!extractOnly) {
              const parentNodeKind = node.parent.kind
              const result = parentNodeKind === ts.SyntaxKind.JsxAttribute ? `{I18N.${name}}` : `I18N.${name}`
              return ts.createIdentifier(result)
            }
          }
          break
        }
        case ts.SyntaxKind.JsxText: {
          const text = node.getText()
          let noCommentText = removeFileComment(text, fileName)
          if(noCommentText.match(DOUBLE_BYTE_REGEX)) {
            matches.push({
              key: name,
              value: noCommentText,
              comment: `/** ${noCommentText} **/`
            })
            index += 1
            if (!extractOnly) {
              return ts.createJsxText(`{ I18N.${name} }`)
            }
          }
          break
        }
        case ts.SyntaxKind.TemplateExpression: {
          const { pos, end } = node
          const text = code.slice(pos, end)
          if (text.match(DOUBLE_BYTE_REGEX)) {
            console.warn(`模板字符串：${fileName} ${text} 无法处理`);
            // matches.push({
            //   key: name,
            //   value: text,
            //   comment: `/** ${text} **/`
            // })
          }
          break
        }
      }
      return ts.visitEachChild(node, visit, context)
    }
    return ts.visitNode(rootNode, visit)
  }
  const transformedFile = ts.transform(ast, [transformer]).transformed[0]
  if (!extractOnly) {
    saveFile(transformedFile as any, fileName, prefix)
  }
  return matches
}
