import { IConfig, INIT_CONFIG, CONFIG_FILE_NAME } from '../constant'
import { is } from '../utils/common'
import * as fs from 'fs'
import { resolvePath } from './common'
import * as chalk from 'chalk'
import * as inquirer from 'inquirer'
import * as prettier from 'prettier'

function isAndEmpty(value: any, type: string, check: (value: any) => boolean) {
  return is(value, type) && check(value)
}

function checkNoNullConfig(config: IConfig) {
  if (!config || isAndEmpty(config, 'object', (value) => Object.keys(value).length === 0)) {
    return null
  }
  console.log(`[WARNING] ${chalk.yellow('Unconfigured items will use the default configuration')}`)
  return {
    ...INIT_CONFIG,
    ...config,
  }
}

function checkConfig(config: IConfig) {
  return new Promise((resolve, reject) => {
    let fConfig = checkNoNullConfig(config)
    if (!fConfig) {
      fs.readFile(resolvePath(CONFIG_FILE_NAME), { encoding: 'utf-8' }, (err, data) => {
        if (err && err.code !== 'ENOENT') {
          reject(err.message)
        }
        data = data ? data : '{}'
        fConfig = checkNoNullConfig(JSON.parse(data))
        if (!fConfig) {
          // 用户决定是否创建
          const question: inquirer.QuestionCollection = {
            type: 'confirm',
            name: 'addDefaultConfig',
            message:
              chalk.yellow('[WARNING] Could not find configuration file.') +
              '\n\n' +
              'would you want to add default at: ' +
              chalk.bold(CONFIG_FILE_NAME),
            default: true,
          }
          inquirer.prompt(question).then((answer) => {
            if (!answer.addDefaultConfig) {
              console.log(
                chalk.red(
                  '[WARNING] The operation of the tool requires related configuration. Please configure the necessary configuration before continuing.'
                )
              )
              process.exit(1)
            }
            fs.writeFileSync(
              resolvePath(CONFIG_FILE_NAME),
              prettier.format(JSON.stringify(INIT_CONFIG), { parser: 'json' })
            )
            console.log(chalk.green('[INFO] run with initial configuration...'))
            resolve(INIT_CONFIG)
          })
        } else {
          resolve(fConfig)
        }
      })
    } else {
      resolve(fConfig)
    }
  })
}

export default checkConfig
