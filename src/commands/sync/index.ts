import { request, gql } from 'graphql-request'
import * as chalk from 'chalk'
import { getOutputPath, log, mkRootDirIfNeeded } from '../../utils/common'
import { OriginEntryItem } from '../../interface'
import * as fs from 'fs/promises'
import { formatFileWithConfig } from '../../utils/format'

const syncDoc = gql`
  query GetAllEntries($accessKey: String!) {
    getAllEntries(accessKey: $accessKey) {
      key
      langs
      mainLang
      mainLangText
    }
  }
`

const extractGql = gql`
  mutation ExtractLocalEntries($accessKey: String!, $entries: [ExtractLocalEntryItem]!, $isCover: Boolean) {
    extractLocalEntries(accessKey: $accessKey, entries: $entries, isCover: $isCover)
  }
`

const postDoc = gql`
  mutation UploadEntries($entries: [UploadEntryItem]!, $accessKey: String) {
    uploadEntries(entries: $entries, accessKey: $accessKey)
  }
`

/**
 * 同步远程词条并写入到本地
 * @param origin 远程地址
 * @param accessKey 配置的应用访问key
 * @returns
 */
export async function sync(origin: string, accessKey: string) {
  if (!accessKey || !origin) {
    log(chalk.red('请检查配置文件，确保origin/accessKey正确配置'))
    return false
  }
  const res = await request(origin, syncDoc, { accessKey })
  const data: OriginEntryItem[] = res.getAllEntries || []
  const rootDir = getOutputPath()
  await mkRootDirIfNeeded()
  await fs.writeFile(`${rootDir}/entries.json`, formatFileWithConfig(JSON.stringify(data), undefined, 'json-stringify'))
  log(chalk.green('远程词条获取完毕'))
  return true
}

export type UploadEntryItem = {
  key?: string
  langs?: any
}

export interface UploadConfig {
  origin: string
  accessKey: string
  entries: UploadEntryItem[]
}

export async function upload({ origin, accessKey, entries }: UploadConfig) {
  if (!accessKey || !origin) {
    log(chalk.red('请检查配置文件，确保origin/accessKey正确配置'))
    return
  }
  if (!entries || !entries.length) {
    log(chalk.yellow('无可上传的词条'))
    return
  }
  await request(origin, extractGql, { accessKey, entries })
  log(chalk.green('词条已推送至远程'))
}
