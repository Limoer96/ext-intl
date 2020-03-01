## ext-intl

> 基于`TypeScript AST APIs`，一个从React组件/js源文件中提取和替换中文词条的工具

### 功能

1. 指定目录，提取所有中文词条

2. 词条自动命名，基于文件路径和计数

3. 提取结果并输出到文件，如果有需要，可以生成词条模板方便进行国际化填充

4. 词条命名源文件替换(可选)

5. 可指定文件扫描白名单，更多功能见配置项

### 使用

1. `yarn add --dev ext-intl`
2. 根目录新建`js`文件，参考配置如下：
```js
const intl = require('ext-intl')
const path = require('path')

intl.traverse({
  outputPath: path.resolve(__dirname, 'output'), // 输出目录
  rootPath: path.resolve(__dirname, 'demo'), // 源文件目录
  template: false, // 是否生成词条模板
  extractOnly: false, // 是否只扫描文件(不进行替换)
  whileList: ['.ts', '.tsx'], // 文件白名单
  mode: 'depth', // 词条提取保存模式
  prefix: ["import i18n from '@/i18n';", "import intl from '@/i18n/utils';"], // 添加到源文件顶部的字符串，一般用于导入
  // 处理模板字符串替换
  templateString: {
    funcName: 'intl.get' // 指定替换函数名
  }
})

```

3. 在`node`环境中运行

> 特别注意，如需要词条模板，请先配置`{template: true, extractOnly: true}`生成，再进行操作；由于生成的模板和词条文件命名一致，请先保存。

`CLI`调用方式

```
Usage: extintl [options] [<absolute path>]
  -p, --config
    配置文件决定路径
  <absolute path>
    指定配置文件绝对路径
> extintl --config D:\www\fd1\fd\fd.config.js

配置文件示例：
const intl = require('ext-intl')
const path = require('path')

module.exports = {
  outputPath: path.resolve(__dirname, 'output'), // 输出目录
  rootPath: path.resolve(__dirname, 'demo'), // 源文件目录
  template: false, // 是否生成词条模板
  extractOnly: false, // 是否只扫描文件(不进行替换)
  whileList: ['.ts', '.tsx'], // 文件白名单
  mode: 'depth', // 词条提取保存模式
  prefix: ["import i18n from '@/i18n';", "import intl from '@/i18n/utils';"], // 添加到源文件顶部的字符串，一般用于导入
  // 处理模板字符串替换
  templateString: {
    funcName: 'intl.get' // 指定替换函数名
  }
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
  outputPath: string
  rootPath: string
  template: boolean
  extractOnly: boolean
  whiteList: string[]
  mode?: "sample" | "depth" // 模式类型 简单模式/深层次导出
  prefix?: string[]
  // 用于处理模板字符串的配置
  templateString?: {
    funcName: string
  }
}
```

### 配置项

参数 | 说明 | 类型
-|-|-|-
outputPath | 输出词条存储绝对路径，`mode`为`sample`时，指定为文件名，`depth`指定为目录 | `string`
rootPath | 源文件或源文件目录 | `string`
template | 是否生成词条模板 | `boolean`
extractOnly | 是否只扫描文件，并不进行替换 | `boolean`
whiteList | 文件类型白名单，指定只扫描文件类型，可过滤掉图片/字体等文件的干扰 | `string[]`
mode | 导出词条和模板文件的模式，`sample`模式下导出成为单一文件，`depth`模式下文件按照源文件目录结构导出 | `sample`/`depth`
prefix | 在替换模式下，需要添加到源文件顶部的内容，一般为导出等 | `string[]`
templateString.funcName | 处理模板字符串时，用于原处替换的函数名称 | `string`

### 示例

源文件内容：
```js
import * as React from 'react';
const Comp = () => {
    const name = '张san';
    const name1 = 'li四';
    const question = `你叫${name}对吗，我叫${name1}`;
    return (<div>
      <p>你好！</p>
      <p>{question}</p>
    </div>);
};
export default Comp;
```
使用最顶部的配置项，替换后的文件内容为：
```js
import i18n from '@/i18n';
import intl from '@/i18n/utils';
import * as React from 'react';
const Comp = () => {
    const name = i18n.WwwExtintlDemoIndex1;
    const name1 = i18n.WwwExtintlDemoIndex2;
    const question = intl.get(i18n.WwwExtintlDemoIndex3, { name: name, name1: name1 });
    return (<div>
      <p>{ i18n.WwwExtintlDemoIndex4 }</p>
      <p>{question}</p>
    </div>);
};
export default Comp;
```
词条文件为：
```js
export default {
/** 张san **/
 WwwExtintlDemoIndex1: '张san',
/** li四 **/
 WwwExtintlDemoIndex2: 'li四',
/**  `你叫${name}对吗，我叫${name1}` **/
 WwwExtintlDemoIndex3: ' 你叫{name}对吗，我叫{name1}',
/** 你好;
 **/
 WwwExtintlDemoIndex4: '你好',
}

```
### ChangeLog

[查看更新日志](./CHANGELOG.md)