"use strict";
exports.__esModule = true;
var ts = require("typescript");
var path = require("path");
/**
 * 去掉文件中的注释
 * @param code
 * @param fileName
 */
function removeFileComment(code, fileName) {
    var printer = ts.createPrinter({ removeComments: true });
    var sourceFile = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    return printer.printFile(sourceFile);
}
exports.removeFileComment = removeFileComment;
exports.BasePath = path.resolve(__dirname);
