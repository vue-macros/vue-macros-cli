import type { ProxifiedFunctionCall } from 'magicast'
import type { VueMacros } from '../common'
import { loadFile, writeFile } from 'magicast'
import { addVitePlugin, findVitePluginCall, getDefaultExportOptions, updateVitePluginConfig } from 'magicast/helpers'
import { fs } from 'zx'

export async function rewriteViteConfig(macros: VueMacros, target: string) {
  const filename = `${target}/vite.config.ts`
  if (!await fs.pathExists(filename))
    return

  const config = await loadFile(filename)

  function getVitePlugin(from: string, constructor: string) {
    const plugin = findVitePluginCall(config, from)
    if (!plugin && !config.imports.$items.find(item => item.from === from)) {
      addVitePlugin(config, {
        from,
        constructor,
      })
    }

    return findVitePluginCall(config, from)
  }

  const vueMacros = getVitePlugin('unplugin-vue-macros/vite', 'VueMacros')
  if (!vueMacros)
    return

  const vueMacrosOptions = vueMacros.$args[0] ??= {} as any

  const vue: ProxifiedFunctionCall = vueMacrosOptions?.plugins?.vue || getVitePlugin('@vitejs/plugin-vue', 'Vue')
  if (vue && macros.setupSFC) {
    vue.$args[0] ?? vue.$args.push({})
    const arg = vue.$args[0] as any
    arg.include ??= [/\.vue$/, /\.setup\.[cm]?[jt]sx?$/]
  }

  const vueJsx: ProxifiedFunctionCall = vueMacrosOptions?.plugins?.vueJsx || getVitePlugin('@vitejs/plugin-vue-jsx', 'VueJsx')

  updateVitePluginConfig(config, 'unplugin-vue-macros/vite', {
    ...macros,
    plugins: {
      ...vue ? { vue } : {},
      ...vueJsx ? { vueJsx } : {},
    },
  })

  // prevent exportProps and exportExpose co-usage
  for (const macro of Object.keys(macros)) {
    if (['exportProps', 'exportExpose'].includes(macro))
      delete vueMacrosOptions[macro === 'exportProps' ? 'exportExpose' : 'exportProps']
  }

  // remove vue & vueJsx in vite plugins
  const plugins = getDefaultExportOptions(config).plugins ??= []
  const vueIndex = plugins.findIndex((plugin: any) => plugin.$callee === vue?.$callee)
  vueIndex > -1 && plugins.splice(vueIndex, 1)
  const vueJsxIndex = plugins.findIndex((plugin: any) => plugin.$callee === vueJsx?.$callee)
  vueJsxIndex > -1 && plugins.splice(vueJsxIndex, 1)

  await writeFile(config, filename)
}
