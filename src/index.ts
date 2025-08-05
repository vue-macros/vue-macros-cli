#! /usr/bin/env node
import { readPackageJSON } from 'pkg-types'
import { $, argv, chalk, path } from 'zx'
import { init } from './init/index'
import { sg } from './sg'

function printHelp() {
  console.log(`
Rewriting at Vue Macros using ast-grep.

${chalk.underline('Usage:')} vue-macros <command> [directory] 

${chalk.underline('Directory:')}
  default current directory

${chalk.underline('Commands:')}
  sg        Rewrite code in specified directory
  init      Auto config for Vue Macros
 
${chalk.underline('Options:')}
  -h, --help    Print help (see more with '--help')
  -v, --version Print version
  `)
}

const target = path.resolve(argv._.at(1) || '.')
if (argv.v || argv.version) {
  const localPackageJson = await readPackageJSON(import.meta.url)
  console.log(`${localPackageJson.name} ${localPackageJson.version}`)
}
else if (argv._[0] === 'init') {
  await init(target)
}
else if (argv._[0] === 'sg') {
  $.verbose = false
  sg(target)
}
else {
  printHelp()
}
