import { getOutputPath, handle } from './common'
import * as fs from 'fs/promises'
import { OriginEntryItem } from '../interface'

/**
 * 读取本地词条文件
 * @returns
 */
export async function readEntryFile(): Promise<OriginEntryItem[]> {
  const entryFilePath = getOutputPath()
  const [data, error] = await handle<string>(fs.readFile(`${entryFilePath}/entries.json`, { encoding: 'utf-8' }))
  if (error && error.code !== 'ENOENT') {
    throw new Error(error.message || '读取词条文件失败')
  }
  return JSON.parse(data || '{}')
}
