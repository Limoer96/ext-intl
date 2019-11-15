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
 * @param {*} filePath 当前遍历文件名(path+filename)
 * @param {string[]} textArr 当前文件中文数组
 * @param {string} targetFilePath 输出文件路径
 * @param {boolean} template 是否生成模板
 */
function writeFile(textArr) {
    var _a = (global["intlConfig"]), targetFilePath = _a.outputPath, template = _a.template;
    if (textArr.length === 0)
        return;
    var textStr = textArr
        .map(function (text) {
        return text.comment + "\n" + const_1.TAB + text.key + ": '" + utils_1.measureText(text.value, template) + "',";
    })
        .join("\n");
    textStr = "\n" + textStr;
    fs.appendFileSync(targetFilePath, textStr);
}
function init(config) {
    var outputPath = config.outputPath, whiteList = config.whiteList;
    console.time("总计用时：");
    if (utils_1.is(whiteList, "array") && whiteList.length > 0) {
        whiteListFileType = whiteList;
    }
    delete config.whiteList;
    global["intlConfig"] = config;
    try {
        fs.writeFileSync(outputPath, "export default {");
    }
    catch (error) {
        console.log("\u65B0\u5EFA\u591A\u8BED\u8A00\u6587\u4EF6" + outputPath + "\u5931\u8D25\uFF01");
    }
}
/**
 *递归遍历文件并对中文进行抽取
 * @export
 * @param {string} pathName 遍历根路径
 * @param {string} outFilePath 输出路径
 */
function traverseDir(pathName) {
    if (fs.statSync(pathName).isFile()) {
        if (!whiteListFileType.includes(path.extname(pathName)))
            return;
        var text = fs.readFileSync(pathName).toString(); // buffer to string
        var result = findChinese_1.findTextInTs(text, pathName);
        writeFile(result);
    }
    else {
        // 文件夹
        var files = fs.readdirSync(pathName);
        files.forEach(function (file) {
            var absPath = path.resolve(pathName, file);
            traverseDir(absPath);
        });
    }
}
function traverse(config) {
    init(config);
    traverseDir(config.rootPath);
    fs.appendFileSync(config.outputPath, "\n}");
    console.timeEnd("总计用时：");
}
exports.traverse = traverse;
