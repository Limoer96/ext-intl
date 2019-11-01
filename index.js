var fd = require('./dist/index')
var path = require('path');
fd.traverse({
  outputPath: path.resolve(__dirname, 'output.js'),
  rootPath: path.resolve(__dirname, 'test'),
  template: false
})