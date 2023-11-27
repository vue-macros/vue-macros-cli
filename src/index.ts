#! /usr/bin/env node
/* eslint-disable curly */
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
// const sg = path.resolve(path.dirname(__filename), '../node_modules/.bin/ast-grep')
const sg = 'sg'
const config = `${path.dirname(__filename)}/sgconfig`

let macro = await select({
  message: chalk.green(
    `Which vue macro do you want to use?`,
  ),
  choices: [
    { value: 'jsx-directive' },
    { value: 'setup-sfc' },
    { value: 'short-v-model' },
  ],
},
)

let render = 'export-render'
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

let defineSlots = 'define-slots'
if (['jsx-directive', 'setup-sfc'].includes(macro)) {
  defineSlots = await select({
    message: chalk.green(
      `Which define-slots macro do you want to use?`,
    ),
    choices: [
      { value: 'define-slots' },
      { value: 'define-short-slots' },
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

const targetDirectory = path.resolve(argv._.at(-1) || '.')

const files = await glob(`${targetDirectory}/**/*.vue`, {
  ignore: [
    '**/node_modules/**',
    argv.ignore,
  ].filter(Boolean),
})

// await Promise.all(files.map(async file => fs.move(file, `${file}.sg.html`)))

if (['jsx-directive', 'setup-sfc'].includes(macro)) {
  await $`${sg} scan -c ${config}.yml -U --filter '^v-(on|directive)' ${targetDirectory}`

  await $`${sg} scan -c ${config}.yml -U --filter '^${macro === 'setup-sfc' ? render : 'export-render'}' ${targetDirectory}`

  await $`${sg} scan -c ${config}.yml -U --filter '^setup-sfc' ${targetDirectory}`

  // await Promise.all(files.map(async file => fs.move(`${file}.sg.html`, `${file}.sg.tsx`)))

  await $`${sg} scan -c ${config}-tsx.yml -U --filter '^tsx v-' ${targetDirectory}`

  if (defineSlots === 'define-short-slots')
    await $`${sg} scan -c ${config}.yml -U --filter 'tsx define-short-slots' ${targetDirectory}`

  if (macro === 'setup-sfc') {
    await Promise.all(files.map(async file => fs.move(file, `${file.slice(0, -3)}setup.tsx`)))
  }
  else {
    await $`${sg} scan -c ${config}-tsx.yml -U --filter '^tsx sfc$' ${targetDirectory}`
    // await Promise.all(files.map(async file => fs.move(`${file}.sg.tsx`, file)))
  }
}
else {
  await $`${sg} scan -c ${config}.yml -U --filter ^${macro} ${targetDirectory}`
  // await Promise.all(files.map(async file => fs.move(`${file}.sg.html`, file)))
}
