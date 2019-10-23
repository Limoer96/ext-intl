import * as ts from 'typescript'
import { removeFileComment, BasePath } from './utils'
const path = require('path')
const shortid = require('shortid')

const DOUBLE_BYTE_REGEX = /[^\x00-\xff]/g;
export interface Text {
  key: string
  value: string,
  comment: string
}
// 大写首字母
function upperCase(str: string, idx: number) {
  if(idx === 0) {
    return str
  } else {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

// 依据文件路径生成key

function genKey(filePath: string) {
  const keyPrefix = path.parse(filePath)
  const name = keyPrefix.name
  const paths: string[] = keyPrefix.dir.split('\\');
  const id = paths.indexOf('src')
  paths.splice(0, id + 1)
  paths.push(name)
  return paths.map((item, idx) => upperCase(item, idx)).join('')
}

// see from https://github.com/alibaba/kiwi/blob/master/kiwi-linter/src/findChineseText.ts
export function findTextInTs(code: string, fileName: string) {
  const matches: Array<Text> = []
  const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX)
  const key = genKey(fileName)
  let index = 1;
  function visit(node: ts.Node) {
    switch(node.kind) {
      case ts.SyntaxKind.StringLiteral: {
        const { text } = node as ts.StringLiteral
        if (text.match(DOUBLE_BYTE_REGEX)) {
          matches.push({
            key: `${key}${index++}`,
            value: text,
            comment: `/** ${text} **/`
          })
        }
        break
      }
      case ts.SyntaxKind.JsxElement: {
        const { children } = node as ts.JsxElement
        children.forEach(child => {
          if(child.kind === ts.SyntaxKind.JsxText) {
            const text = child.getText()
            const noCommentText = removeFileComment(text, fileName)
            if (noCommentText.match(DOUBLE_BYTE_REGEX)) {
              matches.push({
                key: `${key}${index++}`,
                value: noCommentText,
                comment: `/** ${noCommentText} **/`
              })
            }
          }
        })
        break
      }
      case ts.SyntaxKind.TemplateExpression: {
        const { pos, end } = node
        const templateContent = code.slice(pos, end)
        if(templateContent.match(DOUBLE_BYTE_REGEX)) {
            matches.push({
              key: `${key}${index++}`,
              value: templateContent,
              comment: `/** ${templateContent} **/`
            })
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(ast, visit)
  return matches
}
