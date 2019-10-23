"use strict";
exports.__esModule = true;
var ts = require("typescript");
var utils_1 = require("./utils");
var path = require('path');
var shortid = require('shortid');
var DOUBLE_BYTE_REGEX = /[^\x00-\xff]/g;
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
function genKey(filePath) {
    var keyPrefix = path.parse(filePath);
    var name = keyPrefix.name;
    var paths = keyPrefix.dir.split('\\');
    var id = paths.indexOf('src');
    paths.splice(0, id + 1);
    paths.push(name);
    return paths.map(function (item, idx) { return upperCase(item, idx); }).join('');
}
// see from https://github.com/alibaba/kiwi/blob/master/kiwi-linter/src/findChineseText.ts
function findTextInTs(code, fileName) {
    var matches = [];
    var ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX);
    var key = genKey(fileName);
    var index = 1;
    function visit(node) {
        switch (node.kind) {
            case ts.SyntaxKind.StringLiteral: {
                var text = node.text;
                if (text.match(DOUBLE_BYTE_REGEX)) {
                    matches.push({
                        key: "" + key + index++,
                        value: text,
                        comment: "/** " + text + " **/"
                    });
                }
                break;
            }
            case ts.SyntaxKind.JsxElement: {
                var children = node.children;
                children.forEach(function (child) {
                    if (child.kind === ts.SyntaxKind.JsxText) {
                        var text = child.getText();
                        var noCommentText = utils_1.removeFileComment(text, fileName);
                        if (noCommentText.match(DOUBLE_BYTE_REGEX)) {
                            matches.push({
                                key: "" + key + index++,
                                value: noCommentText,
                                comment: "/** " + noCommentText + " **/"
                            });
                        }
                    }
                });
                break;
            }
            case ts.SyntaxKind.TemplateExpression: {
                var pos = node.pos, end = node.end;
                var templateContent = code.slice(pos, end);
                if (templateContent.match(DOUBLE_BYTE_REGEX)) {
                    matches.push({
                        key: "" + key + index++,
                        value: templateContent,
                        comment: "/** " + templateContent + " **/"
                    });
                }
            }
        }
        ts.forEachChild(node, visit);
    }
    ts.forEachChild(ast, visit);
    return matches;
}
exports.findTextInTs = findTextInTs;
