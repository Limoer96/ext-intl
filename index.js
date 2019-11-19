var fd = require('./dist/index')
var path = require('path');
fd.traverse({
  outputPath: path.resolve(__dirname, 'i18n/'),
  rootPath: path.resolve(__dirname, 'testdir'),
  template: true,
  extractOnly: false,
  mode: 'depth',
  prefix: "import i18n from '@/i18n';\n"
})