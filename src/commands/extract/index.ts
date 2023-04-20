import * as chalk from 'chalk'
import { ExtConfig } from '../config/interface'
import { formateEntryInfo, readMultipleLanguageEntry, extractEntryRequest } from './operation'

export async function extract(config: ExtConfig, cover: boolean = false, path: string) {
  try {
    global['intlConfig'] = config
    // 1. 读取项目中已有的多语言
    try {
      console.time('读取用时')
      const entryInfo = await readMultipleLanguageEntry(path)
      console.timeEnd('读取用时')
      const uploadPayload = formateEntryInfo(entryInfo)

      console.time('上传用时')
      const res = await extractEntryRequest(uploadPayload, cover)
      if (res.uploadLocalEntries) {
        console.timeEnd('上传用时')
        console.log('上传成功')
      }
    } catch (error) {
      const code = error.code
      console.log('error', error.message)

      if (code && code !== 'EEXIST') {
        throw error
      }
    }
  } catch (error) {
    console.log(chalk.red('[ERROR]: ', error))
  }
}
