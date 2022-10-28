import type { InputPlugin, Options } from '../shared'

import { swcTransformer, filter } from '../shared'

import { rewriteImportStyles } from './rewrite'
import { createStyleClassStatement } from './statement'
import { transform } from './transform'

export { createStyleClassStatement, rewriteImportStyles }

export function styles(options: Options = {}) {
  const vite = (typeof options.vite == 'boolean') ? options.vite: true
  const exclude = options.exclude || []

  const cssfilter = filter('css', exclude)
  const tsJsFilter = filter('js', exclude)

  return {
    name: 'styles',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (tsJsFilter(id)) {
        return swcTransformer(code, id, {
          paths: options.paths,
          plugins: [ rewriteImportStyles(), createStyleClassStatement() ]
        })
      }
      if (cssfilter(id) && (!vite)) {
        return transform(code, id, options.minify ? { style: 'compressed' }: {})
      }
      return null
    }
  } as InputPlugin
}