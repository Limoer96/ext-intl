import * as chalk from 'chalk'
import * as fs from 'fs/promises'
import { traverseDir } from './traverse'
import writeI18nTemplateFile from '../../intl'
import writeTotalExportEntry from './writeTotalExportEntry'
import { ExtConfig } from '../config/interface'
import { mkRootDirIfNeeded, removeDuplicatedText } from '../../utils/common'
import { readEntryFile } from '../../utils/readEntryFile'
import { Text } from '../../transformer/transformChinese'
import { uploadAction } from '../sync/uploadAction'

export async function start(config: ExtConfig, envCarrier: 'WEB' | 'APP') {
  try {
    global['intlConfig'] = config
    const entries = await readEntryFile()
    global['local_entries'] = entries
    const { outputPath, versionName, langs, rootPath, origin, accessKey, extractOnly } = config
    console.log('[INFO] 开始提取...')
    console.time('[INFO] 提取用时')
    const unMatchedList: Text[] = []
    // 1. 创建多语言根目录&此次提取的词条目录
    try {
      await mkRootDirIfNeeded()
      if (!extractOnly) {
        for (const lang of langs) {
          await fs.mkdir(`${outputPath}/langs/${versionName}/${lang}`, { recursive: true })
        }
      }
    } catch (error) {
      const code = error.code
      if (code && code !== 'EEXIST') {
        throw error
      }
    }
    // 2. 遍历文件（提取词条/写入多语言模版等）
    traverseDir(rootPath, (entries) => {
      unMatchedList.push(...removeDuplicatedText(unMatchedList, entries))
    })
    if (!extractOnly) {
      // 3. 写入词条入口文件
      writeTotalExportEntry()
    }
    // 4. 如果是非提取模式，写入基于kiwi-intl的模版文件
    if (!config.extractOnly) {
      writeI18nTemplateFile(envCarrier)
    }
    console.timeEnd('[INFO] 提取用时')
    await uploadAction({ origin, accessKey, unMatchedList })
  } catch (error) {
    console.log(chalk.red('[ERROR]: ', error))
  }
}
