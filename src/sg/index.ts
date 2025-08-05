import { fileURLToPath } from 'node:url'
import { select } from '@inquirer/prompts'
import { $, chalk, fs, glob, path } from 'zx'
import { camelize } from '../common'
import { rewriteConfig } from '../init/index'

async function toSetupSFC(target: string) {
  const extname = path.extname(target)
  const files = await glob(`${target}${extname ? '' : '/**/*.vue'}`, {
    ignore: [
      '**/node_modules/**',
    ],
  })

  await Promise.all(files.map(async file => fs.move(file, `${file.slice(0, -3)}setup.tsx`)))
}

export async function sg(target: string) {
  let macro = await select({
    message: chalk.green(
      `Which vue macro do you want to use?`,
    ),
    choices: [
      { value: 'jsx-directive' },
      { value: 'setup-sfc' },
      { value: 'short-vmodel' },
      { value: 'define-slots' },
    ],
  })

  if (macro === 'jsx-directive') {
    macro = await select({
      message: chalk.green(
        `Which render macro do you want to use?`,
      ),
      choices: [
        { value: 'define-render' },
        { value: 'export-render' },
      ],
    })
  }

  if (macro === 'short-vmodel') {
    macro = await select({
      message: chalk.green(
        `Which prefix do you want to use?`,
      ),
      choices: [
        { name: '$', value: 'short-vmodel 0', description: '$foo="foo"' },
        { name: '::', value: 'short-vmodel 1', description: '::foo="foo"' },
        { name: '*', value: 'short-vmodel 2', description: '*foo="foo"' },
      ],
    })
  }

  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const config = `${dirname}/sg/sgconfig`
  const sg = path.resolve(dirname, '../node_modules/.bin/ast-grep')
  async function useTsx(cb = () => {}, action = 'clean') {
    await $`${sg} scan -c ${config}.yml -U --filter '^setup-sfc start' ${target}`
    await $`${sg} scan -c ${config}.yml -U --filter '^setup-sfc end' ${target}`
    await cb()
    await $`${sg} scan -c ${config}-tsx.yml -U --filter '^setup-sfc ${action}' ${target}`
  }

  if (['setup-sfc', 'define-render', 'export-render'].includes(macro)) {
    await $`${sg} scan -c ${config}.yml -U --filter '^self-closing-tag' ${target}`
    await $`${sg} scan -c ${config}.yml -U --filter '^dot-to-underline' ${target}`
    await $`${sg} scan -c ${config}.yml -U --filter '^v-' ${target}`
    await $`${sg} scan -c ${config}.yml -U --filter '^${macro === 'setup-sfc' ? 'export-render' : macro}' ${target}`
    await useTsx(async () => {
      await $`${sg} scan -c ${config}-tsx.yml -U --filter '^v-' ${target}`
      await $`${sg} scan -c ${config}-tsx.yml -U --filter '^define-emits' ${target}`
    }, macro === 'setup-sfc' ? 'delete' : 'clean')

    const macros: any = { jsxDirective: true, defineRender: true }
    if (macro === 'setup-sfc') {
      await toSetupSFC(target)
      macros.setupSFC = true
    }
    else {
      macros[camelize(macro)] = true
    }
    await rewriteConfig(macros, target)
  }
  else if (macro === 'define-slots') {
    await useTsx(() => $`${sg} scan -c ${config}-tsx.yml -U --filter '^define-slots' ${target}`)
    await rewriteConfig({ defineSlots: true }, target)
  }
  else if (macro.startsWith('short-vmodel')) {
    await $`${sg} scan -c ${config}.yml -U --filter ^${macro} ${target}`
    await rewriteConfig({
      shortVmodel: {
        prefix: ['$', '::', '*'][+macro.split(' ')[1]],
      },
    }, target)
  }
}
