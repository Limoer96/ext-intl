import { findTextInTs, Text } from "./findChinese";
import * as fs from "fs";
import * as path from "path";

let WHITE_LIST_FILE_TYPE = ['.ts', '.tsx', '.js', '.jsx']
const TAB = ' '

function measureText(text: string, template: boolean) {
  if(template) return ''
  const res = text.replace(/;/g, '').replace(/[\r\n]/g, '').replace(/\$/g, '').replace(/[`'"]/g, '')
  return res
}

/**
 *写入到文件
 *
 * @param {*} filePath 当前遍历文件名(path+filename)
 * @param {string[]} textArr 当前文件中文数组
 * @param {string} targetFilePath 输出文件路径
 */
function writeFile(textArr: Text[], targetFilePath: string, template: boolean) {
  if(textArr.length === 0) return
  let textStr = textArr.map(text => `${text.comment}\n${TAB}${text.key}: '${measureText(text.value, template)}',`).join('\n')
  textStr = '\n' + textStr
  fs.appendFileSync(targetFilePath, textStr);
}

interface IConfig {
  outputPath: string
  rootPath: string
  template: boolean,
  extractOnly: boolean,
  whiteList: string[]
}

function init(config: IConfig) {
  return new Promise((resolve, reject) => {
    const { outputPath, whiteList } = config
    if(whiteList) {
      WHITE_LIST_FILE_TYPE = whiteList
    }
    try {
      // 初始化时新建或清空文件
      fs.writeFileSync(outputPath, 'export default {')
      console.time('总计用时：')
      resolve(config)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 *递归遍历文件并对中文进行抽取
 * @export
 * @param {string} pathName 遍历根路径
 * @param {string} outFilePath 输出路径
 */
function traverseDir(pathName: string, outFilePath: string, template: boolean, extractOnly: boolean) {
  // 只对ts和tsx文件进行中文抽取
  if (fs.statSync(pathName).isFile()) {
    if(!WHITE_LIST_FILE_TYPE.includes(path.extname(pathName))) return
    const text = fs.readFileSync(pathName).toString(); // buffer to string
    const result = findTextInTs(text, pathName, extractOnly);
    writeFile(result, outFilePath, template);
  } else {
    // 是一个文件夹需要遍历
    const files = fs.readdirSync(pathName);
    files.forEach(file => {
      const absPath = path.resolve(pathName, file);
      traverseDir(absPath, outFilePath, template, extractOnly);
    });
  }
}

export function traverse(config: IConfig) {
  init(config)
    .then((conf: IConfig) => {
      traverseDir(conf.rootPath, conf.outputPath, conf.template, conf.extractOnly)
      fs.appendFileSync(conf.outputPath, '}')
      console.timeEnd('总计用时：')
    })
    .catch(err => {
      console.log(err)
    })
}
