import { checkbox, select } from '@inquirer/prompts'
import { chalk } from 'zx'
import type { VueMacros } from '../common'
import { experimentalMacros, stableMacros } from '../common'
import { rewriteNuxtConfig } from './nuxt'
import { rewriteTsConfig } from './tsconfig'
import { rewriteViteConfig } from './vite'
import { rewritePackage } from './package'

export async function init(target: string) {
  const selectedMacros = (await checkbox({
    message: chalk.green(`Which vue macros do you want to use?`),
    choices: [
      ...stableMacros.slice(-2),
      ...experimentalMacros,
    ],
    pageSize: 13,
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
    }) as any

    selectedMacros.shortVmodel = { prefix }
  }

  await rewriteConfig(selectedMacros, target)
}

export async function rewriteConfig(macros: VueMacros, target: string) {
  await rewriteNuxtConfig(macros, target)

  await rewriteViteConfig(macros, target)

  await rewriteTsConfig(macros, target)

  await rewritePackage(macros, target)
}
