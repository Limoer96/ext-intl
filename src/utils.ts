import * as ts from 'typescript';
import * as path from 'path'
/**
 * 去掉文件中的注释
 * @param code
 * @param fileName
 */
export function removeFileComment(code: string, fileName: string) {
  const printer: ts.Printer = ts.createPrinter({ removeComments: true });
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    '',
    code,
    ts.ScriptTarget.ES2015,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  return printer.printFile(sourceFile);
}

export const BasePath = path.resolve(__dirname)