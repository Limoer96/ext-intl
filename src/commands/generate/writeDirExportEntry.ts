import * as fs from 'fs'
import * as chalk from 'chalk'
import { isUseTs } from '../../utils/common'
import { formatFileWithConfig } from '../../utils/format'
import { ExtConfig } from '../config/interface'

/**
 * 给每个文件夹写入一个导出入口`index.js/ts`
 */
function writeDirExportEntry() {
  const { outputPath, langs } = <ExtConfig>global['intlConfig']
  const extname = '.' + (isUseTs ? 'ts' : 'js')
  // 处理文件路径
  for (const lang of langs) {
    const filePath = `${outputPath}/langs/${lang}/index${extname}`
    const exportFilePath = `${outputPath}/langs/${lang}/_index${extname}`
    if (!fs.existsSync(filePath)) {
      return
    }
    if (!fs.existsSync(exportFilePath)) {
      try {
        const content = `import index from './index'
        export default { index }`
        fs.writeFileSync(exportFilePath, formatFileWithConfig(content))
      } catch (error) {
        console.log(chalk.red(`[ERROR] ${error}`))
      }
    }
  }
}

export default writeDirExportEntry
