import * as ts from 'typescript'
import { OriginEntryItem } from '../../interface'

/**
 * 更新文件
 */
export function updateLangFile(ast: ts.SourceFile, langType: string) {
  const entries: OriginEntryItem[] = global['local_entries']
  const transformer =
    <T extends ts.Node>(context: ts.TransformationContext) =>
    (rootNode: T) => {
      function visit(node: ts.Node) {
        switch (node.kind) {
          case ts.SyntaxKind.PropertyAssignment: {
            const current = <ts.PropertyAssignment>node
            const key = current.name.getText()
            const finded = entries.find((entry) => entry.key === key)
            if (finded && finded.langs[langType]) {
              const valNode = ts.factory.createStringLiteral(finded.langs[langType], true)
              return ts.factory.createPropertyAssignment(key, valNode)
            }
          }
        }
        return ts.visitEachChild(node, visit, context)
      }
      return ts.visitNode(rootNode, visit)
    }
  const transformedFile = ts.transform(ast, [transformer]).transformed[0]
  const printer = ts.createPrinter()
  return printer.printFile(transformedFile as any)
}
