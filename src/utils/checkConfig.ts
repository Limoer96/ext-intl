import * as chalk from 'chalk'
import * as inquirer from 'inquirer'
import * as fs from 'fs/promises'
import { CONFIG_FILE_NAME, INIT_CONFIG } from '../constant'
import { ExtCustomConfig, ExtConfig } from '../interface'
import { getOutputPath, getVersionName, handle, isAndEmpty, log, resolvePath } from './common'
import { formatFileWithConfig } from './format'

function diffConfig(config: ExtCustomConfig) {
  const allKeys = Object.keys(INIT_CONFIG)
  const customConfigKeys = Object.keys(config)
  const diffResult = {}
  for (const key of allKeys) {
    if (!customConfigKeys.includes(key)) {
      diffResult[key] = INIT_CONFIG[key]
    }
  }
  return diffResult
}
/**
 * 获取合并后的配置
 * @param config
 * @returns
 */
export function getMergedConfig(config: ExtCustomConfig): ExtConfig {
  if (!config || isAndEmpty(config, 'object', (value) => Object.keys(value).length === 0)) {
    return null
  }
  const diffResult = diffConfig(config)
  if (Object.keys(diffResult).length) {
    log(`[WARNING] ${chalk.yellow('以下配置项未设置，将会使用默认配置')}`)
    log(`${chalk.yellow(JSON.stringify(diffResult, null, 2))}`)
  }
  return {
    ...INIT_CONFIG,
    ...config,
    outputPath: getOutputPath(),
    versionName: getVersionName(),
  }
}
/**
 * 读取本地配置文件
 * @returns
 */
export async function readConfigFile() {
  const [data, error] = await handle<string>(fs.readFile(resolvePath(CONFIG_FILE_NAME), { encoding: 'utf-8' }))
  if (error && error.code !== 'ENOENT') {
    throw new Error(error.message || '读取配置文件失败')
  }
  return JSON.parse(data || '{}')
}
/**
 * 创建配置文件
 */
export async function createConfigFile() {
  const question: inquirer.QuestionCollection = {
    type: 'confirm',
    name: 'addDefaultConfig',
    message:
      chalk.yellow('[WARNING] 未找到配置文件') + '\n\n' + '是否需要初始化配置文件: ' + chalk.bold(CONFIG_FILE_NAME),
    default: true,
  }
  try {
    const answer = await inquirer.prompt(question)
    if (!answer.addDefaultConfig) {
      console.log(chalk.red('[WARNING] 请手动添加运行所需的配置文件后继续'))
    }
    await fs.writeFile(
      resolvePath(CONFIG_FILE_NAME),
      formatFileWithConfig(JSON.stringify(INIT_CONFIG), undefined, 'json-stringify')
    )
    console.log(chalk.green('[INFO] 配置文件生成成功，请修改配置后再次运行此命令'))
  } catch (error) {
    throw new Error(error.message || '生成配置文件失败')
  }
}
