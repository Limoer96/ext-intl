import * as fs from 'fs'
import * as promiseFs from 'fs/promises'
import * as chalk from 'chalk'
import * as ChildProcess from 'child_process'
import getI18nTemplateString from './i18n'
import getTypingTemplateString from './typing'
import getContextTemplate from './context'
import { formatFileWithConfig } from '../utils/format'
import { ExtConfig, OperatingEnvEnum } from '../commands/config/interface'
import appStorageTemplate from './app-storage'
import webStorageTemplate from './web-storage'
import { resolvePath } from '../utils/common'
import { APP_DEPENDENCIES, WEB_DEPENDENCIES } from '../constant'
import { DependenciesType } from '../interface'
/**
 * 写入i18n模版文件
 */
async function writeI18nTemplateFile() {
  const { outputPath, langs, operatingEnv } = <ExtConfig>global['intlConfig']
  const isNative = operatingEnv === OperatingEnvEnum.NATIVE

  // 获取模板文件内容
  const i18nStr = getI18nTemplateString(langs)
  const typingStr = getTypingTemplateString(langs)
  const contextStr = getContextTemplate(isNative)
  const storageTemplate = isNative ? appStorageTemplate : webStorageTemplate

  try {
    // 下载依赖项
    await downloadAllDependencies(isNative ? APP_DEPENDENCIES : WEB_DEPENDENCIES)
  } catch (error) {}

  // 写入模版文件
  writeFileIfNotExisted(`${outputPath}/storage.ts`, storageTemplate)
  writeFileIfNotExisted(`${outputPath}/index.ts`, i18nStr)
  writeFileIfNotExisted(`${outputPath}/typing.ts`, typingStr)
  writeFileIfNotExisted(`${outputPath}/context.tsx`, contextStr)
}

/**
 * 写入单个文件，如果文件不存在的话
 */
function writeFileIfNotExisted(filePath: string, content: string) {
  if (fs.existsSync(filePath)) {
    console.log(chalk.yellow(`[WARNING] 多语言模版: ${filePath} 已存在，跳过写入.`))
    return
  }
  try {
    fs.writeFileSync(filePath, formatFileWithConfig(content))
  } catch (error) {
    console.log(chalk.red(`[ERROR] 写入多语言模版失败: ${error.message}`))
  }
}

/**
 * 下载依赖包
 */
async function downloadAllDependencies({ dependencies, devDependencies }: DependenciesType) {
  if (dependencies.length > 0 || devDependencies.length > 0) {
    const packagePath = resolvePath('package.json')
    const res = await promiseFs.readFile(packagePath, 'utf8')
    const obj = JSON.parse(res)
    const dependenciesArray = dependencies.filter((item) => !obj?.['dependencies']?.[item])
    const devDependenciesArray = devDependencies.filter((item) => obj?.['devDependencies']?.[item])

    if (dependenciesArray.length > 0) {
      await execDownload(dependenciesArray, '')
    }
    if (devDependenciesArray.length > 0) {
      await execDownload(devDependenciesArray, '--dev')
    }

    return Promise.resolve()
  }

  return Promise.resolve()
}

/**
 * 执行下载
 */
function execDownload(packageArr: string[], modifier: string) {
  return new Promise((resolve) => {
    const packageStr = packageArr.join(' ')
    console.log(chalk.green(`[INFO] 开始下载${packageStr}`))
    const child = ChildProcess.exec(
      `yarn add ${packageStr} ${modifier}`,
      {
        timeout: 30000,
      },
      (childErr) => {
        if (!childErr) {
          console.log(chalk.green(`[INFO] ${packageStr}下载成功`))
        } else {
          console.log(chalk.red(`[ERROR] ${packageStr}下载失败，请重新下载`))
        }
        resolve('')
      }
    )
    child.stdout.on('data', (data) => {
      console.log(data)
    })
    child.stderr.on('data', (err) => {
      console.log(err)
    })
  })
}

export default writeI18nTemplateFile
