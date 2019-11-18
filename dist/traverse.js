"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var findChinese_1 = require("./findChinese");
var const_1 = require("./const");
var utils_1 = require("./utils");
var whiteListFileType = [".ts", ".tsx", ".js", ".jsx"];
/**
 *写入到文件
 *
 * @param {string[]} textArr 当前文件中文数组
 */
function writeFile(textArr, targetFilePath) {
    var _a = (global["intlConfig"]), template = _a.template, mode = _a.mode;
    if (textArr.length === 0)
        return;
    var textStr = textArr
        .map(function (text) {
        return text.comment + "\n" + const_1.TAB + text.key + ": '" + utils_1.measureText(text.value, template) + "',";
    })
        .join("\n");
    if (mode === 'sample') {
        textStr = "\n" + textStr;
    }
    else {
        textStr = "export default {\n" + textStr + "\n}";
    }
    var write = mode === 'sample' ? fs.appendFileSync : fs.writeFileSync;
    try {
        write(targetFilePath, textStr);
    }
    catch (error) {
        console.log(error);
    }
}
function writeFileDepth(textArr, filename) {
    var _a = global["intlConfig"], outputPath = _a.outputPath, rootPath = _a.rootPath;
    var fileRelativePath = filename.replace(rootPath, '').substring(1);
    var targetFilePath = path.resolve(outputPath, fileRelativePath);
    writeFile(textArr, targetFilePath);
}
function init(config) {
    var outputPath = config.outputPath, whiteList = config.whiteList, mode = config.mode;
    console.time("总计用时：");
    if (utils_1.is(whiteList, "array") && whiteList.length > 0) {
        whiteListFileType = whiteList;
    }
    delete config.whiteList;
    global["intlConfig"] = config;
    if (mode === 'sample') {
        try {
            fs.writeFileSync(outputPath, "export default {");
        }
        catch (error) {
            console.log("\u65B0\u5EFA\u591A\u8BED\u8A00\u6587\u4EF6" + outputPath + "\u5931\u8D25\uFF01");
        }
    }
    else {
        fs.mkdir(outputPath, function (err) {
            if (err && err.code !== 'EEXIST') {
                console.log("\u521B\u5EFA\u591A\u8BED\u8A00\u76EE\u5F55" + outputPath + "\u5931\u8D25\uFF01");
            }
        });
    }
}
/**
 *递归遍历文件并对中文进行抽取
 * @export
 * @param {string} pathName 遍历根路径
 * @param {string} outFilePath 输出路径
 */
function traverseDir(pathName, outputPath) {
    if (fs.statSync(pathName).isFile()) {
        if (!whiteListFileType.includes(path.extname(pathName)))
            return;
        var mode = global["intlConfig"].mode;
        var text = fs.readFileSync(pathName).toString(); // buffer to string
        var result = findChinese_1.findTextInTs(text, pathName);
        if (mode === 'sample') {
            writeFile(result, outputPath);
        }
        else {
            writeFileDepth(result, pathName);
        }
    }
    else {
        // 文件夹
        var files = fs.readdirSync(pathName);
        files.forEach(function (file) {
            var absPath = path.resolve(pathName, file);
            traverseDir(absPath, outputPath);
        });
    }
}
function traverse(config) {
    init(config);
    traverseDir(config.rootPath, config.outputPath);
    if (config.mode === 'sample') {
        fs.appendFileSync(config.outputPath, "\n}");
    }
    console.timeEnd("总计用时：");
}
exports.traverse = traverse;
