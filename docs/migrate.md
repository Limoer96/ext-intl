### 迁移至`v2.2.0`

#### `v2.2.0`的更改

- 多语言文件存放目录从`/i18n`迁移至`/src/i18n/langs`
- 集成了完整的基于`kiwi-intl`的更新逻辑，替换的字符串从`kiwiIntl.vx.path.intl_x`变成了`I18N.vx.path.intl_x`，并引入了位于`src/i18n/context.tsx`文件下的`useI18n`hooks

#### 迁移步骤

1. 在`src`目录下新建`i18n`目录和`langs`目录

2. 如果你使用的是`v2.1.0`以前版本，在`i18n/langs`目录下创建`v1`目录，拷贝原有的所有多语言文件至改目录；如果使用的目录是`v2.1.x`，则保留版本直接拷贝所有的多语言文件至`src/i18n/langs`

3. 在根文件引入`I18NContextWrapper`

```jsx
<I18NContextWrapper>
  <PortalProvider>
    <AppComp />
  </PortalProvider>
</I18NContextWrapper>
```

4. 手动修改之前替换的文件

```jsx
// 1. 引入useI18n hooks
import { useI18n } from '@/i18n/context'
// 2. 获取I18N实例
const { I18N } = useI18n()
// 3. 替换
// odd
const text = kiwiIntl.v3.login.index.intl_1,
// new
const text = I18N.v3.login.index.intl_1,
```

5. 因为多语言更新逻辑依赖于本地存储，例如在 web 中使用`localStorage`在`RN`中使用`async-storage`，因此需要自行实现一个`Storage`，至少包含`get()`和`set()`，如果不需要多语言的前端持久化，可以删除相关逻辑，见`@/i18n/context`

6. 生成文件时使用了`alias`，如果你的项目中尚未使用，请进行相关修改，例如在`RN`环境下，需要进行以下配置

```ts
// babel.config.js
alias: {
  '@': './src',
}
// tsconfig.json
"paths": {
  "@/*": ["./*"]
}
```
