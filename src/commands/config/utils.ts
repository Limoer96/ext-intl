import { INIT_CONFIG } from './constant'
import { ExtCustomConfig } from './interface'

export function diffConfig(config: ExtCustomConfig) {
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
