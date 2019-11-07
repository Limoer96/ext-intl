#!/usr/bin/env node

const args = process.argv.slice(2)
import { traverse } from './dist/index'

function _findIndex(args) {
  let expected = ['--config', '-p'];
  for (let i = 0; i < args.length; i += 1) {
    if (expected.indexOf(args[i]) > -1) {
      return i;
    }
  }
  return -1;
}

const index = _findIndex(args)

if (index > -1) {
  let params = [...args]
  params.splice(index, 1)
  const configPath = params[0]
  const config = require(configPath)
  traverse(config)
}

