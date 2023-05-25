import * as chalk from 'chalk'
import * as fs from 'fs/promises'
import { ExtConfig, ExtCustomConfig } from './interface'
import { CONFIG_FILE_NAME, INIT_CONFIG } from './constant'
import { getOutputPath, handle, isAndEmpty, log, resolvePath } from '../../utils/common'
import { formatFileWithConfig } from '../../utils/format'
import { diffConfig } from './utils'

/**
 * 生成配置文件
 */
export async function generateConfigFile(override = false) {
  try {
    await fs.access(resolvePath(CONFIG_FILE_NAME))
    if (!override) {
      log(chalk.red('[WARNING] 本地文件已存在'))
    } else {
      await writeConfigFile()
      log(chalk.green('[INFO] 配置文件生成成功, 请修改后再次运行'))
      process.exit()
    }
  } catch (error) {
    await writeConfigFile()
    log(chalk.green('[INFO] 配置文件生成成功, 请修改后再次运行'))
    process.exit()
  }
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
 * 写入配置文件
 */
export async function writeConfigFile() {
  await fs.writeFile(
    resolvePath(CONFIG_FILE_NAME),
    formatFileWithConfig(JSON.stringify(INIT_CONFIG), undefined, 'json-stringify')
  )
}

/**
 * 检查配置的流程：
 * 1. 如果传入了config，则直接使用config以及默认配置合并
 * 2. 如果没有传入config，则会寻找本地配置文件
 * 3. 如果本地配置文件不存在，则会询问是否使用默认配置生成配置文件
 * 4. 读取读取传入config或者配置文件config，合并后返回
 */
export async function checkConfig(config?: ExtCustomConfig) {
  const mergedConfig = getMergedConfig(config)
  if (mergedConfig) {
    return mergedConfig
  }
  try {
    const localConfig = await readConfigFile()
    const mergedConfig = getMergedConfig(localConfig)
    if (mergedConfig) {
      return mergedConfig
    }
    await generateConfigFile()
  } catch (error) {
    throw error
  }
}
