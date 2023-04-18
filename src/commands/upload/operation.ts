import * as promiseFs from 'fs/promises'
import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
import { ExtConfig } from '../config/interface'
import { flatten, get, isEmpty } from 'lodash'
import { UploadEntryType } from './types'
import pinyin from 'pinyin'
import { request, gql } from 'graphql-request'

const uploadGql = gql`
  mutation Mutation($appId: Int!, $entries: [UploadLocalEntryItem]!, $isCover: Boolean) {
    uploadLocalEntries(appId: $appId, entries: $entries, isCover: $isCover)
  }
`

/**
 * 递归遍历文件并对中文进行抽取
 * @export
 * @param {string} pathName 当前遍历路径
 */
export async function readMultipleLanguageEntry(pathName: string) {
  const obj = {}
  const { whiteList } = <ExtConfig>global['intlConfig']
  const isTraversal = whiteList.includes(path.extname(pathName))

  if (fs.statSync(pathName).isFile() && isTraversal) {
    const promiseText = await promiseFs.readFile(pathName)
    const entryObj = getEntriesInfo(promiseText.toString())
    if (entryObj) {
      return {
        ...entryObj,
      }
    }
  } else {
    // 文件夹
    const files = fs.readdirSync(pathName)
    for (let index = 0; index < files.length; index++) {
      const absPath = path.resolve(pathName, files[index])
      const entryObj = await readMultipleLanguageEntry(absPath)
      if (!isEmpty(entryObj)) {
        obj[files[index]] = entryObj
      }
    }
  }
  return obj
}

/**
 * 在源文件中获取词条信息
 * @export
 * @param {string} code 源代码
 */
export function getEntriesInfo(code: string) {
  let entryObj
  const ast = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TSX)

  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ObjectLiteralExpression:
        const { properties, parent } = <ts.ObjectLiteralExpression>node
        if (parent.kind === ts.SyntaxKind.ExportAssignment) {
          const propertyAssignment = properties.filter((property) => property.kind === ts.SyntaxKind.PropertyAssignment)
          if (propertyAssignment?.length > 0) {
            const entryInfo = propertyAssignment.reduce((pre, curr: ts.PropertyAssignment) => {
              const key = (curr.name as ts.Identifier).escapedText as string
              const value = curr.initializer.getText().replace(/'/g, '')
              return {
                ...pre,
                [key]: value,
              }
            }, {})
            entryObj = entryInfo
          }
        }
        break
    }
    if (node.getChildCount() > 0) {
      ts.forEachChild(node, visit)
    }
  }

  visit(ast)

  return entryObj
}

/**
 * 格式化词条信息
 * @export
 * @param  entryObj 本地读取的多语言词条信息
 */
export function formateEntryInfo(entryObj: Object) {
  const formattedEntryInfo: UploadEntryType[] = []
  const keyPath = []
  const { langs, langMapper } = <ExtConfig>global['intlConfig']

  /**
   * 格式化词条信息
   * @export
   * @param  entryObj 本地读取的词条信息
   * @param  cb 当entryObj不是对象时执行的回调
   */
  function loop(entryObjItem: Object) {
    if (typeof entryObjItem === 'object') {
      for (let entry in entryObjItem) {
        const isLanguageTag = langs.includes(entry)
        keyPath.push(isLanguageTag ? langs[0] : entry)
        loop(isLanguageTag ? entryObjItem[langs[0]] : entryObjItem[entry])
        keyPath.pop()
        if (isLanguageTag) {
          return
        }
      }
    } else {
      const newLangs = langs.reduce((pre, curr) => {
        return {
          ...pre,
          [langMapper[curr]]: getSingleEntry(entryObj, keyPath, curr),
        }
      }, {})
      const mainLangText = newLangs[langMapper[langs[0]]]
      const pinYinArr = pinyin(mainLangText, {
        style: 'tone2',
      })
      const pinYinStr = flatten(pinYinArr).join('_')
      if (formattedEntryInfo.findIndex((item) => item.key === pinYinStr) === -1) {
        formattedEntryInfo.push({
          key: pinYinStr,
          langs: newLangs,
          mainLang: langMapper[langs[0]],
          mainLangText: mainLangText,
        })
      }
    }
  }
  loop(entryObj)

  return formattedEntryInfo
}

/**
 * 获取单个词条的详细信息
 * @export
 * @param {string} entryObj 词条信息
 * @param {string[]} keyPath 路径
 * @param {string} lang 哪种语言
 */
export function getSingleEntry(entryObj: Object, keyPath: string[], lang: string) {
  const { langs } = <ExtConfig>global['intlConfig']
  const tempArray = [...keyPath]
  const index = keyPath.findIndex((item) => item === langs[0])

  tempArray.splice(index, 1, lang)

  return get(entryObj, tempArray)
}

/**
 * 获取单个词条的详细信息
 * @export
 * @param {UploadEntryType[]} entryInfo 上传的词条信息
 * @param {boolean} isCover 是否覆盖远程词库已经存在的词条
 */
export async function uploadEntryRequest(entryInfo: UploadEntryType[], isCover: boolean) {
  const res = await request('http://localhost:3000/graphql', uploadGql, {
    appId: 5,
    entries: entryInfo,
    isCover,
  })
  return res
}
