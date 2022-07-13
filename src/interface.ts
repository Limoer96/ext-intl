export interface ReplacementItem {
  pos: number
  end: number
  text: string | number
}

export interface OriginEntryItem {
  key: string
  mainLang: string
  mainLangText: string
  langs: any
}
