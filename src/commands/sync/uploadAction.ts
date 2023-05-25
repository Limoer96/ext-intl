import * as inquirer from 'inquirer'
import * as chalk from 'chalk'
import { Text } from '../../transformer/transformChinese'
import { log } from '../../utils/common'
import { upload, UploadConfig, UploadEntryItem } from './index'
import { ExtConfig } from '../config/interface'

interface UploadActionConfig extends Omit<UploadConfig, 'entries'> {
  unMatchedList: Text[]
}

export async function uploadAction(config: UploadActionConfig) {
  const { langs } = <ExtConfig>global['intlConfig']
  const mainLang = langs[0]
  if (config.unMatchedList && config.unMatchedList.length > 0) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldUpload',
        message: '检测到有未翻译的词条，是否推送至远程',
      },
    ])
    if (answer.shouldUpload) {
      const entries: UploadEntryItem[] = config.unMatchedList.map((item) => ({
        langs: {
          [mainLang]: item.value,
        },
        mainLang,
        mainLangText: item.value,
        key: item.key,
      }))

      await upload({ origin: config.origin, accessKey: config.accessKey, entries })
      log(chalk.green(`已成功推送${config.unMatchedList.length}个词条`))
    }
  }
}
