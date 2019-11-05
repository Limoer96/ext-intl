import * as ts from 'typescript'
import { removeFileComment, genKey, printToFile, ReplacementItem } from './utils'
const path = require('path')
const fs = require('fs')
const os = require('os')

const DOUBLE_BYTE_REGEX = /[^\x00-\xff]/g;
export interface Text {
  key: string
  value: string,
  comment: string
}

// see from https://github.com/alibaba/kiwi/blob/master/kiwi-linter/src/findChineseText.ts
export function findTextInTs(code: string, fileName: string, extractOnly: boolean) {
  const matches: Array<Text> = []
  const replacementList: Array<ReplacementItem> = []
  let codeString = code
  const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX)
  const key = genKey(fileName)
  let index = 1;
  function visit(node: ts.Node) {
    switch(node.kind) {
      case ts.SyntaxKind.StringLiteral: {
        const { text, pos, end } = node as ts.StringLiteral
        if (text.match(DOUBLE_BYTE_REGEX)) {
          if(!extractOnly) {
            const parentNodeKind = node.parent.kind
            if (parentNodeKind === ts.SyntaxKind.CallExpression) {
              // 192 CallExpression 函数调用
              replacementList.push({
                pos,
                end,
                text: `I18N.${key}${index}`
              })
            } else if (parentNodeKind === ts.SyntaxKind.JsxAttribute) {
              // 268 JsxAttribute JSX属性
              replacementList.push({
                pos,
                end,
                text: `{I18N.${key}${index}}`
              })
            } else {
              // 其他类型例如赋值等，直接替换
              replacementList.push({
                pos,
                end,
                text: `I18N.${key}${index}`
              })
            }
          }
          matches.push({
            key: `${key}${index}`,
            value: text,
            comment: `/** ${text} **/`
          })
          index += 1
        }
        break
      }
      case ts.SyntaxKind.JsxElement: {
        const { children } = node as ts.JsxElement
        children.forEach(child => {
          if(child.kind === ts.SyntaxKind.JsxText) {
            const text = child.getText()
            const { pos, end } = child
            let noCommentText = removeFileComment(text, fileName)
            if (noCommentText.match(DOUBLE_BYTE_REGEX)) {
              if(!extractOnly) {
                replacementList.push({
                  pos,
                  end,
                  text: `{ I18N.${key}${index} }`
                })
                // noCommentText = noCommentText.trim()
                // noCommentText = noCommentText.slice(0, -1)
                // codeString = codeString.replace(noCommentText, `{ I18N.${key}${index} }`)
              }
              matches.push({
                key: `${key}${index}`,
                value: noCommentText,
                comment: `/** ${noCommentText} **/`
              })
              index += 1
            }
          }
        })
        break
      }
      case ts.SyntaxKind.TemplateExpression: {
        const { pos, end } = node
        const templateContent = code.slice(pos, end)
        console.log(`${fileName} ${templateContent} 无法处理`)
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
  // codeString = `import i18n from '@/i18n';\n` + codeString // 通过字符串拼接的方式写入，通过配置的方式拼接
  // fs.writeFileSync(fileName, codeString)
  printToFile(codeString, replacementList, fileName)
  return matches
}
