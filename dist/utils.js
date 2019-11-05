"use strict";
exports.__esModule = true;
var ts = require("typescript");
var path = require("path");
var fs = require("fs");
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
// 大写首字母
function upperCase(str, idx) {
    if (idx === 0) {
        return str;
    }
    else {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
// 依据文件路径生成key
// 若路径中包含src，则只截取src后面的路径生成key，否则全路径生成key
function genKey(filePath) {
    var _a = path.parse(filePath), name = _a.name, dir = _a.dir;
    var spliter = /[\/\\\\]/;
    dir = dir.replace(/.*:/, ''); // 去除windows下的盘符
    var paths = dir.split(spliter);
    var id = paths.indexOf('src');
    paths.splice(0, id + 1); //删除src以外所有路径
    paths.push(name);
    return paths.map(function (item, idx) { return upperCase(item, idx); }).join('');
}
exports.genKey = genKey;
/**
 * 批量文件替换
 * @param file 文件的字符串形式
 * @param replaceList 待替换的元素列表
 * @param filename 待写入文件路径
 */
function printToFile(file, replaceList, filename) {
    replaceList.sort(function (a, b) { return b.pos - a.pos; }); // 按照位置从大到小排序
    for (var _i = 0, replaceList_1 = replaceList; _i < replaceList_1.length; _i++) {
        var item = replaceList_1[_i];
        var pos = item.pos, end = item.end, text = item.text;
        file = file.substring(0, pos) + text + file.substring(end);
    }
    fs.writeFileSync(filename, file);
}
exports.printToFile = printToFile;
