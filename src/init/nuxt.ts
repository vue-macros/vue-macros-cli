import { loadFile, writeFile } from 'magicast'
import { addNuxtModule, getDefaultExportOptions } from 'magicast/helpers'
import { fs } from 'zx'
import type { VueMacros } from '../common'

export async function rewriteNuxtConfig(macros: VueMacros, target: string) {
  const filename = `${target}/nuxt.config.ts`
  if (!await fs.pathExists(filename))
    return

  const config = await loadFile(filename)

  const defaultExport = getDefaultExportOptions(config)
  if (!defaultExport)
    return

  addNuxtModule(config, '@vue-macros/nuxt', 'macros', macros)

  // prevent exportProps and exportExpose co-usage
  const vueMacrosOptions = getDefaultExportOptions(config).macros
  for (const macro of Object.keys(macros)) {
    if (['exportProps', 'exportExpose'].includes(macro))
      delete vueMacrosOptions[macro === 'exportProps' ? 'exportExpose' : 'exportProps']
  }

  await writeFile(config, filename)
}
