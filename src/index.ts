#! /usr/bin/env node
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { $, argv, chalk, fs, glob, path } from 'zx'
import { select } from '@inquirer/prompts'
import { readPackageJSON } from 'pkg-types'

function printHelp() {
  console.log(`
Rewriting at Vue Macros using ast-grep.

${chalk.underline('Usage:')} vue-macros <command> [directory] 

${chalk.underline('Directory:')}
  default current directory

${chalk.underline('Commands:')}
  sg        Rewrite code in specified directory
 
${chalk.underline('Options:')}
  -h, --help    Print help (see more with '--help')
  -v, --version Print version
  `)
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
if (argv.v || argv.version) {
  const localPackageJson = await readPackageJSON(dirname)
  console.log(`${localPackageJson.name} ${localPackageJson.version}`)
  process.exit()
}

if (argv._[0] !== 'sg' || argv.help || argv.h) {
  printHelp()
  process.exit()
}

$.verbose = false

let macro = await select({
  message: chalk.green(
    `Which vue macro do you want to use?`,
  ),
  choices: [
    { value: 'jsx-directive' },
    { value: 'setup-sfc' },
    { value: 'short-v-model' },
    { value: 'define-slots' },
  ],
})

let render
if (macro === 'jsx-directive') {
  render = await select({
    message: chalk.green(
      `Which render macro do you want to use?`,
    ),
    choices: [
      { value: 'define-render' },
      { value: 'export-render' },
    ],
  })
}

if (macro === 'short-v-model') {
  macro = await select({
    message: chalk.green(
      `Which prefix do you want to use?`,
    ),
    choices: [
      { name: '$', value: 'short-v-model 1', description: '$foo="foo"' },
      { name: '::', value: 'short-v-model 2', description: '::foo="foo"' },
      { name: '*', value: 'short-v-model 3', description: '*foo="foo"' },
    ],
  })
}

const target = path.resolve(argv._.at(1) || './src')
async function toSetupSFC() {
  const extname = path.extname(target)
  const files = await glob(`${target}${extname ? '' : '/**/*.vue'}`, {
    ignore: [
      '**/node_modules/**',
    ],
  })

  await Promise.all(files.map(async file => fs.move(file, `${file.slice(0, -3)}setup.tsx`)))
}

const config = `${dirname}/sgconfig`
const sg = path.resolve(dirname, '../node_modules/.bin/ast-grep')
async function useTsx(cb = () => {}, action = 'clean') {
  await $`${sg} scan -c ${config}.yml -U --filter '^setup-sfc start' ${target}`
  await $`${sg} scan -c ${config}.yml -U --filter '^setup-sfc end' ${target}`
  await cb()
  await $`${sg} scan -c ${config}-tsx.yml -U --filter '^setup-sfc ${action}' ${target}`
}

if (['jsx-directive', 'setup-sfc'].includes(macro)) {
  await $`${sg} scan -c ${config}.yml -U --filter '^self-closing-tag' ${target}`
  await $`${sg} scan -c ${config}.yml -U --filter '^v-' ${target}`
  await $`${sg} scan -c ${config}.yml -U --filter '^${macro === 'setup-sfc' ? 'export-render' : render}' ${target}`
  await useTsx(async () => {
    await $`${sg} scan -c ${config}-tsx.yml -U --filter '^v-' ${target}`
    await $`${sg} scan -c ${config}-tsx.yml -U --filter '^define-emits' ${target}`
  }, macro === 'setup-sfc' ? 'delete' : 'clean')

  if (macro === 'setup-sfc')
    toSetupSFC()
}
else if (macro === 'define-slots') {
  await useTsx(() => $`${sg} scan -c ${config}-tsx.yml -U --filter '^define-slots' ${target}`)
}
else {
  await $`${sg} scan -c ${config}.yml -U --filter ^${macro} ${target}`
}
