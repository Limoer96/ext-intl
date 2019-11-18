import * as fs from "fs";
import * as path from "path";
import { findTextInTs, Text } from "./findChinese";
import { TAB } from "./const";
import { measureText, is } from "./utils";

let whiteListFileType = [".ts", ".tsx", ".js", ".jsx"];

/**
 *写入到文件
 *
 * @param {string[]} textArr 当前文件中文数组
 */
function writeFile(textArr: Text[], targetFilePath: string) {
  const { template, mode } = <IConfig>(
    global["intlConfig"]
  );
  if (textArr.length === 0) return;
  let textStr = textArr
    .map(
      text =>
        `${text.comment}\n${TAB}${text.key}: '${measureText(
          text.value,
          template
        )}',`
    )
    .join("\n");
  if (mode === 'sample') {
    textStr = "\n" + textStr;
  } else {
    textStr = "export default {\n" + textStr + "\n}"
  }
  const write = mode === 'sample' ? fs.appendFileSync : fs.writeFileSync
  try {
    write(targetFilePath, textStr)
  } catch (error) {
    console.log(error)
  }
}

function writeFileDepth(textArr: Text[], filename: string) {
  const { outputPath, rootPath } = <IConfig>global["intlConfig"]
  const fileRelativePath = filename.replace(rootPath, '').substring(1)
  const targetFilePath = path.resolve(outputPath, fileRelativePath)
  writeFile(textArr, targetFilePath)
}

interface IConfig {
  outputPath: string
  rootPath: string
  template: boolean
  extractOnly: boolean
  whiteList: string[]
  mode?: 'sample' | 'depth' // 模式类型 简单模式/深层次导出
}

function init(config: IConfig) {
  const { outputPath, whiteList, mode } = config;
  console.time("总计用时：");
  if (is(whiteList, "array") && whiteList.length > 0) {
    whiteListFileType = whiteList;
  }
  delete config.whiteList;
  global["intlConfig"] = config;
  if (mode === 'sample') {
    try {
      fs.writeFileSync(outputPath, "export default {");
    } catch (error) {
      console.log(`新建多语言文件${outputPath}失败！`);
    }
  } else {
    fs.mkdir(outputPath, err => {
      if(err && err.code !== 'EEXIST') {
        console.log(`创建多语言目录${outputPath}失败！`)
      }
    })
  }
}

/**
 *递归遍历文件并对中文进行抽取
 * @export
 * @param {string} pathName 遍历根路径
 * @param {string} outFilePath 输出路径
 */
function traverseDir(pathName: string, outputPath: string) {
  if (fs.statSync(pathName).isFile()) {
    if (!whiteListFileType.includes(path.extname(pathName))) return;
    const { mode } = <IConfig>global["intlConfig"]
    const text = fs.readFileSync(pathName).toString(); // buffer to string
    const result = findTextInTs(text, pathName);
    if (mode === 'sample') {
      writeFile(result, outputPath);
    } else {
      writeFileDepth(result, pathName)
    }
  } else {
    // 文件夹
    const files = fs.readdirSync(pathName);
    files.forEach(file => {
      const absPath = path.resolve(pathName, file);
      traverseDir(absPath, outputPath);
    });
  }
}

export function traverse(config: IConfig) {
  init(config);
  traverseDir(config.rootPath, config.outputPath);
  if (config.mode === 'sample') {
    fs.appendFileSync(config.outputPath, "\n}");
  }
  console.timeEnd("总计用时：");
}
