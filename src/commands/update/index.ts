import { resolvePath } from '../../utils/common'
import * as fs from 'fs/promises'
import * as path from 'path'
import { traverseDir } from './traverse'
import { readEntryFile } from '../../utils/readEntryFile'
/**
 * 更新本地已经维护好的词条信息
 */
export async function update(mainLangType: string) {
  const entries = await readEntryFile()
  global['local_entries'] = entries
  const langRootPath = resolvePath('./src/i18n/langs')
  const stat = await fs.stat(langRootPath)
  if (stat.isDirectory()) {
    const versionRoot = await fs.readdir(langRootPath)
    if (!versionRoot.length) {
      return
    }
    for (const f of versionRoot) {
      const absPath = path.resolve(langRootPath, f)
      const fStat = await fs.stat(absPath)
      if (!fStat.isDirectory()) {
        continue
      }
      const langTypeDirNameList = await fs.readdir(absPath)
      for (const langType of langTypeDirNameList) {
        if (langType !== mainLangType) {
          traverseDir(langType, path.resolve(absPath, langType), langType)
        }
      }
    }
  }
}
