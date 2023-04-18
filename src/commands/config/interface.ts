export interface ExtConfig {
  outputPath: string
  rootPath: string
  extractOnly: boolean
  whiteList: string[]
  uploadFilePath: string
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
}

export interface ExtCustomConfig extends Omit<ExtConfig, 'outputPath' | 'versionName'> {}
