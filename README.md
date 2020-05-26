## ext-intl

> 基于`TypeScript AST APIs`，一个从 React 组件/js 源文件中提取和替换中文词条的工具

### 功能

1. 指定目录，提取所有中文词条(可指定扫描文件类型)

2. 词条自动命名，基于文件路径和计数

3. 提取结果并输出到文件，如果有需要，可以生成词条模板方便进行国际化填充

4. 词条命名源文件替换(支持模板字符串)

### 使用

1. `yarn add --dev ext-intl`
2. 根目录新建`xx.js`文件：

```js
const { intl } = require('ext-intl')
intl()
```

3. `node xx.js`

如果没有指定任何配置，将会生成/使用默认配置`.extintl.json`，默认配置如下：

```js
export const INIT_CONFIG: IConfig = {
  outputPath: resolvePath('./intl'), // 输出目录/文件名
  rootPath: resolvePath('./src'), // 入口目录/文件名
  template: false, // 是否生成可供填写的词条模板
  extractOnly: true, // 是否只进行词条扫描
  whiteList: ['.ts', '.tsx', '.js', '.jsx'], // 扫描文件白名单
  mode: 'depth', // 输出词条保存模式
  prefix: [], // 添加到源文件顶部的字符串，一般用于导入
  // 处理模板字符串替换
  templateString: {
    funcName: 'intl.get', // 指定替换函数名
  },
}
```

> Tips: `intl(config?: Iconfig)`函数支持传入配置直接运行，也可以在根目录中新建`.extintl.json`自定义配置。

> 特别注意，如需要词条模板，请先配置`{template: true, extractOnly: true}`生成，再进行后续词条生成；由于生成的模板和词条文件命名一致，请先保存。

#### `CLI`调用方式

1. `yarn add --dev ext-intl`
2. 在`package.json`中，`scripts`中配置如下：

```json
  {
    ...
    "scripts": {
      ...
      "intl": "extintl"
    }
  }
```

3. 运行`yarn intl`即可

> Tips: 也可以运行`yarn global add ext-intl`安装到全局，然后在根目录执行`extintl`即可，**不推荐这种方式！**

#### 使用`vs code`插件（推荐）

`ext-intl`已经支持`VS Code`插件，使用更简单方便。详情见[ext-intl(i18n Tool)](https://marketplace.visualstudio.com/items?itemName=limoer.ext-intl)

### API

```js
/**
 *  提取词条入口函数
 *  config {IConfig} 配置项
 */
function intl(config?: Iconfig){...}

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

| 参数                    | 说明                                                                                              | 类型             |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| outputPath              | 输出词条存储绝对路径，`mode`为`sample`时，指定为文件名，`depth`指定为目录                         | `string`         |
| rootPath                | 源文件或源文件目录                                                                                | `string`         |
| template                | 是否生成词条模板                                                                                  | `boolean`        |
| extractOnly             | 是否只扫描文件，并不进行替换                                                                      | `boolean`        |
| whiteList               | 文件类型白名单，指定只扫描文件类型，可过滤掉图片/字体等文件的干扰                                 | `string[]`       |
| mode                    | 导出词条和模板文件的模式，`sample`模式下导出成为单一文件，`depth`模式下文件按照源文件目录结构导出 | `sample`/`depth` |
| prefix                  | 在替换模式下，需要添加到源文件顶部的内容，一般为导出等                                            | `string[]`       |
| templateString.funcName | 处理模板字符串时，用于原处替换的函数名称                                                          | `string`         |

### 示例

源文件内容：

```js
import * as React from 'react'
const Comp = () => {
  const name = '张san'
  const name1 = 'li四'
  const question = `你叫${name}对吗，我叫${name1}`
  return (
    <div>
      <p>你好！</p>
      <p>{question}</p>
    </div>
  )
}
export default Comp
```

替换后的文件内容为：

```js
import i18n from '@/i18n'
import intl from '@/i18n/utils'
import * as React from 'react'
const Comp = () => {
  const name = i18n.WwwExtintlDemoIndex1
  const name1 = i18n.WwwExtintlDemoIndex2
  const question = intl.get(i18n.WwwExtintlDemoIndex3, { name: name, name1: name1 })
  return (
    <div>
      <p>{i18n.WwwExtintlDemoIndex4}</p>
      <p>{question}</p>
    </div>
  )
}
export default Comp
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
