## ext-intl

> 基于`TypeScript AST APIs`，**零**配置国际化工具

### 功能

1. 提取指定目录下的所有中文词条

2. 词条自动命名，基于文件路径和计数，支持词条原处替换(可选)

3. 按源目录结构生成词条文件

4. 集成[kiwi-intl](https://github.com/alibaba/kiwi/tree/master/kiwi-intl)

### 使用

#### 基本使用

1. `yarn add --dev ext-intl`
2. 新建`xx.js`，写入如下代码：

```js
const { intl } = require('ext-intl')
const config = {...}
intl(config)
```

3. 项目根目录下运行`node xx.js`

#### CLI 使用方式（强烈推荐）

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
  outputPath: string // 已废弃，设置后不起作用，默认'resolvePath('./i18n')'
  rootPath: string
  extractOnly: boolean
  whiteList: string[]
  prefix?: string[]
  // 用于处理模板字符串的配置
  templateString?: {
    funcName: string
  }
}
```

### 配置项

| 参数                               | 说明                                                              | 类型       |
| ---------------------------------- | ----------------------------------------------------------------- | ---------- |
| outputPath(已废弃，兼容原因未删除) |                                                                   | `string`   |
| rootPath                           | 源文件或源文件目录                                                | `string`   |
| extractOnly                        | 是否只扫描文件，并不进行替换                                      | `boolean`  |
| whiteList                          | 文件类型白名单，指定只扫描文件类型，可过滤掉图片/字体等文件的干扰 | `string[]` |
| prefix                             | 在替换模式下，需要添加到源文件顶部的内容，一般为导出等            | `string[]` |
| templateString.funcName            | 处理模板字符串时，用于原处替换的函数名称                          | `string`   |

参数默认值如下：

```js
export const DEFAULT_CONFIG: IConfig = {
  outputPath: resolvePath('./i18n'),
  rootPath: resolvePath('./src'),
  langs: ['zh-CN', 'en-US'],
  extractOnly: true,
  whiteList: ['.ts', '.tsx', '.js', '.jsx'],
  prefix: [],
  templateString: {
    funcName: 'kiwiIntl.get',
  },
}
```

### 示例

初始目录结构：

![初始结构](https://ae01.alicdn.com/kf/H4e563770ffb245c7882cab09f3647a04K.jpg)

运行流程：

![运行流程](https://s1.ax1x.com/2020/07/08/UVylQO.gif)
![运行结果](https://s1.ax1x.com/2020/07/08/UVyhlT.gif)

完成后结构：

![完成结构](https://s1.ax1x.com/2020/07/08/UV6tuF.png)

源文件内容：

```js
import React from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  const name = '张珊'
  const alias = 'limoer'
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{欢迎页面}</p>
        <p>{name}</p>
        <p>{`你好${alias}，再见`}</p>
      </header>
    </div>
  )
}

export default App
```

替换后的文件内容为：

```js
import kiwiIntl, { langMap } from './i18n'
import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'
function App() {
  const name = kiwiIntl.App.App1
  const alias = 'limoer'
  // 以下切换多语言为手动添加
  const [_, forceUpdate] = useState()
  function handleChangeLang() {
    kiwiIntl.setLang(langMap['en-US'])
    forceUpdate({})
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{kiwiIntl.App.App2}</p>
        <p>{name}</p>
        <p>{kiwiIntl.get(kiwiIntl.App.App3, { alias: alias })}</p>
        <button onClick={handleChangeLang}>english</button>
      </header>
    </div>
  )
}
export default App
```

词条文件为：

```js
export default {
  // 张珊
  App1: '张珊',
  // 欢迎页面;
  App2: '欢迎页面',
  // `你好${alias}，再见`
  App3: '你好{alias}，再见',
}
```

### ChangeLog

[查看更新日志](./CHANGELOG.md)

<style>
  img {
    max-width: 600px;
    height: auto;
  }
</style>
