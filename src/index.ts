import { toArray } from '@unocss/core'
import type { SourceCodeTransformer } from '@unocss/core'
import { js } from '@ast-grep/napi'

export type FilterPattern = Array<string | RegExp> | string | RegExp | null

function createFilter(
  include: FilterPattern,
  exclude: FilterPattern,
): (id: string) => boolean {
  const includePattern = toArray(include || [])
  const excludePattern = toArray(exclude || [])
  return (id: string) => {
    if (excludePattern.some(p => id.match(p)))
      return false
    return includePattern.some(p => id.match(p))
  }
}

export interface TransformerAttributifyJsxOptions {
  /**
   * the list of attributes to ignore
   * @default []
   */
  blocklist?: (string | RegExp)[]

  /**
   * Regex of modules to be included from processing
   * @default [/\.[jt]sx$/, /\.mdx$/]
   */
  include?: FilterPattern

  /**
   * Regex of modules to exclude from processing
   *
   * @default []
   */
  exclude?: FilterPattern
}

export default function transformerAttributifyJsxSg(
  options: TransformerAttributifyJsxOptions = {},
): SourceCodeTransformer {
  const { blocklist = [] } = options

  const isBlocked = (matchedRule: string) => {
    for (const blockedRule of blocklist) {
      if (blockedRule instanceof RegExp) {
        if (blockedRule.test(matchedRule))
          return true
      }
      else if (matchedRule === blockedRule) {
        return true
      }
    }

    return false
  }

  const idFilter = createFilter(
    options.include || [/\.[jt]sx$/, /\.mdx$/],
    options.exclude || [],
  )

  return {
    name: '@unocss/transformer-attributify-jsx-sg',
    enforce: 'pre',
    idFilter,
    async transform(code, _, { uno }) {
      const tasks: Promise<void>[] = []

      const ast = await js.parseAsync(code.original)
      const root = ast.root()
      const nodes = root.findAll({
        rule: {
          kind: 'jsx_attribute',
          not: {
            has: {
              any: [{ kind: 'jsx_expression' }, { kind: 'string' }],
            },
          },
        },
      })

      for (const node of nodes) {
        const range = node.range()
        const matchedRule = node.text().replace(/:/i, '-')
        if (isBlocked(matchedRule))
          continue

        tasks.push(
          uno.parseToken(matchedRule).then((matched) => {
            if (matched) {
              code.overwrite(
                range.start.index,
                range.end.index,
                `${matchedRule}=""`,
              )
            }
          }),
        )
      }

      await Promise.all(tasks)
    },
  }
}
