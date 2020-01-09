# 使用TypeScript Compiler APIs

> 一个进行中或完成的`React`项目如果要进行国际化，那么第一步需要从源码中提取中文词条，这往往是一个体力活，并且有无法找到所有的中文词条的风险。我们可以开发工具来代替人工提取，简单点可以使用基于字符串和正则表达式查找就可以完成，这种方式有一个很大问题：中文词条的提取效率取决于你正则表达式有多强大，并且如果后续有词条替换的需求，实现起来相对复杂。下面要介绍另一种方式，从`String -> AST -> String`的方式，这里我使用了`TS Compiler API`。

## 认识`Compiler APIs`

`TS`早在*2.x*版本就提供了一系列的`API`来更好的操作`TypeScript AST`，利用这些API，可以很方便的编写插件来影响`TS`编译过程，当然这些`API`也可以单独使用。关于`AST`这里并不做过多介绍，推荐一篇文章：[深入Babel，这一篇就够了](https://blog.csdn.net/weixin_34119545/article/details/91371156)，以`Babel`举例，详细描述了`Babel`编译(转译)的过程，以及如何编写`Babel`插件，`TS`的工作流程和`Babel`某种程度上是相似的。

下面介绍几个常用的`API`。

### `createSourceFile`

```js
function createSourceFile(fileName: string, sourceText: string, languageVersion: ScriptTarget, setParentNodes?: boolean, scriptKind: ScriptKind): SourceFile;
```
该方法接受源代码(文件名/字符串)并返回`SourceFile`，那`SourceFile`是否就是`AST`呢？再看`SourceFile`的定义：
```js
interface SourceFile extends Declaration {
    kind: SyntaxKind.SourceFile;
    statements: NodeArray<Statement>;
    endOfFileToken: Token<SyntaxKind.EndOfFileToken>;
    fileName: string;
    text: string;
    ...
}
```
通过查看`SourceFile`的定义，我们可以把`SourceFile`当做是`TypeScript`的`AST`，其中`statements`属性是源代码语句的数组，`Statement`也就是`AST`中的节点(`Node`)。

好了，如果我们有一份使用`TS`的`React`源代码，对于每个`.tsx`文件而言，使用下面的方式就可以得到`AST`了。
```js
const ast = ts.createSourceFile('', codeString, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX)
```
### Printer

使用`createSourceFile`可以将源代码转成`SourceFile`，那么`Printer`就是把`SourceFile/Node`转成字符串的`APIs`，其常用的几个`API`如下：
```js
function createPrinter(printerOptions?: PrinterOptions, handlers?: PrintHandlers): Printer;
interface Printer {
  printFile(sourceFile: SourceFile): string;
  printNode(hint: EmitHint, node: Node, sourceFile: SourceFile): string;
}
```
* `createPrinter`返回一个`Printer`实例，该实例可使用既定的`printerOptions`对`Node`和`SourceFile`进行打印(生成字符串形式)
* `printFile`依据`SourceFile`打印字符串源码，不进行任何转换
* `printNode`打印节点

```js
  const sourceFile: ts.SourceFile = 
    ts.createSourceFile('test.ts', '', ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
  // printFile
  const printer = ts.createPrinter()
  console.log(printer.printFile(sourceFile)) // test.ts源码
  // printNode
  const node = ts.createAdd(ts.createLiteral(1), ts.createLiteral(2))
  console.log(printer.printNode(ts.EmitHint.Expression, node, sourceFile)); // 1 + 2
  // note: `printNode`第三个参数其实和打印节点无直接关系
```
### transform
```js
function transform<T extends Node>(source: T | T[], transformers: TransformerFactory<T>[], compilerOptions?: CompilerOptions): TransformationResult<T>;
```
生成`AST`后就要开始处理了，`ts`也提供了一系列的`API`用于遍历`AST`，`forEachChild`和`visitEachChild`都可以遍历`AST`，初次之外`visitEachChild`还可以修改节点，并返回修改后节点。

```js
function visitEachChild<T extends Node>(node: T, visitor: Visitor, context: TransformationContext): T;
function forEachChild<T>(node: Node, cbNode: (node: Node) => T | undefined, cbNodes?: (nodes: NodeArray<Node>) => T | undefined): T | undefined;
```

`transform`方法就和其字面意思一样，使用该方法可以转换`AST`。它接收多个`transformer`，最简单的`transformer`可以是下面这样：
```js
const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
  function visit(node: T) {
    console.log(node.kind)
    return ts.visitEachChild(node, visit, context)
  }
  return ts.visitNode(rootNode, visit)
}
```
上面的`transformer`访问了每个节点，并且打印出当前访问节点的`kind`。

下面再写一个比较实际的`transformer`，找到所有的中文字符串节点，并使用变量来替换该节点。

```js
const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
  function visit(node: T) {
    if (node.kind === ts.SyntaxKind.StringLiteral && node.text.match(/[^\x00-\xff]/g)) {
      return ts.createIdentifier('placeholder')
    }
    return ts.visitEachChild(node, visit, context)
  }
  return ts.visitNode(rootNode, visit)
}
```
使用上面的`transformer`，`var name = '张三'`将会被转换成`var name = placeholder`，文件中所有的`StringLiteral`节点中只要包含中文都会被转成指定的`Identifier`。

`TS`还提供了`create*`和`update*`多个`API`用于创建和更新节点，当对`compiler API`更加了解后，我们就可以做更多的事，例如`var total = 1 + 2` 变成`var t = 3`类似的代码压缩，自定义lint规则等等。

## `Compiler APIs`的应用

基于`Compiler APIs`实现了一款React国际化工具 [ext-intl](https://github.com/xiaomoer/ext-intl)，实现了`React`项目词条提取、词条key生成、代码原处替换等功能。该工具目前是可用的，一定程度上可以提升`React`项目国际化效率。

使用方式：

```bash
$ yarn add --dev ext-intl
```

完。