## ext-intl

> 一个从React组件中提取中文词条的工具

### 功能

1. 从指定的根目录开始提取所有中文词条

2. 对每个中文词条使用基于路径和下标的方式命名

3. 整合扫描到的词条结果并输出到文件，如果有需要，可以生成词条模板方便进行国际化

4. 使用生成的命名直接完成文件替换(暂无法替换模板字符串和其它复杂类型)

5. 可指定白名单文件类型只扫描改类文件

### 使用

```js
var extIntl = require('ext-intl')
var path = require('path');
extIntl.traverse({
  outputPath: path.resolve(__dirname, 'output.js'), // 输出文件
  rootPath: path.resolve(__dirname, 'testdir'), // 根目录
  template: false, // 是否生成词条模板
  extractOnly: true // 是否只扫描文件(不进行替换)
  whileList: ['.ts', '.tsx']
})
```
### API

```js
/**
 *  提取词条入口函数
 *  config {IConfig} 配置项
 */
function traverse(config){...}

interface IConfig {
  outputPath: string // 词条输出文件(绝对路径)
  rootPath: string // 根目录(绝对路径)
  template: boolean, // 是否生成语言模板
  extractOnly: boolean, // 是否只提取词条(false:将会替换源文件本身，慎用)
  whiteList: string[] // 白名单文件类型 默认为: ['.ts', '.tsx', '.js', '.jsx']
}

```