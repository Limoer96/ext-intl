#!/usr/bin/env node
const { Command } = require('commander')
const { intl } = require('./dist/index')
const { generateConfigFile, readConfigFile, getMergedConfig, checkConfig } = require('./dist/commands/config')
const { sync } = require('./dist/commands/sync')
const { start } = require('./dist/commands/generate')
const { update } = require('./dist/commands/update')

const program = new Command()

program.name('ext-intl').description('多语言脚本').version('3.0.0')

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
  .action(async () => {
    const config = await checkConfig()
    await sync(config.origin, config.accessKey)
    await start(config)
  })
program
  .command('update')
  .description('同步远程词库数据并更新多本次词条')
  .action(async () => {
    const localConfig = await readConfigFile()
    const config = getMergedConfig(localConfig)
    await sync(config.origin, config.accessKey)
    await update(config.langs[0])
  })
program
  .command('config')
  .description('配置脚本')
  .option('-o, --override', '覆盖当前已经存在的配置')
  .action(async (options) => {
    await generateConfigFile(options.override)
  })

program.parse()
