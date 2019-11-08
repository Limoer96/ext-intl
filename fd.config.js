const path = require('path')
module.exports = {
  rootPath: path.resolve(__dirname, 'testdir'), // 遍历根目录
  outputPath: path.resolve(__dirname, 'output.js'),
  template: true, // 是否生成词条模板
  extractOnly: false, // 是否只提取词条
  whiteList: ['.ts', '.tsx', '.js', '.jsx'] // 白名单文件类型
}
