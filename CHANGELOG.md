### 1.2.0

1. 新增两种多语言文件词条输出方式`mode: 'sample' | 'depth'`，`sample`模式把所有词条输出到一个多语言文件中，`depth`模式下，会根据传入的`rootPath`和`outputPath`，自动创建`i18n`目录，并分源文件层级输出多语言文件到该目录中。

2. 新增`prefix`属性用于在原处修改源文件时输入字符串，一般用于在文件顶部导入相关的模块，该属性只有在开启*原处修改*(`extractOnly: false`)才会生效。

### 1.3.0

1. 使用`rollup`重新打包
2. 修复了`depth`模式下由于文件夹不存在而失败的问题

### 1.3.1

- 修复了 cli 报错的问题

### 1.3.2

- 修复了`{template: true, extractOnly: false}`导出语言模板后内容被替换无法再次提取的问题

### 1.4.0

- 使用`ts transformer`API 替换先前版本字符串替换的方式

### 1.4.1

- 修复了文件目录可能存在`-`符号，导致生成的`key`不符合规则的问题
- 移除对不可处理的模板字符串的词条统计

### 1.5.0

- 基于[react-intl-universal](https://www.npmjs.com/package/react-intl-universal)关于包含*变量*词条(模板字符串)的写法方式，新增模板字符串原地替换，举例：

```js
const message = `你好${visitor}，我是${name}`;
// 将被替换成
const message = intl.get(key, { visitor, name });
// 需要注意的是，`intl.get`将由配置`templateString.funcName`指定，可以根据项目不同选择封装适合的函数
```

- 考虑到多个可能的导入，`prefix`配置变成`string[]`，支持传入多个字符串

### 1.5.1

- 构建时生成对应的`.d.ts`文件，修复编译`ts`可能出错的问题
- 使用`prettier`格式化生成代码
