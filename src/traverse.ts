import * as fs from "fs";
import * as path from "path";
import { findTextInTs, Text } from "./findChinese";
import { TAB } from "./const";
import { measureText, is } from "./utils";

let whiteListFileType = [".ts", ".tsx", ".js", ".jsx"];

/**
 *写入到文件
 *
 * @param {*} filePath 当前遍历文件名(path+filename)
 * @param {string[]} textArr 当前文件中文数组
 * @param {string} targetFilePath 输出文件路径
 * @param {boolean} template 是否生成模板
 */
function writeFile(textArr: Text[]) {
  const { outputPath: targetFilePath, template } = <IConfig>(
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
  textStr = "\n" + textStr;
  fs.appendFileSync(targetFilePath, textStr);
}

interface IConfig {
  outputPath: string;
  rootPath: string;
  template: boolean;
  extractOnly: boolean;
  whiteList: string[];
}

function init(config: IConfig) {
  const { outputPath, whiteList } = config;
  console.time("总计用时：");
  if (is(whiteList, "array") && whiteList.length > 0) {
    whiteListFileType = whiteList;
  }
  delete config.whiteList;
  global["intlConfig"] = config;
  try {
    fs.writeFileSync(outputPath, "export default {");
  } catch (error) {
    console.log(`新建多语言文件${outputPath}失败！`);
  }
}

/**
 *递归遍历文件并对中文进行抽取
 * @export
 * @param {string} pathName 遍历根路径
 * @param {string} outFilePath 输出路径
 */
function traverseDir(pathName: string) {
  if (fs.statSync(pathName).isFile()) {
    if (!whiteListFileType.includes(path.extname(pathName))) return;
    const text = fs.readFileSync(pathName).toString(); // buffer to string
    const result = findTextInTs(text, pathName);
    writeFile(result);
  } else {
    // 文件夹
    const files = fs.readdirSync(pathName);
    files.forEach(file => {
      const absPath = path.resolve(pathName, file);
      traverseDir(absPath);
    });
  }
}

export function traverse(config: IConfig) {
  init(config);
  traverseDir(config.rootPath);
  fs.appendFileSync(config.outputPath, "\n}");
  console.timeEnd("总计用时：");
}
