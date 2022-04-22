import { ExtCustomConfig } from './interface'
import { createConfigFile, getMergedConfig, readConfigFile } from './utils/checkConfig'

/**
 * 检查配置的流程：
 * 1. 如果传入了config，则直接使用config以及默认配置合并
 * 2. 如果没有传入config，则会寻找本地配置文件
 * 3. 如果本地配置文件不存在，则会询问是否使用默认配置生成配置文件
 * 4. 读取读取传入config或者配置文件config，合并后返回
 */
async function checkConfig(config: ExtCustomConfig) {
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
    await createConfigFile()
    process.exit()
  } catch (error) {
    throw error
  }
}

export default checkConfig
