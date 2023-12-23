import type { TSConfig } from 'pkg-types'
import { readTSConfig, writeTSConfig } from 'pkg-types'
import { fs } from 'zx'
import type { VueMacros } from '../common'
import { vueMacros } from '../common'

export async function rewriteTsConfig(selectedMacros: VueMacros, target: string) {
  const filename = `${target}/nuxt.config.ts`
  if (!await fs.pathExists(filename))
    return

  const tsconfig = await readTSConfig(target) as TSConfig & { vueCompilerOptions?: any }

  const macros = vueMacros.reduce((result, macro) => {
    if (macro.volar) {
      if (['stable', 'official'].includes(macro.status))
        result[macro.name] = true

      if (selectedMacros[macro.value])
        result[macro.name] = selectedMacros[macro.value]
    }
    return result
  }, {} as Record<
    typeof vueMacros[number]['name'],
    any
  >)

  const vueCompilerOptions = tsconfig.vueCompilerOptions ??= {}
  const plugins = vueCompilerOptions.plugins ??= []
  for (const [macro, options] of Object.entries(macros)) {
    if (macro === 'short-vmodel' && options !== true) {
      const vueMacros = vueCompilerOptions.vueMacros ??= {}
      vueMacros.shortVmodel = options
    }

    // prevent exportProps and exportExpose co-usage
    if (['export-props', 'export-expose'].includes(macro)) {
      const exportPropsIndex = plugins.indexOf(`@vue-macros/volar/export-props`)
      exportPropsIndex > -1 && plugins.splice(exportPropsIndex, 1)
      const exportExposeIndex = plugins.indexOf(`@vue-macros/volar/export-expose`)
      exportExposeIndex > -1 && plugins.splice(exportExposeIndex, 1)
    }

    if (!plugins.includes(`@vue-macros/volar/${macro}`))
      plugins.push(`@vue-macros/volar/${macro}`)
  }

  await writeTSConfig(`${target}/tsconfig.json`, tsconfig)
}
