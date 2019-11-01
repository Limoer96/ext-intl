"use strict";
exports.__esModule = true;
var findChinese_1 = require("./findChinese");
var fs = require("fs");
var path = require("path");
var WHITE_LIST_FILE_TYPE = ['.ts', '.tsx', '.js', '.jsx'];
var TAB = ' ';
function measureText(text, template) {
    if (template)
        return '';
    var res = text.replace(/;/g, '').replace(/[\r\n]/g, '').replace(/\$/g, '').replace(/[`'"]/g, '');
    return res;
}
/**
 *写入到文件
 *
 * @param {*} filePath 当前遍历文件名(path+filename)
 * @param {string[]} textArr 当前文件中文数组
 * @param {string} targetFilePath 输出文件路径
 */
function writeFile(textArr, targetFilePath, template) {
    if (textArr.length === 0)
        return;
    var textStr = textArr.map(function (text) { return text.comment + "\n" + TAB + text.key + ": '" + measureText(text.value, template) + "',"; }).join('\n');
    textStr = '\n' + textStr;
    fs.appendFileSync(targetFilePath, textStr);
}
function init(config) {
    return new Promise(function (resolve, reject) {
        var outputPath = config.outputPath, whiteList = config.whiteList;
        if (whiteList) {
            WHITE_LIST_FILE_TYPE = whiteList;
        }
        try {
            // 初始化时新建或清空文件
            fs.writeFileSync(outputPath, 'export default {');
            console.time('总计用时：');
            resolve(config);
        }
        catch (error) {
            reject(error);
        }
    });
}
/**
 *递归遍历文件并对中文进行抽取
 * @export
 * @param {string} pathName 遍历根路径
 * @param {string} outFilePath 输出路径
 */
function traverseDir(pathName, outFilePath, template, extractOnly) {
    // 只对ts和tsx文件进行中文抽取
    if (fs.statSync(pathName).isFile()) {
        if (!WHITE_LIST_FILE_TYPE.includes(path.extname(pathName)))
            return;
        var text = fs.readFileSync(pathName).toString(); // buffer to string
        var result = findChinese_1.findTextInTs(text, pathName, extractOnly);
        writeFile(result, outFilePath, template);
    }
    else {
        // 是一个文件夹需要遍历
        var files = fs.readdirSync(pathName);
        files.forEach(function (file) {
            var absPath = path.resolve(pathName, file);
            traverseDir(absPath, outFilePath, template, extractOnly);
        });
    }
}
function traverse(config) {
    init(config)
        .then(function (conf) {
        traverseDir(conf.rootPath, conf.outputPath, conf.template, conf.extractOnly);
        fs.appendFileSync(conf.outputPath, '}');
        console.timeEnd('总计用时：');
    })["catch"](function (err) {
        console.log(err);
    });
}
exports.traverse = traverse;
