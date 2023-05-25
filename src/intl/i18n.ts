function getI18nTemplateString(langs: string[]) {
  const langMapStringList = ['const langs = {\n']
  const importLines = ["import kiwiIntl from 'kiwi-intl';\n"]
  importLines.push(`import { ${langs.map((lang) => lang.toUpperCase()).join(',')} } from './langs';\n`)
  importLines.push(`import { IAPI, LangEnum } from './typing'`)
  for (const lang of langs) {
    const langName = lang.toUpperCase()
    langMapStringList.push(`[LangEnum.${langName}]: ${langName},\n`)
  }
  langMapStringList.push('};\n')
  const returnd = `
    ${importLines.join('')}
    ${langMapStringList.join('')}
    export type Langs = typeof ZH & IAPI
    const I18N = kiwiIntl.init(LangEnum.ZH, langs) as Langs
    I18N.currentLang = LangEnum.ZH
    I18N.setLangHandle = (lang: LangEnum) => {
      I18N.currentLang = lang
      I18N.setLang(lang)
    }
    export default I18N
  `
  return returnd
}

export default getI18nTemplateString
