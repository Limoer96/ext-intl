#!/usr/bin/env node
const { Command } = require('commander')
const path = require('path')
const {
  sync,
  start,
  update,
  getMergedConfig,
  generateConfigFile,
  readConfigFile,
  checkConfig,
  extract,
} = require('./dist/index')

const program = new Command()

program.name('ext-intl').description('多语言脚本').version('3.2.0')

program
  .command('sync')
  .description('同步远程词库数据')
  .action(async () => {
    const localConfig = await readConfigFile()
    const config = getMergedConfig(localConfig)
    await sync(config.origin, config.accessKey)
  })
program
  .command('start')
  .description('开启一次完整的多语言提取')
  .option('-e, --env <char>', '运行环境', "BROWSER")
  .action(async (options) => {
    const config = await checkConfig()
    const isSyncSuccess = await sync(config.origin, config.accessKey)
    if (isSyncSuccess) {
      await start(config, options.env)
    }
  })
program
  .command('update')
  .description('同步远程词库数据并更新多本次词条')
  .action(async () => {
    const localConfig = await readConfigFile()
    const config = getMergedConfig(localConfig)
    const isSyncSuccess = await sync(config.origin, config.accessKey)
    if (isSyncSuccess) {
      await update(config.langs[0])
    }
  })
program
  .command('config')
  .description('配置脚本')
  .option('-o, --override', '覆盖当前已经存在的配置')
  .action(async (options) => {
    await generateConfigFile(options.override)
  })
program
  .command('extract')
  .description('上传本地词条至远程词库')
  .option('-c, --cover', '覆盖远程词库已经存在的词条', false)
  .option('-p, --path', '要上传词条的文件的绝对路径', path.resolve(process.cwd(), './src/i18n/langs'))
  .action(async (options) => {
    const config = await checkConfig()
    await extract(config, options.cover, options.path)
  })

program.parse()
