## ext-intl

> 一个从React组件中提取中文词条的工具

### 功能

1. 从指定的根目录开始提取所有中文词条

2. 对每个中文词条使用基于路径和计数的方式命名

3. 整合扫描到的词条结果并输出到文件，如果有需要，可以生成词条模板方便进行国际化

4. 使用生成的词条命名直接完成文件替换(暂无法替换模板字符串和其它复杂类型，该功能慎用)

5. 可指定白名单文件类型只扫描该类文件

### 实现思路

1. 从根目录开始递归提取词条；

2.  针对每个文件，读取文件字符串，并转换成`AST`，通过遍历`AST`找到所有的中文；

3.  直接修改中文对应的`AST`节点，并记录中文词条信息；

4.  将词条写入到文件，将更改后的`AST`写入到源文件。

### 使用

#### 使用步骤

1. 调用`traverse`方法并配置`{template: true, extractOnly: true}`导出词条模板，用于多语言填充
2. 配置`{template: false, extractOnly: true}`提取中文词条模板
3. 手动替换每个文件中的中文词条为自动生成的`key`，处理无法提取的词条

或
1. 同上第一步
2. 配置`{template: false, extractOnly: false}`提取中文词条模板同时原处修改词条
3. 手动处理无法翻译的词条(见控制台打印)

> 注：生成词条模板和中文词条是两个独立的过程，需要两次运行`traverse`；由于模板的文件命名和词条的文件命名一致，生成其中之一后需要另存，否则会被覆盖。导出词条模板时使用的是`extractOnly: true`*只扫描模式*；如果进行了原处替换，那么将无法提取词条模板，建议第一步先生成词条模板。

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
### ChangeLog

[查看更新日志](./CHANGELOG.md)