#! /usr/bin/env node
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { $, argv, chalk, fs, glob, path } from 'zx'
import { select } from '@inquirer/prompts'

if (argv._[0] !== 'sg') {
  console.log(chalk.red('Do you want to use `sg` cmd?'))
  process.exit()
}

$.verbose = false

const __filename = fileURLToPath(import.meta.url)
const sg = path.resolve(path.dirname(__filename), '../node_modules/.bin/ast-grep')
const config = `${path.dirname(__filename)}/sgconfig`

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

const target = path.resolve(argv._.at(-1) || '.')
async function toSetupSFC() {
  const filename = path.basename(target)
  const files = await glob(`${target}${filename ? '' : '/**/*.vue'}`, {
    ignore: [
      '**/node_modules/**',
    ],
  })

  await Promise.all(files.map(async file => fs.move(file, `${file.slice(0, -3)}setup.tsx`)))
}

async function useTsx(cb = () => {}, action = 'clean') {
  await $`${sg} scan -c ${config}.yml -U --filter '^setup-sfc start' ${target}`
  await $`${sg} scan -c ${config}.yml -U --filter '^setup-sfc end' ${target}`
  await cb()
  await $`${sg} scan -c ${config}-tsx.yml -U --filter '^setup-sfc ${action}' ${target}`
}

if (['jsx-directive', 'setup-sfc'].includes(macro)) {
  await $`${sg} scan -c ${config}.yml -U --filter '^v-' ${target}`
  await $`${sg} scan -c ${config}.yml -U --filter '^${macro === 'setup-sfc' ? 'export-render' : render}' ${target}`
  await useTsx(() => $`${sg} scan -c ${config}-tsx.yml -U --filter '^v-' ${target}`, macro === 'setup-sfc' ? 'delete' : 'clean')

  if (macro === 'setup-sfc')
    toSetupSFC()
}
else if (macro === 'define-slots') {
  await useTsx(() => $`${sg} scan -c ${config}-tsx.yml -U --filter '^define-slots' ${target}`)
}
else {
  await $`${sg} scan -c ${config}.yml -U --filter ^${macro} ${target}`
}
