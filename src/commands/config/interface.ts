export interface ExtConfig {
  outputPath: string
  rootPath: string
  extractOnly: boolean
  whiteList: string[]
  prefix?: string[]
  templateString?: {
    funcName: string
  }
  langs?: string[]
  /**
   * 字段命名前缀
   */
  fieldPrefix?: string
  /**
   * 当次运行的版本名
   */
  versionName?: string
  /**
   * 远程API地址
   */
  origin?: string
  /**
   * 用户访问权限
   */
  accessKey?: string
  /**
   * 语言映射（key作为当前多语言脚本语言，value作词库平台支持语言）
   */
  langMapper?: Record<string, string>
  /**
   * 脚本运行环境: 用于写入i18n模板文件时做区分，外部不用传递
   */
  operatingEnv?: OperatingEnvEnum
}

export interface ExtCustomConfig extends Omit<ExtConfig, 'outputPath' | 'versionName'> {}

export enum OperatingEnvEnum {
  BROWSER = 'BROWSER',
  NATIVE = 'NATIVE',
}
