"use strict";
exports.__esModule = true;
var ts = require("typescript");
var utils_1 = require("./utils");
var path = require('path');
var fs = require('fs');
var os = require('os');
var DOUBLE_BYTE_REGEX = /[^\x00-\xff]/g;
// see from https://github.com/alibaba/kiwi/blob/master/kiwi-linter/src/findChineseText.ts
function findTextInTs(code, fileName, extractOnly) {
    var matches = [];
    var replacementList = [];
    var codeString = code;
    var ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX);
    var key = utils_1.genKey(fileName);
    var index = 1;
    function visit(node) {
        switch (node.kind) {
            case ts.SyntaxKind.StringLiteral: {
                var _a = node, text = _a.text, pos = _a.pos, end = _a.end;
                if (text.match(DOUBLE_BYTE_REGEX)) {
                    if (!extractOnly) {
                        var parentNodeKind = node.parent.kind;
                        if (parentNodeKind === ts.SyntaxKind.CallExpression) {
                            // 192 CallExpression 函数调用
                            replacementList.push({
                                pos: pos,
                                end: end,
                                text: "I18N." + key + index
                            });
                        }
                        else if (parentNodeKind === ts.SyntaxKind.JsxAttribute) {
                            // 268 JsxAttribute JSX属性
                            replacementList.push({
                                pos: pos,
                                end: end,
                                text: "{I18N." + key + index + "}"
                            });
                        }
                        else {
                            // 其他类型例如赋值等，直接替换
                            replacementList.push({
                                pos: pos,
                                end: end,
                                text: "I18N." + key + index
                            });
                        }
                    }
                    matches.push({
                        key: "" + key + index,
                        value: text,
                        comment: "/** " + text + " **/"
                    });
                    index += 1;
                }
                break;
            }
            case ts.SyntaxKind.JsxElement: {
                var children = node.children;
                children.forEach(function (child) {
                    if (child.kind === ts.SyntaxKind.JsxText) {
                        var text = child.getText();
                        var pos = child.pos, end = child.end;
                        var noCommentText = utils_1.removeFileComment(text, fileName);
                        if (noCommentText.match(DOUBLE_BYTE_REGEX)) {
                            if (!extractOnly) {
                                replacementList.push({
                                    pos: pos,
                                    end: end,
                                    text: "{ I18N." + key + index + " }"
                                });
                                // noCommentText = noCommentText.trim()
                                // noCommentText = noCommentText.slice(0, -1)
                                // codeString = codeString.replace(noCommentText, `{ I18N.${key}${index} }`)
                            }
                            matches.push({
                                key: "" + key + index,
                                value: noCommentText,
                                comment: "/** " + noCommentText + " **/"
                            });
                            index += 1;
                        }
                    }
                });
                break;
            }
            case ts.SyntaxKind.TemplateExpression: {
                var pos = node.pos, end = node.end;
                var templateContent = code.slice(pos, end);
                console.log(fileName + " " + templateContent + " \u65E0\u6CD5\u5904\u7406");
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
    // codeString = `import i18n from '@/i18n';\n` + codeString // 通过字符串拼接的方式写入，通过配置的方式拼接
    // fs.writeFileSync(fileName, codeString)
    utils_1.printToFile(codeString, replacementList, fileName);
    return matches;
}
exports.findTextInTs = findTextInTs;
