export interface ExtConfig {
  outputPath: string
  rootPath: string
  extractOnly: boolean
  whiteList: string[]
  templateString?: {
    funcName: string
  }
  langs?: string[]
  /**
   * 远程API地址
   */
  origin?: string
  /**
   * 用户访问权限
   */
  accessKey?: string
  /**
   * 脚本运行环境: 用于写入i18n模板文件时做区分，外部不用传递
   */
  operatingEnv?: OperatingEnvEnum
}

export interface ExtCustomConfig extends Omit<ExtConfig, 'outputPath'> {}

export enum OperatingEnvEnum {
  BROWSER = 'BROWSER',
  NATIVE = 'NATIVE',
}
