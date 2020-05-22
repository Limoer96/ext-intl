#!/usr/bin/env node

const args = process.argv.slice(2)
const intl = require('./dist/bundle.min.js')

function _findIndex(args) {
  let expected = ['--config', '-p']
  for (let i = 0; i < args.length; i += 1) {
    if (expected.indexOf(args[i]) > -1) {
      return i
    }
  }
  return -1
}

const index = _findIndex(args)

if (index > -1) {
  let params = [...args]
  const configPath = params[1]
  const config = require(configPath)
  intl.traverse(config)
}
