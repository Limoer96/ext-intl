import * as ts from 'typescript'
import { removeFileComment } from './utils'
const path = require('path')
const fs = require('fs')

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
// 获取key的方法写得有问题，如果只是指定src文件夹可以，否则key会出现问题
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
export function findTextInTs(code: string, fileName: string, extractOnly: boolean) {
  const matches: Array<Text> = []
  let codeString = code
  const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX)
  const key = genKey(fileName)
  let index = 1;
  function visit(node: ts.Node) {
    switch(node.kind) {
      // case ts.SyntaxKind.JsxAttribute: {
      //   const text = (node as ts.JsxAttribute).initializer.getText() // 获取初始值
      //   if(text.match(DOUBLE_BYTE_REGEX)) {
      //     const node1 = <ts.JsxAttribute>node
      //     // const { pos, end } = node1.initializer
      //     // const result = ts.updateJsxAttribute(node1, node1.name, initializer)
      //     // console.log('bs', result.initializer)
      //     codeString = codeString.replace(text, `{I18N.${key}${index}}`); // 源码替换
      //     matches.push({
      //       key: `${key}${index}`,
      //       value: text,
      //       comment: `/** ${text} **/`
      //     })
      //     index += 1
      //   }
      //   break
      // }
      case ts.SyntaxKind.StringLiteral: {
        const { text } = node as ts.StringLiteral
        if (text.match(DOUBLE_BYTE_REGEX)) {
          if(!extractOnly) {
            const parentNodeKind = node.parent.kind
            // 这里必须假设，所有如果匹配到一样的文本，那么它的翻译也是一样的
            const reg = new RegExp(`['"]${text}['"]`, 'g')
            if (parentNodeKind === ts.SyntaxKind.CallExpression) {
              // 192 CallExpression 函数调用
              codeString = codeString.replace(reg, `I18N.${key}${index}`);
            } else if (parentNodeKind === ts.SyntaxKind.JsxAttribute) {
              // 268 JsxAttribute JSX属性
              codeString = codeString.replace(reg, `{I18N.${key}${index}}`);
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
            let noCommentText = removeFileComment(text, fileName)
            if (noCommentText.match(DOUBLE_BYTE_REGEX)) {
              // child.text = `{ I18N.${key}${index} }`
              // notice: moCommentText是带分号的，需要先去除分号以及多余的空格
              if(!extractOnly) {
                noCommentText = noCommentText.trim()
                noCommentText = noCommentText.slice(0, -1)
                codeString = codeString.replace(noCommentText, `{ I18N.${key}${index} }`)
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

  // const printer:ts.Printer = ts.createPrinter()
  // let result = printer.printFile(ast)
  // codeString = `import i18n from '@/i18n';\n` + codeString // 通过字符串拼接的方式写入，通过配置的方式拼接
  fs.writeFileSync(fileName, codeString)
  return matches
}
