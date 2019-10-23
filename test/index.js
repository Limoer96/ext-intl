var fd = require('../dist/index')
var path = require('path');
fd.traverse({
  outputPath: path.resolve(__dirname, 'output.txt'),
  rootPath: path.resolve(__dirname)
})
