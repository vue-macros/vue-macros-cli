import type { VueMacros } from '../common'
import { checkbox, select } from '@inquirer/prompts'
import { chalk } from 'zx'
import { experimentalMacros, officialMacros, stableMacros } from '../common'
import { rewriteNuxtConfig } from './nuxt'
import { rewritePackage } from './package'
import { rewriteTsConfig } from './tsconfig'
import { rewriteViteConfig } from './vite'

export async function init(target: string) {
  const selectedMacros = (await checkbox({
    message: chalk.green(`Which vue macros do you want to use?`),
    choices: [
      ...officialMacros.slice(-1),
      ...stableMacros.slice(-2),
      ...experimentalMacros,
    ],
    pageSize: 14,
  })).reduce((result, macro) => {
    result[macro] = true
    return result
  }, {} as VueMacros)

  if (selectedMacros.exportProps && selectedMacros.exportExpose) {
    const exportFeature = (await select({
      message: chalk.green(`Which export feature do you want to use?`),
      choices: [
        ...experimentalMacros.filter(macro => ['exportExpose', 'exportProps'].includes(macro.value)),
      ],
    }))
    delete selectedMacros[exportFeature === 'exportExpose' ? 'exportProps' : 'exportExpose']
  }

  if (selectedMacros.shortVmodel) {
    const prefix = await select({
      message: chalk.green(`Which prefix of short-vmodel do you want to use?`),
      choices: [
        { value: '$' },
        { value: '::' },
        { value: '*' },
      ],
    })

    selectedMacros.shortVmodel = { prefix }
  }

  if (selectedMacros.defineProp) {
    const edition = await select({
      message: chalk.green(
        `Which edition do you want to use?`,
      ),
      choices: [
        { name: 'kevinEdition', value: 'kevinEdition' },
        { name: 'johnsonEdition', value: 'johnsonEdition' },
      ],
    })

    selectedMacros.defineProp = { edition }
  }

  await rewriteConfig(selectedMacros, target)
}

export async function rewriteConfig(macros: VueMacros, target: string) {
  await rewriteNuxtConfig(macros, target)

  await rewriteViteConfig(macros, target)

  await rewriteTsConfig(macros, target)

  await rewritePackage(macros, target)
}
