## 关于国际化的一些想法

> 一个已经开发完成`React`应用国际化一般分为三个步骤：

1. 选择合适的国际化方案并引入到项目
2. 提取项目中需要国际化的词条
3. 替换源码中的原词条

第一步不难，已经有很多成熟的解决方案，比如[react-intl](https://www.npmjs.com/package/react-intl)，[kiwi-intl](https://github.com/alibaba/kiwi)。

第二步的繁琐程度往往取决于应用的大小，词条较少可以手动提取，并给词条设置一个唯一的`key`（视情况而定）。如果词条很多，提取词条需要花费大量人力，还可能遗漏词条。这时往往需要工具来进行词条提取的操作。

### 词条提取（基于正则匹配）

提取词条（例如提取中文）就是从文件中找出所有中文词条，所以此类工具可以完全基于文件操作来做：将每一个文件读入，并使用**正则表达式**来匹配中文，最后返回词条即可。这种基于文件操作的方案可靠程度完全取决于**正则表达式**，因为需要考虑源码中的干扰因素，例如：*单行注释*，*多行注释*等等，还要考虑中文词条出现的位置：

```js
const arr = ['中文词条0'] //变量
func('中文词条1') //函数调用
<FormItem lable="中文词条2" /> // JSX属性
<Desc>中文词条3</Desc> // JSX元素
const str = `${name}你好！` // 模板字符串
```
上面列举了部分可能出现中文词条的情况，再加上需要排除干扰因素，使用**正则表达式**来匹配词条是非常复杂的。在不考虑性能的前提下，一般情况下词条匹配的成功率不高。

提取到词条后，需要把词条写入`可用`的语言文件，这时就需要给每个词条添加一个`key`。关于如何生成`key`我们实践出了两套方案：

> 提取词条后先翻译，为每个词条生成key，在生成多语言文件时通过接口请求或者使用本地词条数据匹配，找到`key`并填充词条输出成直接`可用`的多语言文件。

这种情况存在一个明显的问题：提取词条后需要先翻译并生成词条数据后才能生成多语言文件，存在明显的先后关系。使用这种方式最好建立一个多语言平台，方便多语言翻译的维护。优点：`key`由后端（或翻译时指定）生成，可以解决词条冗余问题，更新方便。如果词条翻译需要更新，直接通过多语言平台（或修改多语言数据）修改，再重新生成多语言文件即可。

> 提取词条时直接生成`key`，并同时生成可用的中文多语言文件以及多语言模板，后续只需要将翻译填写到多语言模板即可。

这种方案的关键是如何生成`key`，比如我们可以采取文件路径加累计计数的方式生成`key`，这种方式生成的key可能会存在词条冗余的情况(同一个中文词条不同位置会被当作两个词条)，好处是通过`key`很容易定位词条位置。生成的`key`可能是这样的：`WwwFd1FdTestdirXxx2`。

既然使用基于**正则匹配**的方法提取词条如此复杂，下面介绍一种更简单可靠的方法。

### 词条提取（基于AST）
> 简单来说就是：读取文件，转成`AST`，再对`AST`进行遍历，提取中文。

如何将源码转成`AST`有很多现成的工具和库，这里以`TypeScript`提供的方法为例。

#### 第一步：读取文件为字符串
```js
const text = fs.readFileSync(pathName).toString(); // buffer to string
```
#### 第二步：调用`ts.createSourceFile`创建`AST`

```js
  const ast = ts.createSourceFile('', text, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX)
```
注：第一个参数`filename`

#### 第三步：遍历`AST`
```js
ts.forEachChild(ast, visit)
```
调用`forEachChild`此次遍历`AST`中的每个节点，第二个参数`visit`是对每个节点处理的具体的逻辑

#### 第四步：提取中文
```js
function visit(node: ts.Node) {
    switch(node.kind) {
      case ts.SyntaxKind.StringLiteral: {
        const { text, pos, end } = node as ts.StringLiteral;
        if (text.match(DOUBLE_BYTE_REGEX)) {
          if (!extractOnly) {
            const parentNodeKind = node.parent.kind;
            replacementList.push({
              pos,
              end,
              text:
                parentNodeKind === ts.SyntaxKind.JsxAttribute
                  ? `{I18N.${key}${index}}`
                  : `I18N.${key}${index}`
            });
          }
          matches.push({
            key: `${key}${index}`,
            value: text,
            comment: `/** ${text} **/`
          });
          index += 1;
        }
        break;
      }
      ... // 其他情况略
    }
    ts.forEachChild(node, visit)
  }
```
`ts.SyntaxKind`定义了数百种语法类型，这里以`StringLiteral`(字符串字面值)为例，对于所有该类型的节点，对其`text`属性进行中文正则匹配，提取词条。

### 原处替换

一般来说，提取词条和词条原处替换是一起进行的。

接上节，如果需要原处替换，则需要进一步判断，字符串是存在`CallExpression`中还是`JsxAttribute`中，这里有两种方式：

1. 第一种是更新节点，可以直接调用`ts.update*`来更新（这种方式没目前尝试），`AST`遍历完成后通过`ts.createPrinter`将`AST`转成字符串再写入到文件；

2. 另一种则是保存词条的位置和将要替换成的文本，当`AST`遍历完后再通过字符串替换的方式替换。
   
关于第二种方式，我们需要记录词条的位置，也就是`node`的`pos`和`end`，这里的位置和文件读取成字符串的位置是一致的，所以我们可以这样写：

```js
file.substring(0, pos) + text + file.substring(end)
```
这样就完成了一个词条的原处替换。但需要注意的是，因为我们并没有改变`AST`，所以修改文件字符串后可能会导致位置不对应的做法，更好的方式是保存每个词条的位置，待`AST`遍历完后再**从后往前**替换。
```js
export function printToFile(file: string, replaceList: ReplacementItem[], filename: string) {
  replaceList.sort((a, b) => b.pos - a.pos) // 按照位置从大到小排序
  for(const item of replaceList) {
    const { pos, end, text } = item
    file = file.substring(0, pos) + text + file.substring(end)
  }
  fs.writeFileSync(filename, file)
}
```

### 其它

基于上面的想法，开发了一个专门用于提取中文词条的工具[ext-intl](https://www.npmjs.com/package/ext-intl)，基本能够完成词条提取，生成单一语言文件，原处替换。

目前还存在的一些问题：

* 拼接字符串， `'总计：' + count + '元'`会被识别成多个单独的字符串
* 模板字符串，由于模板字符串的替换因使用的国际化方案不同，目前暂时不支持原处替换
* 提取的词条可能会丢失部分标点符号

