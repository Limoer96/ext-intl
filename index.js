var fd = require('./dist/index')
var path = require('path');
fd.traverse({
  outputPath: path.resolve(__dirname, 'i18n/'),
  rootPath: path.resolve(__dirname, 'testdir'),
  template: true,
  extractOnly: true,
  mode: 'depth'
})