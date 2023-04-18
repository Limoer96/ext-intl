export interface UploadEntryType {
  key: string
  langs: {
    [key: string]: string
  }
  mainLang: string
  mainLangText: string
}
