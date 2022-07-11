import checkConfig from './checkConfig'
import * as chalk from 'chalk'
import * as fs from 'fs/promises'
import { traverseDir } from './traverse'
import writeI18nTemplateFile from './intl'
import writeTotalExportEntry from './utils/writeTotalExportEntry'
import { ExtCustomConfig } from './interface'
export { sync } from './commands/sync'
export { start } from './commands/generate'
export { checkConfig } from './commands/config'

export async function intl(config?: ExtCustomConfig) {
  // try {
  const conf = await checkConfig(config)
  global['intlConfig'] = conf
  const { outputPath, versionName, langs, rootPath } = conf
  console.log('[INFO] 开始提取...')
  console.time('[INFO] 提取用时')
  try {
    await fs.mkdir(outputPath)
    for (const lang of langs) {
      await fs.mkdir(`${outputPath}/langs/${versionName}/${lang}`, { recursive: true })
    }
  } catch (error) {
    const code = error.code
    if (code && code !== 'EEXIST') {
      throw error
    }
  }
  traverseDir(rootPath)
  writeTotalExportEntry()
  if (!conf.extractOnly) {
    writeI18nTemplateFile()
  }
  console.timeEnd('[INFO] 提取用时')
  // } catch (error) {
  //   console.log(chalk.red('[ERROR]: ', error))
  //   process.exit(1)
  // }
}
