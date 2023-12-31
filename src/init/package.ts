import { fileURLToPath } from 'node:url'
import { readPackageJSON } from 'pkg-types'
import { $, path } from 'zx'
import type { VueMacros } from '../common'

export async function rewritePackage(macros: VueMacros, target: string) {
  const packageJson = await readPackageJSON(target)
  if (!packageJson)
    return

  const ni = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../node_modules/.bin/ni',
  )

  async function installDeps(deps: string[]) {
    const devDeps = deps.filter(dep =>
      !packageJson.dependencies?.[dep]
      && !packageJson.devDependencies?.[dep]
      && !packageJson.peerDependencies?.[dep]
      && !packageJson.optionalDependencies?.[dep],
    )

    if (devDeps.length)
      return $`${ni} ${devDeps} -D`
  }

  const deps = [
    '@vue-macros/volar',
    '@vitejs/plugin-vue',
    'unplugin-vue-macros',
    'typescript',
  ]
  if (macros.jsxDirective || macros.setupSFC)
    deps.push('@vitejs/plugin-vue-jsx')

  await installDeps(deps)
}
