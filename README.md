## ext-intl

> 一个从React组件中提取中文词条的工具

### 功能

1. 从指定的根目录开始提取所有中文词条

2. 对每个中文词条使用基于路径和下标的方式命名

3. 整合扫描到的词条结果并输出到文件，如果有需要，可以生成词条模板方便进行国际化

4. 使用生成的词条命名直接完成文件替换(暂无法替换模板字符串和其它复杂类型，该功能慎用)

5. 可指定白名单文件类型只扫描该类文件

### 实现思路

1. 从根目录开始递归提取词条；

2.  针对每个文件，读取文件字符串，并转换成`AST`，通过遍历`AST`找到所有的中文；

3. 如果需要直接使用`key`替换源文件，则需要储存额外的中文位置信息，待统一替换；

4.  将词条写入到文件。

### 使用

#### API
```js
var extIntl = require('ext-intl')
var path = require('path');
extIntl.traverse({
  outputPath: path.resolve(__dirname, 'output.js'), // 输出文件
  rootPath: path.resolve(__dirname, 'testdir'), // 根目录
  template: false, // 是否生成词条模板
  extractOnly: true // 是否只扫描文件(不进行替换)
  whileList: ['.ts', '.tsx'],
  mode: 'depth',
  prefix: "import i18n from '@/i18n';\n"
})
```

#### CLI
```
Usage: extintl [options] [<absolute path>]
  -p, --config
    配置文件决定路径
  <absolute path>
    指定配置文件绝对路径
> extintl --config D:\www\fd1\fd\fd.config.js

配置文件示例：
const path = require('path')
module.exports = {
  rootPath: path.resolve(__dirname, 'testdir'), // 遍历根目录
  outputPath: path.resolve(__dirname, 'i18n'), // 指定输入的目录
  template: true, // 是否生成词条模板
  extractOnly: false, // 是否只提取词条
  whiteList: ['.ts', '.tsx', '.js', '.jsx'] // 白名单文件类型
  mode: 'depth',
  prefix: "import i18n from '@/i18n';\n"
}
```
### API

```js
/**
 *  提取词条入口函数
 *  config {IConfig} 配置项
 */
function traverse(config){...}

interface IConfig {
  outputPath: string // 词条输出文件/目录(绝对路径)
  rootPath: string // 根目录(绝对路径)
  template: boolean // 是否生成语言模板
  extractOnly: boolean // 是否只提取词条(false:将会替换源文件本身，慎用)
  whiteList?: string[] // 白名单文件类型 默认为: ['.ts', '.tsx', '.js', '.jsx']
  mode?: "sample" | "depth" // 模式类型 简单模式(导出成单个文件)/深层次导出(按照源码层级导出到不同文件)
  prefix?: string // 原处修改时一般用于添加`import`语句等
}
```