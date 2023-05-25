## ext-intl

> 基于`TypeScript AST APIs`，**零**配置国际化工具

### 功能

1. 提取指定目录下的所有中文词条，支持上传到远程词库平台（v3.0.0 及以上版本）

2. 支持词条原处替换(可选)

3. 按源目录结构生成多语言词条文件

4. 集成[kiwi-intl](https://github.com/alibaba/kiwi/tree/master/kiwi-intl)（可选）

5. 可多次运行，增量提取（需要 v2.1.0 及以上版本）

6. 和词库平台联动，自动填充非中文词条/词条翻译更新

### 使用

> 注意：若未使用多语言词库平台，请使用`v2.1.x`版本

#### API 调用

1. `yarn add --dev ext-intl`
2. 新建`xx.js`：

```js
const {
  sync,
  start,
  update,
  generateConfigFile,
  readConfigFile,
  checkConfig,
  extract
} = require('ext-intl')
const config = {...}
// 生成配置文件
generateConfigFile(true)
// 读取配置文件
readConfigFile()
// 检测配置文件，如果存在，直接返回，否则将会在本地生成
checkConfig({...initConfig})
  .then(conf => {
    console.log(conf)
  })
// 同步远程词条数据
sync(config.origin, config.accessKey)
// 开启一次完成的提取
start(config)
// 进行一次本次词条更新
update(config.langs[0])
// 提取本地词条，上传至词条库
extract(config,false,'')
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
      "intl:config": "extintl config -o",
      "intl:sync": "extintl sync",
      "intl:start": "extintl start",
      "intl:update": "extintl update",
      "intl:extract": "extintl extract"
    }
  }
```

3. 运行`yarn intl:xx`即可

### API

```js
/**
 * 同步远程词条并写入到本地
 * @param origin 远程地址
 * @param accessKey 配置的应用访问key
 * @returns
 */
function sync(origin: string, accessKey: string): Promise<void>;

/**
 * 开启一次完整的词条提取
 * @param config 配置
 * @returns
 */
function start(config: ExtConfig): Promise<void>;

/**
 * 更新本地已经维护好的词条信息
 * @param mainLangType 多语言环境下的主要语言（不需要翻译）
 */
function update(mainLangType: string): Promise<void>;

/**
 * 提取本地词条上传至词条库
 * @param config 配置
 * @param cover 是否覆盖远程词库已经存在的词条
 * @param path 要提取的词条的绝对路径
 * @returns
 */
function extract(config:ExtConfig, cover:boolean, path:string):Promise<void>

/**
 * 检查配置的流程：
 * 1. 如果传入了config，则直接使用config以及默认配置合并
 * 2. 如果没有传入config，则会寻找本地配置文件
 * 3. 如果本地配置文件不存在，则会询问是否使用默认配置生成配置文件
 * 4. 读取读取传入config或者配置文件config，合并后返回
 */
function checkConfig(config: ExtCustomConfig): Promise<ExtConfig>;
```

### 配置项

| 参数                               | 说明                                                                                       | 类型       |
| ---------------------------------- | ------------------------------------------------------------------------------------------ | ---------- |
| outputPath(已废弃，兼容原因未删除) |                                                                                            | `string`   |
| rootPath                           | 源文件或源文件目录                                                                         | `string`   |
| extractOnly                        | 是否只扫描文件，并不进行替换，如果设置为`false`，则会进行源文件替换，且集成`kiwi-intl`     | `boolean`  |
| whiteList                          | 文件类型白名单，指定只扫描文件类型，可过滤掉图片/字体等文件的干扰                          | `string[]` |
| templateString.funcName            | 处理模板字符串时，用于原处替换的函数名称                                                   | `string`   |
| fieldPrefix                        | 生成字段命名时，使用的前前缀字符串，字段命名规则为{prefix}\_{index}，默认值：`intl`        | `string`   |
| versionName                        | 当次运行的版本，内部自动维护，请不要手动传入，命名规则 v{index}｜`string`                  |
| origin                             | 词库平台的 OpenAPI 地址（graphql 实现）                                                    | `string`   |
| accessKey                          | 词库平台应用的访问权限 key                                                                 | `string`   |
| langMapper                         | 语言映射（key 作为当前多语言脚本语言，value 作词库平台支持语言）｜`Record<string, string>` |

参数默认值如下：

```js
export const DEFAULT_CONFIG: IConfig = {
  outputPath: resolvePath('./i18n'),
  rootPath: resolvePath('./src'),
  langs: ['zh', 'en'],
  extractOnly: true,
  whiteList: ['.ts', '.tsx', '.js', '.jsx'],
  templateString: {
    funcName: 'kiwiIntl.get',
  },
  origin: '',
  accessKey: '',
}
```

### 一般使用步骤

#### 首次运行

1. 运行`yarn intl:config`生成配置文件，并修改
2. 运行`yarn intl:start` 并在`extractOnly: true`模式下提取中文词条，提取完成后，根据提示上传至词库平台
3. 在词库平台上维护相关词条，维护完成后，再次运行`yarn intl:start`进行一次完整的提取，至此，多语言提取和替换工作完毕
4. 和首次运行类似，**增量提取**可以不用执行步骤*1*生成配置文件

#### 更新多语言词条翻译

1. 在词库平台上完成对词条多语言的更新维护（请注意不要修改词条 key）
2. 运行`yarn intl:update`同步词条到本地，并进行词条翻译的更新

### 已知问题

> ⚠️ 推荐使用`extractOnly`模式，只生成多语言文件，不修改源代码；如果使用一键替换源代码，即`extractOnly=false`，请做好版本管理，以免造成不可逆的丢失。

1. 不支持某些复杂模板字符串的提取
2. 部分代码格式化异常（需要额外的格式化）

### ChangeLog

[查看更新日志](./CHANGELOG.md)
