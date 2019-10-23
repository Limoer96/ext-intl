## Extract-Chinese

> 从`.ts`或`.tsx`文件中提取中文及中文模板

### 使用

```js
const ec = require('extract-chinese')
const path = require('path')
ec.traverse({
  rootPath: path.resolve(__dirname, 'src'),
  outputPath: path.resolve(__dirname, 'output.txt')
})
```